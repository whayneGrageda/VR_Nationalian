import { Request, Response } from 'express';
import { LeaderboardUseCase } from '../../application/usecases/LeaderboardUseCase';

export class LeaderboardController {
  constructor(private leaderboardUseCase: LeaderboardUseCase) {}

  getLeaderboards = async (req: Request, res: Response): Promise<void> => {
    try {
      const data = await this.leaderboardUseCase.getLeaderboards();
      res.json(data);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
