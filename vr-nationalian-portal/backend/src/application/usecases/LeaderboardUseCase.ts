import { ILeaderboardRepository } from '../../domain/repositories/ILeaderboardRepository';
import { LeaderboardData } from '../../domain/entities/Leaderboard';

export class LeaderboardUseCase {
  constructor(private leaderboardRepository: ILeaderboardRepository) {}

  async getLeaderboards(): Promise<LeaderboardData> {
    const [topAchievements, topSpeedrunners, topSections] = await Promise.all([
      this.leaderboardRepository.getTopAchievements(10),
      this.leaderboardRepository.getTopSpeedrunners(10),
      this.leaderboardRepository.getTopSections(10)
    ]);

    return {
      topAchievements,
      topSpeedrunners,
      topSections
    };
  }
}
