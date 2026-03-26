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

export interface ChapterProgress {
  chapterId: number;
  chapterName: string;
  isCompleted: boolean;
  completedAt?: Date;
  quizScore?: number;
  quizTotal?: number;
}

export interface RecentActivity {
  type: 'chapter' | 'achievement' | 'quiz';
  title: string;
  description: string;
  timestamp: Date;
  icon?: string;
}

export interface SectionInfo {
  sectionId: string;
  sectionName: string;
  professorName: string;
  studentCount: number;
  userRank?: number;
}

export interface StudentDashboardStats {
  chaptersCompleted: number;
  totalChapters: number;
  achievementsUnlocked: number;
  totalAchievements: number;
  totalPlaytime: number;
  averageScore: number;
  recentActivities: RecentActivity[];
  sectionInfo?: SectionInfo;
  nextChapter?: {
    chapterId: number;
    chapterName: string;
  };
  recentAchievements: UserAchievement[];
  chapterProgress: ChapterProgress[];
}
