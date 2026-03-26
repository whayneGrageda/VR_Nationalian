import { IProfessorRepository } from '../../domain/repositories/IProfessorRepository';
import { Professor, CreateProfessorDTO, UpdateProfessorDTO } from '../../domain/entities/Professor';

export class ProfessorUseCase {
  constructor(private professorRepository: IProfessorRepository) {}

  async createProfessor(data: CreateProfessorDTO): Promise<string> {
    return this.professorRepository.createProfessor(data);
  }

  async getAllProfessors(): Promise<Professor[]> {
    return this.professorRepository.getAllProfessors();
  }

  async updateProfessor(data: UpdateProfessorDTO): Promise<boolean> {
    return this.professorRepository.updateProfessor(data);
  }

  async deleteProfessor(userId: string): Promise<boolean> {
    return this.professorRepository.deleteProfessor(userId);
  }

  async getArchivedProfessors() {
    return this.professorRepository.getArchivedProfessors();
  }
}
