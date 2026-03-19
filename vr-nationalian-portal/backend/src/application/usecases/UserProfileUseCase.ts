import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UpdateProfileDTO, ChangePasswordDTO } from '../../domain/entities/User';

export class UserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async updateProfile(data: UpdateProfileDTO): Promise<boolean> {
    return this.userRepository.updateProfile(data);
  }

  async changePassword(data: ChangePasswordDTO): Promise<boolean> {
    return this.userRepository.changePassword(data);
  }
}
