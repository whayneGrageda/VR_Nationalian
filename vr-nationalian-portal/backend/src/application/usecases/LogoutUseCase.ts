import { IUserRepository } from '../../domain/repositories/IUserRepository';

export class LogoutUseCase {
  constructor(private userRepository: IUserRepository) {}

  async logout(sessionToken: string): Promise<void> {
    await this.userRepository.deactivateSession(sessionToken);
  }
}
