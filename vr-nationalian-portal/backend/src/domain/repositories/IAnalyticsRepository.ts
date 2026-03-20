import { AdminAnalytics } from '../entities/Analytics';

export interface IAnalyticsRepository {
  getAdminAnalytics(): Promise<AdminAnalytics>;
  getProfessorAnalytics(professorId: string): Promise<AdminAnalytics>;
}
