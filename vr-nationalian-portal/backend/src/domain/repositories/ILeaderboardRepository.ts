import { TopAchievements, TopSpeedrunner, TopSection } from '../entities/Leaderboard';

export interface ILeaderboardRepository {
  getTopAchievements(limit: number): Promise<TopAchievements[]>;
  getTopSpeedrunners(limit: number): Promise<TopSpeedrunner[]>;
  getTopSections(limit: number): Promise<TopSection[]>;
}
