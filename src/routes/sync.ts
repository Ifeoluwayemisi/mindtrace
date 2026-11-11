import { Router, Request, Response } from 'express';
import { eq, and, sql } from 'drizzle-orm';
import {
  db,
  diagnosticAttempts,
  diagnosticMisconceptions,
  rewardTransactions,
  studentProfiles,
} from '../db/index';
import { requireAuth, csrfProtection } from '../middleware/authMiddleware';
import { computeCanonicalPayloadHash, generateUUID } from '../services/serverAuth';
import { evaluateStudentSubmission } from '../services/edgeRuleEngine';
import { QUESTION_BANK } from '../data/questionBank';

export const syncRouter = Router();

interface BatchSyncItem {
  id: string; // Client UUID v4
  questionId: string;
  equation: string;
  workingSteps: any[];
  finalAnswer: string | null;
  clientTimestamp: string;
}

/**
 * POST /api/sync/batch
 * Synchronizes offline diagnostic attempts and calculates server-authoritative XP rewards & mastery
 */
syncRouter.post('/batch', requireAuth, csrfProtection, async (req: Request, res: Response) => {
  const studentId = req.session.userId!;
  const { attempts } = req.body;

  if (!Array.isArray(attempts) || attempts.length === 0) {
    res.status(400).json({
      error: 'Invalid Payload',
      message: 'Batch synchronization payload must contain a non-empty "attempts" array.',
    });
    return;
  }

  const itemizedResults: any[] = [];
  let processedCount = 0;
  let acceptedCount = 0;
  let rejectedCount = 0;

  for (const item of attempts as BatchSyncItem[]) {
    processedCount++;

    if (!item.id || !item.questionId || !item.equation) {
      itemizedResults.push({
        attemptId: item.id || 'unknown',
        status: 'REJECTED_MALFORMED',
        errorCode: 'MISSING_REQUIRED_FIELDS',
        errorMessage: 'Attempt payload is missing required question or id fields.',
      });
      rejectedCount++;
      continue;
    }

    const canonicalHash = computeCanonicalPayloadHash(
      item.questionId,
      item.equation,
      item.workingSteps,
      item.finalAnswer
    );

    try {
      // 1. Check existing attempt by client UUID
      const existing = await db
        .select()
        .from(diagnosticAttempts)
        .where(eq(diagnosticAttempts.id, item.id))
        .limit(1);

      if (existing.length > 0) {
        const prev = existing[0];

        // Ownership check
        if (prev.studentId !== studentId) {
          itemizedResults.push({
            attemptId: item.id,
            status: 'REJECTED_CONFLICT',
            errorCode: 'ATTEMPT_OWNERSHIP_CONFLICT',
            errorMessage: 'Attempt ID is registered to a different account.',
          });
          rejectedCount++;
          continue;
        }

        // Payload hash consistency check
        if (prev.payloadHash === canonicalHash) {
          acceptedCount++;
          itemizedResults.push({
            attemptId: item.id,
            status: 'ACCEPTED_DUPLICATE',
            validationStatus: prev.validationStatus,
            serverIsCorrect: prev.serverIsCorrect,
            primaryMisconception: prev.serverPrimaryMisconception,
            authoritativeXpAwarded: 0, // No double XP
          });
          continue;
        } else {
          rejectedCount++;
          itemizedResults.push({
            attemptId: item.id,
            status: 'REJECTED_CONFLICT',
            errorCode: 'PAYLOAD_HASH_MISMATCH',
            errorMessage: 'Attempt ID was previously submitted with a different payload.',
          });
          continue;
        }
      }

      // 2. Locate benchmark question and independently re-validate working steps on server
      const benchmarkQuestion =
        QUESTION_BANK.find((q) => q.id === item.questionId) || QUESTION_BANK[0];

      const serverDiagnosis = evaluateStudentSubmission(
        benchmarkQuestion,
        item.workingSteps || [],
        item.finalAnswer || ''
      );

      const clientTs = item.clientTimestamp ? new Date(item.clientTimestamp).toISOString() : new Date().toISOString();

      // 3. Insert diagnostic attempt record
      await db.insert(diagnosticAttempts).values({
        id: item.id,
        studentId,
        questionId: item.questionId,
        questionVersion: 1,
        engineVersion: '1.2',
        equation: item.equation,
        workingSteps: item.workingSteps || [],
        finalAnswer: item.finalAnswer ? item.finalAnswer.trim() : null,
        payloadHash: canonicalHash,
        serverIsCorrect: serverDiagnosis.isCorrect,
        serverPrimaryMisconception: serverDiagnosis.misconceptionCode,
        validationStatus: 'VALIDATED',
        clientTimestamp: clientTs as any,
      });

      // 4. Insert detailed findings into diagnostic_misconceptions
      if (!serverDiagnosis.isCorrect && serverDiagnosis.misconceptionCode) {
        await db.insert(diagnosticMisconceptions).values({
          id: generateUUID(),
          attemptId: item.id,
          misconceptionCode: serverDiagnosis.misconceptionCode,
          confidenceScore: 100,
          supportingEvidence: {
            faultyStepNumber: serverDiagnosis.faultyStepNumber,
            faultyExpression: serverDiagnosis.faultyExpression,
            expectedExpression: serverDiagnosis.expectedExpression,
          },
        });
      }

      // 5. Authoritative Reward Calculations & Idempotent Ledger Insertions
      let earnedXp = 0;

      // Base reward for completing diagnostic attempt: +10 XP
      const tx1Id = generateUUID();
      const reward1 = await db
        .insert(rewardTransactions)
        .values({
          id: tx1Id,
          studentId,
          activityType: 'diagnostic_complete',
          referenceId: item.id,
          pointsAwarded: 10,
          description: `Completed diagnostic problem: ${item.equation}`,
        })
        .onConflictDoNothing()
        .returning();

      if (reward1.length > 0) earnedXp += 10;

      // Bonus reward for providing complete intermediate steps: +5 XP
      const stepCount = (item.workingSteps || []).filter(
        (s) => s.mathExpression && s.mathExpression.trim().length > 0
      ).length;

      if (stepCount >= 2) {
        const tx2Id = generateUUID();
        const reward2 = await db
          .insert(rewardTransactions)
          .values({
            id: tx2Id,
            studentId,
            activityType: 'working_steps_provided',
            referenceId: `${item.id}_steps`,
            pointsAwarded: 5,
            description: 'Provided complete intermediate working steps',
          })
          .onConflictDoNothing()
          .returning();

        if (reward2.length > 0) earnedXp += 5;
      }

      acceptedCount++;
      itemizedResults.push({
        attemptId: item.id,
        status: 'ACCEPTED',
        validationStatus: 'VALIDATED',
        serverIsCorrect: serverDiagnosis.isCorrect,
        primaryMisconception: serverDiagnosis.misconceptionCode,
        authoritativeXpAwarded: earnedXp,
      });
    } catch (err: any) {
      console.error(`Error processing attempt ${item.id}:`, err);
      rejectedCount++;
      itemizedResults.push({
        attemptId: item.id,
        status: 'REJECTED_SERVER_ERROR',
        errorCode: 'TRANSACTION_FAILED',
        errorMessage: 'Database transaction error processing attempt.',
      });
    }
  }

  // 6. Calculate authoritative student profile aggregates from DB ledger
  try {
    const xpQuery = await db
      .select({ totalXp: sql<number>`COALESCE(SUM(${rewardTransactions.pointsAwarded}), 0)` })
      .from(rewardTransactions)
      .where(eq(rewardTransactions.studentId, studentId));

    const totalXp = Number(xpQuery[0]?.totalXp || 0);

    // Calculate accuracy percentage over student's last 20 attempts
    const recentAttempts = await db
      .select({ isCorrect: diagnosticAttempts.serverIsCorrect })
      .from(diagnosticAttempts)
      .where(and(eq(diagnosticAttempts.studentId, studentId), eq(diagnosticAttempts.validationStatus, 'VALIDATED')))
      .limit(20);

    let masteryPercentage: number | null = null;
    if (recentAttempts.length > 0) {
      const correctCount = recentAttempts.filter((a: any) => a.isCorrect === true || a.isCorrect === 1).length;
      masteryPercentage = Math.round((correctCount / recentAttempts.length) * 100);
    }

    // Update student profile aggregates
    await db
      .update(studentProfiles)
      .set({
        totalXp,
        masteryPercentage,
        updatedAt: new Date().toISOString() as any,
      })
      .where(eq(studentProfiles.id, studentId));

    const updatedProfiles = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.id, studentId))
      .limit(1);

    res.json({
      success: true,
      processedCount,
      acceptedCount,
      rejectedCount,
      itemizedResults,
      authoritativeProfile: updatedProfiles[0] || null,
      serverTimestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('Error computing authoritative profile aggregates:', err);
    res.json({
      success: true,
      processedCount,
      acceptedCount,
      rejectedCount,
      itemizedResults,
      serverTimestamp: new Date().toISOString(),
    });
  }
});
