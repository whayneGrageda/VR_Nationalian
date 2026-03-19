import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User } from '../../domain/entities/User';

export class AuthUseCase {
  constructor(private userRepository: IUserRepository) {}

  async login(username: string, password: string): Promise<User> {
    const user = await this.userRepository.login(username, password);
    return user;
  }
}
