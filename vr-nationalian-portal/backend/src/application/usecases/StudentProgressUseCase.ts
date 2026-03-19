import { IStudentProgressRepository } from '../../domain/repositories/IStudentProgressRepository';
import { Chapter, CompletedChapter, Achievement, UserAchievement, StudentDashboardStats } from '../../domain/entities/StudentProgress';

export class StudentProgressUseCase {
  constructor(private studentProgressRepository: IStudentProgressRepository) {}

  async getStudentDashboardStats(userId: string): Promise<StudentDashboardStats> {
    return this.studentProgressRepository.getStudentDashboardStats(userId);
  }

  async getChaptersWithProgress(userId: string): Promise<{ chapters: Chapter[], completed: CompletedChapter[] }> {
    const [chapters, completed] = await Promise.all([
      this.studentProgressRepository.getAllChapters(),
      this.studentProgressRepository.getCompletedChaptersByUser(userId)
    ]);

    return { chapters, completed };
  }

  async getAchievementsWithProgress(userId: string): Promise<{ achievements: Achievement[], unlocked: UserAchievement[] }> {
    const [achievements, unlocked] = await Promise.all([
      this.studentProgressRepository.getAllAchievements(),
      this.studentProgressRepository.getUserAchievements(userId)
    ]);

    return { achievements, unlocked };
  }
}
