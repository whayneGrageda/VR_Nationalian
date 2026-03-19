import { Request, Response } from 'express';
import { AuthUseCase } from '../../application/usecases/AuthUseCase';

export class AuthController {
  constructor(private authUseCase: AuthUseCase) {}

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        res.status(400).json({ error: 'Username and password required' });
        return;
      }

      const user = await this.authUseCase.login(username, password);
      res.json(user);
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ error: (error as Error).message });
    }
  };
}
