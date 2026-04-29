import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';
import { EmailService } from '../../infrastructure/services/EmailService';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async login(username: string, password: string): Promise<User> {
    const user = await this.userRepository.login(username, password);
    return user;
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    // Check if user exists
    const user = await this.userRepository.findByEmail(email);
    
    if (!user) {
      throw new Error('EMAIL_NOT_FOUND');
    }

    // Send reset code via email
    const result = await EmailService.sendPasswordResetCode(email, user.username);
    return result;
  }

  async verifyPasswordResetCode(email: string, code: string): Promise<{ valid: boolean }> {
    const result = EmailService.verifyPasswordResetCode(email, code);
    return result;
  }

  async updatePassword(email: string, code: string, newPassword: string): Promise<{ message: string }> {
    // Verify code one more time
    const verification = EmailService.verifyPasswordResetCode(email, code);
    
    if (!verification.valid) {
      throw new Error('INVALID_OR_EXPIRED_CODE');
    }

    // Update password in database
    await this.userRepository.updatePasswordByEmail(email, newPassword);

    // Clear the reset code
    EmailService.clearPasswordResetCode(email);

    return {
      message: 'Password updated successfully'
    };
  }
}
