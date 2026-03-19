import { Request, Response } from 'express';
import { UserProfileUseCase } from '../../application/usecases/UserProfileUseCase';

export class UserProfileController {
  constructor(private userProfileUseCase: UserProfileUseCase) {}

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const { firstName, middleInitial, lastName } = req.body;
      
      const success = await this.userProfileUseCase.updateProfile({
        userId,
        firstName,
        middleInitial,
        lastName
      });
      
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.params.userId;
      const { currentPassword, newPassword } = req.body;
      
      const success = await this.userProfileUseCase.changePassword({
        userId,
        currentPassword,
        newPassword
      });
      
      res.json({ success });
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };
}
