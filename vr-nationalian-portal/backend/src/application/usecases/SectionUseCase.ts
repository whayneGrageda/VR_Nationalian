import { ISectionRepository } from '../../domain/repositories/ISectionRepository';
import { Section, CreateSectionDTO, UpdateSectionDTO } from '../../domain/entities/Section';

export class SectionUseCase {
  constructor(private sectionRepository: ISectionRepository) {}

  async createSection(data: CreateSectionDTO): Promise<string> {
    return this.sectionRepository.createSection(data);
  }

  async getSectionsByProfessor(professorId: string): Promise<Section[]> {
    return this.sectionRepository.getSectionsByProfessor(professorId);
  }

  async updateSection(data: UpdateSectionDTO): Promise<boolean> {
    return this.sectionRepository.updateSection(data);
  }

  async deleteSection(sectionId: string): Promise<boolean> {
    return this.sectionRepository.deleteSection(sectionId);
  }

  async getAllSections(): Promise<Section[]> {
    return this.sectionRepository.getAllSections();
  }

  async deactivateSection(sectionId: string): Promise<boolean> {
    return this.sectionRepository.deactivateSection(sectionId);
  }

  async activateSection(sectionId: string): Promise<boolean> {
    return this.sectionRepository.activateSection(sectionId);
  }
}
