import { Request, Response } from 'express';
import { ProfessorStatsUseCase } from '../../application/usecases/ProfessorStatsUseCase';

export class ProfessorStatsController {
  constructor(private professorStatsUseCase: ProfessorStatsUseCase) {}

  getProfessorStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const professorId = req.params.professorId;
      const stats = await this.professorStatsUseCase.getProfessorStats(professorId);
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
