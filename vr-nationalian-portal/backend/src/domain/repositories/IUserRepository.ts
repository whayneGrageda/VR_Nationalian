import { User, CreateStudentDTO, UpdateStudentDTO, UpdateProfileDTO, ChangePasswordDTO } from '../entities/User';

export interface IUserRepository {
  login(username: string, password: string): Promise<User>;
  createStudent(data: CreateStudentDTO): Promise<string>;
  getStudentsBySection(sectionId: string): Promise<User[]>;
  getAllStudents(): Promise<User[]>;
  updateStudent(data: UpdateStudentDTO): Promise<boolean>;
  deleteStudent(userId: string): Promise<boolean>;
  getStudentCount(): Promise<number>;
  getActiveSessionCount(): Promise<number>;
  getActiveStudentCountBySection(sectionId: string): Promise<number>;
  updateProfile(data: UpdateProfileDTO): Promise<boolean>;
  changePassword(data: ChangePasswordDTO): Promise<boolean>;
}
