import { Request, Response } from 'express';
import { QuizScoreUseCase } from '../../application/usecases/QuizScoreUseCase';

export class QuizScoreController {
  constructor(private quizScoreUseCase: QuizScoreUseCase) {}

  getAllStudentsQuizScores = async (req: Request, res: Response): Promise<void> => {
    try {
      const scores = await this.quizScoreUseCase.getAllStudentsQuizScores();
      res.json(scores);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getProfessorStudentsQuizScores = async (req: Request, res: Response): Promise<void> => {
    try {
      const professorId = req.params.professorId;
      const scores = await this.quizScoreUseCase.getProfessorStudentsQuizScores(professorId);
      res.json(scores);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getStudentQuizScores = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const scores = await this.quizScoreUseCase.getStudentQuizScores(userId);
      res.json(scores);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
