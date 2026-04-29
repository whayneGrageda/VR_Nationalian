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

  requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const result = await this.authUseCase.requestPasswordReset(email);
      res.json(result);
    } catch (error) {
      console.error('Request password reset error:', error);
      const message = (error as Error).message;
      
      if (message === 'EMAIL_NOT_FOUND') {
        res.status(404).json({ error: 'Email not found' });
      } else if (message === 'FAILED_TO_SEND_EMAIL') {
        res.status(500).json({ error: 'Failed to send email. Please try again later.' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };

  verifyPasswordResetCode = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        res.status(400).json({ error: 'Email and code are required' });
        return;
      }

      const result = await this.authUseCase.verifyPasswordResetCode(email, code);
      
      if (!result.valid) {
        res.status(400).json({ error: 'Invalid or expired reset code' });
        return;
      }

      res.json(result);
    } catch (error) {
      console.error('Verify password reset error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };

  updatePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, code, newPassword } = req.body;

      if (!email || !code || !newPassword) {
        res.status(400).json({ error: 'Email, code, and new password are required' });
        return;
      }

      if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters long' });
        return;
      }

      const result = await this.authUseCase.updatePassword(email, code, newPassword);
      res.json(result);
    } catch (error) {
      console.error('Update password error:', error);
      const message = (error as Error).message;
      
      if (message === 'INVALID_OR_EXPIRED_CODE') {
        res.status(400).json({ error: 'Invalid or expired reset code' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    }
  };
}
