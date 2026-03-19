export interface Chapter {
  chapterId: number;
  chapterName: string;
  chapterOrder: number;
  description?: string;
}

export interface CompletedChapter {
  id: string;
  userId: string;
  chapterId: number;
  isCompleted: boolean;
  completedAt?: Date;
  chapterName?: string;
}

export interface Achievement {
  achievementId: string;
  achievementKey: string;
  achievementName: string;
  description?: string;
  iconKey?: string;
}

export interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  achievementName?: string;
  description?: string;
  iconKey?: string;
}

export interface UserProfile {
  profileId: string;
  userId: string;
  displayName?: string;
  avatarUrl?: string;
  totalPlaytime: number;
  totalArtifacts: number;
  lastPlayedAt?: Date;
  lastChapterId: number;
}

export interface StudentDashboardStats {
  chaptersCompleted: number;
  totalChapters: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  totalPlaytime: number;
  averageScore: number;
}
