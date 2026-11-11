import argon2 from 'argon2';
import crypto from 'crypto';

// Server-side pepper from environment variable (never exposed to client)
const ARGON2_PEPPER = process.env.ARGON2_PEPPER || 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9';

/**
 * Hash password securely using Argon2id with server pepper
 */
export async function hashPassword(password: string): Promise<string> {
  const peppered = password + ARGON2_PEPPER;
  return argon2.hash(peppered, {
    type: argon2.argon2id,
    memoryCost: 65536, // 64 MB
    timeCost: 3,
    parallelism: 4,
  });
}

/**
 * Verify password against stored Argon2id hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  try {
    const peppered = password + ARGON2_PEPPER;
    return await argon2.verify(hash, peppered);
  } catch (_err) {
    return false;
  }
}

/**
 * Generate cryptographically secure random UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}

/**
 * Generate SHA-256 hash for canonical string
 */
export function computeSHA256(content: string): string {
  return crypto.createHash('sha256').update(content).digest('hex');
}

/**
 * Compute canonical payload hash for a diagnostic attempt
 */
export function computeCanonicalPayloadHash(
  questionId: string,
  equation: string,
  workingSteps: any,
  finalAnswer: string | null
): string {
  const normalizedSteps = Array.isArray(workingSteps)
    ? workingSteps.map((s) => ({
        stepNumber: s.stepNumber,
        mathExpression: (s.mathExpression || '').trim().replace(/\s+/g, ' '),
      }))
    : [];

  const canonicalObj = {
    questionId: questionId.trim(),
    equation: equation.trim().replace(/\s+/g, ' '),
    workingSteps: normalizedSteps,
    finalAnswer: (finalAnswer || '').trim().replace(/\s+/g, ' '),
  };

  return computeSHA256(JSON.stringify(canonicalObj));
}
