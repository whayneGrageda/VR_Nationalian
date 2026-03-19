import { Professor, CreateProfessorDTO, UpdateProfessorDTO } from '../entities/Professor';

export interface IProfessorRepository {
  createProfessor(data: CreateProfessorDTO): Promise<string>;
  getAllProfessors(): Promise<Professor[]>;
  updateProfessor(data: UpdateProfessorDTO): Promise<boolean>;
  deleteProfessor(userId: string): Promise<boolean>;
  getCount(): Promise<number>;
}
