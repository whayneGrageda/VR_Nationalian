import { SupabaseClient } from '@supabase/supabase-js';
import { IAnalyticsRepository } from '../../domain/repositories/IAnalyticsRepository';
import { AdminAnalytics } from '../../domain/entities/Analytics';

export class AnalyticsRepository implements IAnalyticsRepository {
  constructor(private supabase: SupabaseClient) {}

  async getAdminAnalytics(): Promise<AdminAnalytics> {
    const { count: totalStudents } = await this.supabase
      .from('tblusers')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', 1);

    const { data: chaptersData } = await this.supabase
      .from('tblchapters')
      .select('*')
      .order('chapter_order', { ascending: true });

    const totalChapters = chaptersData?.length || 0;

    const { data: achievementsData } = await this.supabase
      .from('tblachievements')
      .select('*')
      .order('achievement_name', { ascending: true });

    const totalAchievements = achievementsData?.length || 0;

    const chapterCompletionRates = await Promise.all(
      (chaptersData || []).map(async (chapter: any) => {
        const { count } = await this.supabase
          .from('tblcompleted_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('chapter_id', chapter.chapter_id)
          .eq('is_completed', true);

        return {
          chapterId: chapter.chapter_id,
          chapterName: chapter.chapter_name,
          completionCount: count || 0,
          completionRate: totalStudents ? ((count || 0) / totalStudents) * 100 : 0
        };
      })
    );

    const achievementUnlockRates = await Promise.all(
      (achievementsData || []).map(async (achievement: any) => {
        const { count } = await this.supabase
          .from('tbluserachievements')
          .select('*', { count: 'exact', head: true })
          .eq('achievement_id', achievement.achievement_id);

        return {
          achievementId: achievement.achievement_id,
          achievementName: achievement.achievement_name,
          unlockCount: count || 0,
          unlockRate: totalStudents ? ((count || 0) / totalStudents) * 100 : 0
        };
      })
    );

    const { data: topStudentsData } = await this.supabase
      .from('tbluserprofiles')
      .select(`
        user_id,
        total_playtime,
        tblusers!inner(username, first_name, last_name, role_id)
      `)
      .eq('tblusers.role_id', 1)
      .order('total_playtime', { ascending: false })
      .limit(10);

    const topStudents = await Promise.all(
      (topStudentsData || []).map(async (profile: any) => {
        const { count: chaptersCompleted } = await this.supabase
          .from('tblcompleted_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id)
          .eq('is_completed', true);

        return {
          userId: profile.user_id,
          username: (profile.tblusers as any).username,
          firstName: (profile.tblusers as any).first_name,
          lastName: (profile.tblusers as any).last_name,
          totalPlaytime: profile.total_playtime || 0,
          chaptersCompleted: chaptersCompleted || 0
        };
      })
    );

    const { data: recentChapters } = await this.supabase
      .from('tblcompleted_chapters')
      .select(`
        user_id,
        chapter_id,
        completed_at,
        tblusers!inner(username),
        tblchapters!inner(chapter_name)
      `)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(5);

    const { data: recentAchievements } = await this.supabase
      .from('tbluserachievements')
      .select(`
        user_id,
        unlocked_at,
        tblusers!inner(username),
        tblachievements!inner(achievement_name)
      `)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    const recentActivity = [
      ...(recentChapters || []).map((item: any) => ({
        userId: item.user_id,
        username: (item.tblusers as any).username,
        activityType: 'chapter' as const,
        itemName: (item.tblchapters as any).chapter_name,
        completedAt: new Date(item.completed_at)
      })),
      ...(recentAchievements || []).map((item: any) => ({
        userId: item.user_id,
        username: (item.tblusers as any).username,
        activityType: 'achievement' as const,
        itemName: (item.tblachievements as any).achievement_name,
        completedAt: new Date(item.unlocked_at)
      }))
    ].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, 5);

    const totalPossibleCompletions = (totalStudents || 0) * totalChapters;
    const { count: totalCompletions } = await this.supabase
      .from('tblcompleted_chapters')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true);

    const overallCompletionRate = totalPossibleCompletions > 0 
      ? ((totalCompletions || 0) / totalPossibleCompletions) * 100 
      : 0;

    const { data: playtimeData } = await this.supabase
      .from('tbluserprofiles')
      .select('total_playtime');

    const totalPlaytime = (playtimeData || []).reduce((sum: number, profile: any) => 
      sum + (profile.total_playtime || 0), 0);
    const averagePlaytime = totalStudents ? totalPlaytime / totalStudents : 0;

    return {
      totalStudents: totalStudents || 0,
      totalChapters,
      totalAchievements,
      overallCompletionRate,
      averagePlaytime,
      chapterCompletionRates,
      achievementUnlockRates,
      topStudents,
      recentActivity
    };
  }

