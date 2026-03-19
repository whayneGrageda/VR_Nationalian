import { Section, CreateSectionDTO, UpdateSectionDTO } from '../entities/Section';

export interface ISectionRepository {
  createSection(data: CreateSectionDTO): Promise<string>;
  getSectionsByProfessor(professorId: string): Promise<Section[]>;
  getAllSections(): Promise<Section[]>;
  updateSection(data: UpdateSectionDTO): Promise<boolean>;
  deleteSection(sectionId: string): Promise<boolean>;
  getCount(): Promise<number>;
}
