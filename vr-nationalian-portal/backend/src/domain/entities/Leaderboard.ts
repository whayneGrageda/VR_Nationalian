export interface LeaderboardEntry {
  userId: number;
  username: string;
  firstName?: string;
  lastName?: string;
  sectionName?: string;
  value: number;
  rank: number;
}

export interface TopAchievements extends LeaderboardEntry {
  achievementCount: number;
}

export interface TopSpeedrunner extends LeaderboardEntry {
  completionTimeMinutes: number;
}

export interface TopSection extends LeaderboardEntry {
  completedStudents: number;
  totalStudents: number;
  completionRate: number;
}

export interface LeaderboardData {
  topAchievements: TopAchievements[];
  topSpeedrunners: TopSpeedrunner[];
  topSections: TopSection[];
}