  async getProfessorAnalytics(professorId: string): Promise<AdminAnalytics> {
    // Get professor's sections
    const { data: sections } = await this.supabase
      .from('tblsections')
      .select('section_id')
      .eq('professor_id', professorId);

    const sectionIds = (sections || []).map((s: any) => s.section_id);

    if (sectionIds.length === 0) {
      return {
        totalStudents: 0,
        totalChapters: 0,
        totalAchievements: 0,
        overallCompletionRate: 0,
        averagePlaytime: 0,
        chapterCompletionRates: [],
        achievementUnlockRates: [],
        topStudents: [],
        recentActivity: []
      };
    }

    // Get students in professor's sections
    const { data: studentsData, count: totalStudents } = await this.supabase
      .from('tblusers')
      .select('user_id', { count: 'exact' })
      .eq('role_id', 1)
      .in('section_id', sectionIds);

    const studentIds = (studentsData || []).map((s: any) => s.user_id);

    const { data: chaptersData } = await this.supabase
      .from('tblchapters')
      .select('*')
      .order('chapter_order', { ascending: true });

    const totalChapters = chaptersData?.length || 0;

    const { data: achievementsData } = await this.supabase
      .from('tblachievements')
      .select('*')
      .order('achievement_name', { ascending: true });

    const totalAchievements = achievementsData?.length || 0;

    const chapterCompletionRates = await Promise.all(
      (chaptersData || []).map(async (chapter: any) => {
        const { count } = await this.supabase
          .from('tblcompleted_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('chapter_id', chapter.chapter_id)
          .eq('is_completed', true)
          .in('user_id', studentIds);

        return {
          chapterId: chapter.chapter_id,
          chapterName: chapter.chapter_name,
          completionCount: count || 0,
          completionRate: totalStudents ? ((count || 0) / totalStudents) * 100 : 0
        };
      })
    );

    const achievementUnlockRates = await Promise.all(
      (achievementsData || []).map(async (achievement: any) => {
        const { count } = await this.supabase
          .from('tbluserachievements')
          .select('*', { count: 'exact', head: true })
          .eq('achievement_id', achievement.achievement_id)
          .in('user_id', studentIds);

        return {
          achievementId: achievement.achievement_id,
          achievementName: achievement.achievement_name,
          unlockCount: count || 0,
          unlockRate: totalStudents ? ((count || 0) / totalStudents) * 100 : 0
        };
      })
    );

    const { data: topStudentsData } = await this.supabase
      .from('tbluserprofiles')
      .select(`
        user_id,
        total_playtime,
        tblusers!inner(username, first_name, last_name, role_id)
      `)
      .in('user_id', studentIds)
      .order('total_playtime', { ascending: false })
      .limit(10);

    const topStudents = await Promise.all(
      (topStudentsData || []).map(async (profile: any) => {
        const { count: chaptersCompleted } = await this.supabase
          .from('tblcompleted_chapters')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id)
          .eq('is_completed', true);

        return {
          userId: profile.user_id,
          username: (profile.tblusers as any).username,
          firstName: (profile.tblusers as any).first_name,
          lastName: (profile.tblusers as any).last_name,
          totalPlaytime: profile.total_playtime || 0,
          chaptersCompleted: chaptersCompleted || 0
        };
      })
    );

    const { data: recentChapters } = await this.supabase
      .from('tblcompleted_chapters')
      .select(`
        user_id,
        chapter_id,
        completed_at,
        tblusers!inner(username),
        tblchapters!inner(chapter_name)
      `)
      .eq('is_completed', true)
      .in('user_id', studentIds)
      .order('completed_at', { ascending: false })
      .limit(5);

    const { data: recentAchievements } = await this.supabase
      .from('tbluserachievements')
      .select(`
        user_id,
        unlocked_at,
        tblusers!inner(username),
        tblachievements!inner(achievement_name)
      `)
      .in('user_id', studentIds)
      .order('unlocked_at', { ascending: false })
      .limit(5);

    const recentActivity = [
      ...(recentChapters || []).map((item: any) => ({
        userId: item.user_id,
        username: (item.tblusers as any).username,
        activityType: 'chapter' as const,
        itemName: (item.tblchapters as any).chapter_name,
        completedAt: new Date(item.completed_at)
      })),
      ...(recentAchievements || []).map((item: any) => ({
        userId: item.user_id,
        username: (item.tblusers as any).username,
        activityType: 'achievement' as const,
        itemName: (item.tblachievements as any).achievement_name,
        completedAt: new Date(item.unlocked_at)
      }))
    ].sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime()).slice(0, 5);

    const totalPossibleCompletions = (totalStudents || 0) * totalChapters;
    const { count: totalCompletions } = await this.supabase
      .from('tblcompleted_chapters')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .in('user_id', studentIds);

    const overallCompletionRate = totalPossibleCompletions > 0 
      ? ((totalCompletions || 0) / totalPossibleCompletions) * 100 
      : 0;

    const { data: playtimeData } = await this.supabase
      .from('tbluserprofiles')
      .select('total_playtime')
      .in('user_id', studentIds);

    const totalPlaytime = (playtimeData || []).reduce((sum: number, profile: any) => 
      sum + (profile.total_playtime || 0), 0);
    const averagePlaytime = totalStudents ? totalPlaytime / totalStudents : 0;

    return {
      totalStudents: totalStudents || 0,
      totalChapters,
      totalAchievements,
      overallCompletionRate,
      averagePlaytime,
      chapterCompletionRates,
      achievementUnlockRates,
      topStudents,
      recentActivity
    };
  }
}
