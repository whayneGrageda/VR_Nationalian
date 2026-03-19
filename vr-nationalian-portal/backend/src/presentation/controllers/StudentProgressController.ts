import { Request, Response } from 'express';
import { StudentProgressUseCase } from '../../application/usecases/StudentProgressUseCase';

export class StudentProgressController {
  constructor(private studentProgressUseCase: StudentProgressUseCase) {}

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const stats = await this.studentProgressUseCase.getStudentDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getChaptersWithProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const data = await this.studentProgressUseCase.getChaptersWithProgress(userId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAchievementsWithProgress = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const data = await this.studentProgressUseCase.getAchievementsWithProgress(userId);
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
