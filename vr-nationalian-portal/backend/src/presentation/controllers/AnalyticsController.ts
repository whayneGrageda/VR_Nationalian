import { Request, Response } from 'express';
import { AnalyticsUseCase } from '../../application/usecases/AnalyticsUseCase';

export class AnalyticsController {
  constructor(private analyticsUseCase: AnalyticsUseCase) {}

  getAdminAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
      const analytics = await this.analyticsUseCase.getAdminAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
