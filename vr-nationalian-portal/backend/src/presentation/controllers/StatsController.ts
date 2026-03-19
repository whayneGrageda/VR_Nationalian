import { Request, Response } from 'express';
import { StatsUseCase } from '../../application/usecases/StatsUseCase';

export class StatsController {
  constructor(private statsUseCase: StatsUseCase) {}

  getDashboardStats = async (req: Request, res: Response): Promise<void> => {
    try {
      const stats = await this.statsUseCase.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  getAdminOverview = async (req: Request, res: Response): Promise<void> => {
    try {
      const overview = await this.statsUseCase.getAdminOverview();
      res.json(overview);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
