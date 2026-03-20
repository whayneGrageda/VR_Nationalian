import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository';
import { AdminAnalytics } from '../../domain/entities/Analytics';

export class AnalyticsUseCase {
  constructor(private analyticsRepository: IAnalyticsRepository) {}

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    return this.analyticsRepository.getAdminAnalytics();
  }

  async getProfessorAnalytics(professorId: string): Promise<AdminAnalytics> {
    return this.analyticsRepository.getProfessorAnalytics(professorId);
  }
}
