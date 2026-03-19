import { SupabaseClient } from '@supabase/supabase-js';
import { IStudentProgressRepository } from '../../domain/repositories/IStudentProgressRepository';
import { Chapter, CompletedChapter, Achievement, UserAchievement, UserProfile, StudentDashboardStats } from '../../domain/entities/StudentProgress';

export class StudentProgressRepository implements IStudentProgressRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAllChapters(): Promise<Chapter[]> {
    const { data, error } = await this.supabase
      .from('tblchapters')
      .select('*')
      .order('chapter_order', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((chapter: any) => ({
      chapterId: chapter.chapter_id,
      chapterName: chapter.chapter_name,
      chapterOrder: chapter.chapter_order,
      description: chapter.description
    }));
  }

  async getCompletedChaptersByUser(userId: string): Promise<CompletedChapter[]> {
    const { data, error } = await this.supabase
      .from('tblcompleted_chapters')
      .select(`
        id,
        user_id,
        chapter_id,
        is_completed,
        completed_at,
        tblchapters!inner(chapter_name)
      `)
      .eq('user_id', userId)
      .eq('is_completed', true);

    if (error) throw new Error(error.message);

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      chapterId: item.chapter_id,
      isCompleted: item.is_completed,
      completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      chapterName: (item.tblchapters as any).chapter_name
    }));
  }

  async getAllAchievements(): Promise<Achievement[]> {
    const { data, error } = await this.supabase
      .from('tblachievements')
      .select('*')
      .order('achievement_name', { ascending: true });

    if (error) throw new Error(error.message);

    return data.map((achievement: any) => ({
      achievementId: achievement.achievement_id,
      achievementKey: achievement.achievement_key,
      achievementName: achievement.achievement_name,
      description: achievement.description,
      iconKey: achievement.icon_key
    }));
  }

  async getUserAchievements(userId: string): Promise<UserAchievement[]> {
    const { data, error } = await this.supabase
      .from('tbluserachievements')
      .select(`
        id,
        user_id,
        achievement_id,
        unlocked_at,
        tblachievements!inner(achievement_name, description, icon_key)
      `)
      .eq('user_id', userId);

    if (error) throw new Error(error.message);

    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      achievementId: item.achievement_id,
      unlockedAt: new Date(item.unlocked_at),
      achievementName: (item.tblachievements as any).achievement_name,
      description: (item.tblachievements as any).description,
      iconKey: (item.tblachievements as any).icon_key
    }));
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.supabase
      .from('tbluserprofiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw new Error(error.message);
    }

    return {
      profileId: data.profile_id,
      userId: data.user_id,
      displayName: data.display_name,
      avatarUrl: data.avatar_url,
      totalPlaytime: data.total_playtime || 0,
      totalArtifacts: data.total_artifacts || 0,
      lastPlayedAt: data.last_played_at ? new Date(data.last_played_at) : undefined,
      lastChapterId: data.last_chapter_id || 1
    };
  }

  async getStudentDashboardStats(userId: string): Promise<StudentDashboardStats> {
    // Get total chapters
    const { count: totalChapters } = await this.supabase
      .from('tblchapters')
      .select('*', { count: 'exact', head: true });

    // Get completed chapters count
    const { count: chaptersCompleted } = await this.supabase
      .from('tblcompleted_chapters')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_completed', true);

    // Get total achievements
    const { count: totalAchievements } = await this.supabase
      .from('tblachievements')
      .select('*', { count: 'exact', head: true });

    // Get user achievements count
    const { count: achievementsUnlocked } = await this.supabase
      .from('tbluserachievements')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Get user profile for playtime
    const profile = await this.getUserProfile(userId);

    return {
      chaptersCompleted: chaptersCompleted || 0,
      totalChapters: totalChapters || 0,
      achievementsUnlocked: achievementsUnlocked || 0,
      totalAchievements: totalAchievements || 0,
      totalPlaytime: profile?.totalPlaytime || 0,
      averageScore: 0
    };
  }
}
