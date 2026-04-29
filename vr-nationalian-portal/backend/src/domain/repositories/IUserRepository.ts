import { User, CreateStudentDTO, UpdateStudentDTO, UpdateProfileDTO, ChangePasswordDTO } from '../entities/User';

export interface IUserRepository {
  login(username: string, password: string): Promise<User>;
  findByEmail(email: string): Promise<User | null>;
  updatePasswordByEmail(email: string, newPassword: string): Promise<boolean>;
  createStudent(data: CreateStudentDTO): Promise<string>;
  getStudentsBySection(sectionId: string): Promise<User[]>;
  getAllStudents(): Promise<User[]>;
  getStudentsByProfessor(professorId: string): Promise<User[]>;
  updateStudent(data: UpdateStudentDTO): Promise<boolean>;
  deleteStudent(userId: string): Promise<boolean>;
  getStudentCount(): Promise<number>;
  getActiveSessionCount(): Promise<number>;
  getActiveStudentCountBySection(sectionId: string): Promise<number>;
  updateProfile(data: UpdateProfileDTO): Promise<boolean>;
  changePassword(data: ChangePasswordDTO): Promise<boolean>;
  deactivateSession(sessionToken: string): Promise<void>;
  getArchivedUsers(roleId: number): Promise<any[]>;
  getArchivedStudentsByProfessor(professorId: string): Promise<any[]>;
  archiveUser(userId: string): Promise<boolean>;
  reactivateUser(userId: string): Promise<boolean>;
  scheduleArchive(userId: string, scheduledArchiveDate: string): Promise<boolean>;
}
