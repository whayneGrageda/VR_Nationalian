export interface AdminAnalytics {
  totalStudents: number;
  totalChapters: number;
  totalAchievements: number;
  overallCompletionRate: number;
  averagePlaytime: number;
  chapterCompletionRates: ChapterCompletionRate[];
  achievementUnlockRates: AchievementUnlockRate[];
  topStudents: TopStudent[];
  recentActivity: RecentActivity[];
}

export interface ChapterCompletionRate {
  chapterId: number;
  chapterName: string;
  completionCount: number;
  completionRate: number;
}

export interface AchievementUnlockRate {
  achievementId: string;
  achievementName: string;
  unlockCount: number;
  unlockRate: number;
}

export interface TopStudent {
  userId: string;
  username: string;
  firstName?: string;
  lastName?: string;
  totalPlaytime: number;
  chaptersCompleted: number;
}

export interface RecentActivity {
  userId: string;
  username: string;
  activityType: 'chapter' | 'achievement';
  itemName: string;
  completedAt: Date;
}
