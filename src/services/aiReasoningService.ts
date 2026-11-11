import { GoogleGenAI, Type } from '@google/genai';
import { DiagnosisResult } from '../types';

export interface AiReasoningRequest {
  equation: string;
  topic: string;
  studentSteps: string[];
  deterministicDiagnosis: DiagnosisResult;
  studentGradeLevel?: string;
}

export interface AiReasoningResponse {
  isAiGenerated: boolean;
  contextualExplanation: string;
  reasoningConfidence: number;
  supportingEvidence: string[];
  pedagogicalSuggestion: string;
  shouldAbstain: boolean;
  provider: 'gemini-3.8-flash' | 'deterministic-fallback';
}

/**
 * Controlled AI Reasoning Layer for MindTrace backend.
 * Uses gemini-3.8-flash for structured pedagogical reasoning without overriding
 * deterministic diagnostic rules or awarding XP independently.
 */
export async function generateAiReasoning(
  payload: AiReasoningRequest
): Promise<AiReasoningResponse> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return buildDeterministicFallback(
      payload,
      'GEMINI_API_KEY environment variable is not configured. Using edge diagnostic explanation.'
    );
  }

  try {
    const aiCall = async (): Promise<AiReasoningResponse> => {
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `You are an expert secondary school mathematics tutor specializing in WAEC and JAMB curricula (SS1-SS3 level, age 14-18).
Analyze the following student working for the math equation: ${payload.equation} (Topic: ${payload.topic}).

Student's Submitted Steps:
${payload.studentSteps.map((s, idx) => `Line ${idx + 1}: ${s}`).join('\n')}

Edge Engine Diagnostic Baseline:
- Misconception Code: ${payload.deterministicDiagnosis.misconceptionCode}
- Edge Diagnosis Title: ${payload.deterministicDiagnosis.title}
- Identified Faulty Step: ${payload.deterministicDiagnosis.faultyStepNumber ? `Line ${payload.deterministicDiagnosis.faultyStepNumber}` : 'None'}

Your Task:
Provide a clear, encouraging, mathematically rigorous, and age-appropriate explanation tailored to a Nigerian secondary school student.
- DO NOT invent new errors if the working is mathematically correct.
- IF confidence is low (< 0.60) or evidence is ambiguous, set shouldAbstain to true.
- DO NOT award XP or grades. Maintain standard WAEC mathematical vocabulary.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              contextualExplanation: {
                type: Type.STRING,
                description: 'Clear pedagogical explanation of student working and misconception for SS1-SS3 students.',
              },
              reasoningConfidence: {
                type: Type.NUMBER,
                description: 'Confidence score between 0.00 and 1.00.',
              },
              supportingEvidence: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: 'Array of specific line references and mathematical principles identified.',
              },
              pedagogicalSuggestion: {
                type: Type.STRING,
                description: 'Targeted next step or hint to resolve the mathematical error.',
              },
              shouldAbstain: {
                type: Type.BOOLEAN,
                description: 'True if confidence is low (< 0.60) or line-by-line evidence is insufficient.',
              },
            },
            required: [
              'contextualExplanation',
              'reasoningConfidence',
              'supportingEvidence',
              'pedagogicalSuggestion',
              'shouldAbstain',
            ],
          },
          temperature: 0.2,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        return buildDeterministicFallback(payload, 'Empty AI response received.');
      }

      const parsed = JSON.parse(responseText);
      const confidence = typeof parsed.reasoningConfidence === 'number' ? parsed.reasoningConfidence : 0.85;
      const shouldAbstain = Boolean(parsed.shouldAbstain) || confidence < 0.60;

      return {
        isAiGenerated: !shouldAbstain,
        contextualExplanation: parsed.contextualExplanation || payload.deterministicDiagnosis.explanation,
        reasoningConfidence: Math.min(1.0, Math.max(0.0, confidence)),
        supportingEvidence: Array.isArray(parsed.supportingEvidence)
          ? parsed.supportingEvidence
          : [payload.deterministicDiagnosis.explanation],
        pedagogicalSuggestion:
          parsed.pedagogicalSuggestion || payload.deterministicDiagnosis.pedagogicalEmpathyNote,
        shouldAbstain,
        provider: 'gemini-3.8-flash',
      };
    };

    const timeout = new Promise<AiReasoningResponse>((resolve) => {
      setTimeout(() => {
        resolve(
          buildDeterministicFallback(
            payload,
            'Gemini API request timed out after 2000ms. Falling back to edge engine.'
          )
        );
      }, 2000);
    });

    return await Promise.race([aiCall(), timeout]);
  } catch (err: any) {
    console.warn('AI reasoning call failed, using edge diagnostic fallback:', err?.message || err);
    return buildDeterministicFallback(payload, err?.message || 'AI API invocation failed.');
  }
}

function buildDeterministicFallback(
  payload: AiReasoningRequest,
  reason: string
): AiReasoningResponse {
  return {
    isAiGenerated: false,
    contextualExplanation: payload.deterministicDiagnosis.explanation,
    reasoningConfidence: 1.0,
    supportingEvidence: [
      `Deterministic Edge Rule: ${payload.deterministicDiagnosis.misconceptionCode}`,
      `Faulty Line: ${payload.deterministicDiagnosis.faultyStepNumber || 'N/A'}`,
    ],
    pedagogicalSuggestion: payload.deterministicDiagnosis.pedagogicalEmpathyNote,
    shouldAbstain: false,
    provider: 'deterministic-fallback',
  };
}
