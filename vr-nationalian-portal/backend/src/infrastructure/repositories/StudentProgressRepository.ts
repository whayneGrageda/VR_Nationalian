import { SupabaseClient } from '@supabase/supabase-js';
import { IStudentProgressRepository } from '../../domain/repositories/IStudentProgressRepository';
import { Chapter, CompletedChapter, Achievement, UserAchievement, UserProfile, StudentDashboardStats, RecentActivity, SectionInfo, ChapterProgress } from '../../domain/entities/StudentProgress';

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

    // Get completed chapters count and data
    const { data: completedChaptersData, count: chaptersCompleted } = await this.supabase
      .from('tblcompleted_chapters')
      .select('*, tblchapters!inner(chapter_name)', { count: 'exact' })
      .eq('user_id', userId)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false });

    // Get total achievements
    const { count: totalAchievements } = await this.supabase
      .from('tblachievements')
      .select('*', { count: 'exact', head: true });

    // Get user achievements with details
    const { data: achievementsData, count: achievementsUnlocked } = await this.supabase
      .from('tbluserachievements')
      .select('*, tblachievements!inner(achievement_name, description, icon_key)', { count: 'exact' })
      .eq('user_id', userId)
      .order('unlocked_at', { ascending: false })
      .limit(10);

    // Get user profile for playtime
    const profile = await this.getUserProfile(userId);

    // Get quiz scores for average
    const { data: quizScores } = await this.supabase
      .from('tblquizscores')
      .select('score, total_questions, completed_at, tblchapters!inner(chapter_name)')
      .eq('user_id', userId)
      .order('completed_at', { ascending: false });

    const averageScore = quizScores && quizScores.length > 0
      ? Math.round((quizScores.reduce((sum, q) => sum + (q.score / q.total_questions) * 100, 0) / quizScores.length))
      : 0;

    // Get section info if user is in a section
    const { data: userData } = await this.supabase
      .from('tblusers')
      .select('section_id, first_name, last_name')
      .eq('user_id', userId)
      .single();

    let sectionInfo: SectionInfo | undefined;
    if (userData?.section_id) {
      const { data: sectionData } = await this.supabase
        .from('tblsections')
        .select(`
          section_id,
          section_name,
          tblusers!tblsections_professor_id_fkey(first_name, last_name)
        `)
        .eq('section_id', userData.section_id)
        .single();

      if (sectionData) {
        const { count: studentCount } = await this.supabase
          .from('tblusers')
          .select('*', { count: 'exact', head: true })
          .eq('section_id', userData.section_id);

        const professor = sectionData.tblusers as any;
        sectionInfo = {
          sectionId: sectionData.section_id,
          sectionName: sectionData.section_name,
          professorName: `${professor.first_name} ${professor.last_name}`,
          studentCount: studentCount || 0
        };
      }
    }

    // Build recent activities from chapters, achievements, and quizzes
    const recentActivities: RecentActivity[] = [];

    // Add completed chapters
    if (completedChaptersData) {
      completedChaptersData.forEach((chapter: any) => {
        if (chapter.completed_at) {
          recentActivities.push({
            type: 'chapter',
            title: `Completed ${(chapter.tblchapters as any).chapter_name}`,
            description: 'Chapter completed',
            timestamp: new Date(chapter.completed_at),
            icon: 'Gamepad2'
          });
        }
      });
    }

    // Add achievements
    if (achievementsData) {
      achievementsData.forEach((achievement: any) => {
        recentActivities.push({
          type: 'achievement',
          title: `Unlocked "${(achievement.tblachievements as any).achievement_name}"`,
          description: (achievement.tblachievements as any).description || 'Achievement unlocked',
          timestamp: new Date(achievement.unlocked_at),
          icon: 'Trophy'
        });
      });
    }

    // Add quiz scores
    if (quizScores) {
      quizScores.forEach((quiz: any) => {
        recentActivities.push({
          type: 'quiz',
          title: `Scored ${quiz.score}/${quiz.total_questions} on ${(quiz.tblchapters as any).chapter_name}`,
          description: `${Math.round((quiz.score / quiz.total_questions) * 100)}% correct`,
          timestamp: new Date(quiz.completed_at),
          icon: 'Award'
        });
      });
    }

    // Sort by timestamp and take top 10
    recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const topActivities = recentActivities.slice(0, 10);

    // Get next chapter
    let nextChapter;
    if (chaptersCompleted && chaptersCompleted < (totalChapters || 0)) {
      const nextChapterId = (chaptersCompleted || 0) + 1;
      const { data: nextChapterData } = await this.supabase
        .from('tblchapters')
        .select('chapter_id, chapter_name')
        .eq('chapter_id', nextChapterId)
        .single();

      if (nextChapterData) {
        nextChapter = {
          chapterId: nextChapterData.chapter_id,
          chapterName: nextChapterData.chapter_name
        };
      }
    }

    // Get recent achievements (last 3)
    const recentAchievements: UserAchievement[] = achievementsData
      ? achievementsData.slice(0, 3).map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          achievementId: item.achievement_id,
          unlockedAt: new Date(item.unlocked_at),
          achievementName: (item.tblachievements as any).achievement_name,
          description: (item.tblachievements as any).description,
          iconKey: (item.tblachievements as any).icon_key
        }))
      : [];

    // Get chapter progress with quiz scores
    const { data: allChapters } = await this.supabase
      .from('tblchapters')
      .select('*')
      .order('chapter_order', { ascending: true });

    const chapterProgress: ChapterProgress[] = [];
    if (allChapters) {
      for (const chapter of allChapters) {
        const completed = completedChaptersData?.find((c: any) => c.chapter_id === chapter.chapter_id);
        const quiz = quizScores?.find((q: any) => q.tblchapters.chapter_id === chapter.chapter_id);
        
        chapterProgress.push({
          chapterId: chapter.chapter_id,
          chapterName: chapter.chapter_name,
          isCompleted: completed?.is_completed || false,
          completedAt: completed?.completed_at ? new Date(completed.completed_at) : undefined,
          quizScore: quiz?.score,
          quizTotal: quiz?.total_questions
        });
      }
    }

    return {
      chaptersCompleted: chaptersCompleted || 0,
      totalChapters: totalChapters || 0,
      achievementsUnlocked: achievementsUnlocked || 0,
      totalAchievements: totalAchievements || 0,
      totalPlaytime: profile?.totalPlaytime || 0,
      averageScore,
      recentActivities: topActivities,
      sectionInfo,
      nextChapter,
      recentAchievements,
      chapterProgress
    };
  }
}
