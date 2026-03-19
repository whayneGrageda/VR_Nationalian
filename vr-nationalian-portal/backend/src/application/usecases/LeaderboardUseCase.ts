import { ILeaderboardRepository } from '../../domain/repositories/ILeaderboardRepository';
import { LeaderboardData } from '../../domain/entities/Leaderboard';

export class LeaderboardUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async getLeaderboards(): Promise<LeaderboardData> {
    const [topAchievements, topSpeedrunners, topSections] = await Promise.all([
      this.leaderboardRepository.getTopAchievements(3),
      this.leaderboardRepository.getTopSpeedrunners(3),
      this.leaderboardRepository.getTopSections(3)
    ]);

    return {
      topAchievements,
      topSpeedrunners,
      topSections
    };
  }
}
