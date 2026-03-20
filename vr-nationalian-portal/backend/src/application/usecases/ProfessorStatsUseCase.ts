import { ISectionRepository } from '../../domain/repositories/ISectionRepository';
import { IUserRepository } from '../../domain/repositories/IUserRepository';

export interface ProfessorDashboardStats {
  totalSections: number;
  totalStudents: number;
  activeStudents: number;
  totalChapters: number;
  totalAchievements: number;
  overallCompletionRate: number;
  averagePlaytime: number;
}

export class ProfessorStatsUseCase {
  constructor(
    private sectionRepository: ISectionRepository,
    private userRepository: IUserRepository
  ) {}

  async getProfessorStats(professorId: string): Promise<ProfessorDashboardStats> {
    const sections = await this.sectionRepository.getSectionsByProfessor(professorId);
    const sectionIds = sections.map(s => s.sectionId);
    
    let totalStudents = 0;
    let activeStudents = 0;

    for (const sectionId of sectionIds) {
      const students = await this.userRepository.getStudentsBySection(sectionId);
      totalStudents += students.length;
      
      // Count active students (those with sessions in the last 7 days)
      const activeCount = await this.userRepository.getActiveStudentCountBySection(sectionId);
      activeStudents += activeCount;
    }

    return {
      totalSections: sections.length,
      totalStudents,
      activeStudents,
      totalChapters: 0,
      totalAchievements: 0,
      overallCompletionRate: 0,
      averagePlaytime: 0
    };
  }
}
