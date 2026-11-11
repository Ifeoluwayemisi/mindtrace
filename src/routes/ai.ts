import { Router, Request, Response } from 'express';
import { generateAiReasoning } from '../services/aiReasoningService';

export const aiRouter = Router();

aiRouter.post('/explain', async (req: Request, res: Response): Promise<void> => {
  try {
    const { equation, topic, studentSteps, deterministicDiagnosis, studentGradeLevel } = req.body;

    if (!equation || !studentSteps || !deterministicDiagnosis) {
      res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required parameters: equation, studentSteps, or deterministicDiagnosis.',
      });
      return;
    }

    const reasoning = await generateAiReasoning({
      equation,
      topic: topic || 'Linear Equations',
      studentSteps: Array.isArray(studentSteps) ? studentSteps : [],
      deterministicDiagnosis,
      studentGradeLevel,
    });

    res.json({
      success: true,
      data: reasoning,
    });
  } catch (err: any) {
    console.error('Error in POST /api/ai/explain:', err);
    res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process AI reasoning request.',
    });
  }
});
