import { Chapter, CompletedChapter, Achievement, UserAchievement, UserProfile, StudentDashboardStats } from '../entities/StudentProgress';

export interface IStudentProgressRepository {
  getAllChapters(): Promise<Chapter[]>;
  getCompletedChaptersByUser(userId: string): Promise<CompletedChapter[]>;
  getAllAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<UserAchievement[]>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  getStudentDashboardStats(userId: string): Promise<StudentDashboardStats>;
}
