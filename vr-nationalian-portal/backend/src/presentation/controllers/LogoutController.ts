import { Request, Response } from 'express';
import { LogoutUseCase } from '../../application/usecases/LogoutUseCase';

export class LogoutController {
  constructor(private logoutUseCase: LogoutUseCase) {}

  async logout(req: Request, res: Response): Promise<void> {
    try {
      const { sessionToken } = req.body;

      if (!sessionToken) {
        res.status(400).json({ error: 'Session token is required' });
        return;
      }

      await this.logoutUseCase.logout(sessionToken);

      res.json({ success: true, message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      res.status(500).json({ error: (error as Error).message });
    }
  }
}
