import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { User, CreateStudentDTO, UpdateStudentDTO } from '../../domain/entities/User';

export class StudentUseCase {
  constructor(private userRepository: IUserRepository) {}

  async createStudent(data: CreateStudentDTO): Promise<string> {
    return this.userRepository.createStudent(data);
  }

  async getStudentsBySection(sectionId: string): Promise<User[]> {
    return this.userRepository.getStudentsBySection(sectionId);
  }

  async updateStudent(data: UpdateStudentDTO): Promise<boolean> {
    return this.userRepository.updateStudent(data);
  }

  async deleteStudent(userId: string): Promise<boolean> {
    return this.userRepository.deleteStudent(userId);
  }

  async getAllStudents(): Promise<User[]> {
    return this.userRepository.getAllStudents();
  }
}
