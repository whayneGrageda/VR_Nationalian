import { SupabaseClient } from '@supabase/supabase-js';
import { ILeaderboardRepository } from '../../domain/repositories/ILeaderboardRepository';
import { TopAchievements, TopSpeedrunner, TopSection } from '../../domain/entities/Leaderboard';

export class LeaderboardRepository implements ILeaderboardRepository {
  constructor(private supabase: SupabaseClient) {}

  async getTopAchievements(limit: number): Promise<TopAchievements[]> {
    const { data, error } = await this.supabase
      .from('tbluserachievements')
      .select('user_id');

    if (error) throw new Error(error.message);

    // Get unique user IDs
    const userIds = [...new Set(data.map(item => item.user_id))];

    // Get user details
    const { data: users, error: usersError } = await this.supabase
      .from('tblusers')
      .select('user_id, username, first_name, last_name, section_id')
      .in('user_id', userIds);

    if (usersError) throw new Error(usersError.message);

    // Get section details
    const sectionIds = users
      .map(u => u.section_id)
      .filter(id => id !== null);
    
    const { data: sections } = await this.supabase
      .from('tblsections')
      .select('section_id, section_name')
      .in('section_id', sectionIds);

    const sectionMap = (sections || []).reduce((acc: any, s: any) => {
      acc[s.section_id] = s.section_name;
      return acc;
    }, {});

    // Group by user and count achievements
    const userAchievements = data.reduce((acc: any, item: any) => {
      const userId = item.user_id;
      if (!acc[userId]) {
        const user = users.find(u => u.user_id === userId);
        acc[userId] = {
          userId,
          username: user?.username,
          firstName: user?.first_name,
          lastName: user?.last_name,
          sectionName: sectionMap[user?.section_id],
          achievementCount: 0
        };
      }
      acc[userId].achievementCount++;
      return acc;
    }, {});

    // Convert to array and sort
    const sorted = Object.values(userAchievements)
      .sort((a: any, b: any) => b.achievementCount - a.achievementCount)
      .slice(0, limit);

    return sorted.map((entry: any, index: number) => ({
      userId: entry.userId,
      username: entry.username,
      firstName: entry.firstName,
      lastName: entry.lastName,
      sectionName: entry.sectionName,
      value: entry.achievementCount,
      rank: index + 1,
      achievementCount: entry.achievementCount
    }));
  }

  async getTopSpeedrunners(limit: number): Promise<TopSpeedrunner[]> {
    // Get users who completed all 4 chapters
    const { data, error } = await this.supabase
      .from('tblcompleted_chapters')
      .select(`
        user_id,
        chapter_id,
        completed_at
      `)
      .eq('is_completed', true)
      .in('chapter_id', [1, 2, 3, 4])
      .order('completed_at', { ascending: true });

    if (error) throw new Error(error.message);

    // Get user details separately
    const userIds = [...new Set(data.map(item => item.user_id))];
    const { data: users, error: usersError } = await this.supabase
      .from('tblusers')
      .select('user_id, username, first_name, last_name, section_id')
      .in('user_id', userIds);

    if (usersError) throw new Error(usersError.message);

    // Get section details
    const sectionIds = users
      .map(u => u.section_id)
      .filter(id => id !== null);
    
    const { data: sections } = await this.supabase
      .from('tblsections')
      .select('section_id, section_name')
      .in('section_id', sectionIds);

    const sectionMap = (sections || []).reduce((acc: any, s: any) => {
      acc[s.section_id] = s.section_name;
      return acc;
    }, {});

    const userMap = users.reduce((acc: any, u: any) => {
      acc[u.user_id] = {
        username: u.username,
        firstName: u.first_name,
        lastName: u.last_name,
        sectionName: sectionMap[u.section_id]
      };
      return acc;
    }, {});

    // Group by user and calculate completion time
    const userCompletions = data.reduce((acc: any, item: any) => {
      const userId = item.user_id;
      if (!acc[userId]) {
        acc[userId] = {
          userId,
          ...userMap[userId],
          chapters: []
        };
      }
      acc[userId].chapters.push({
        chapterId: item.chapter_id,
        completedAt: new Date(item.completed_at)
      });
      return acc;
    }, {});

    // Filter users who completed all 4 chapters and calculate time
    const completedUsers = Object.values(userCompletions)
      .filter((user: any) => user.chapters.length === 4)
      .map((user: any) => {
        const sortedChapters = user.chapters.sort((a: any, b: any) => 
          a.completedAt.getTime() - b.completedAt.getTime()
        );
        const firstCompletion = sortedChapters[0].completedAt;
        const lastCompletion = sortedChapters[3].completedAt;
        const timeDiffMs = lastCompletion.getTime() - firstCompletion.getTime();
        const timeDiffMinutes = Math.round(timeDiffMs / 60000);

        return {
          userId: user.userId,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          sectionName: user.sectionName,
          completionTimeMinutes: timeDiffMinutes
        };
      })
      .sort((a: any, b: any) => a.completionTimeMinutes - b.completionTimeMinutes)
      .slice(0, limit);

    return completedUsers.map((entry: any, index: number) => ({
      userId: entry.userId,
      username: entry.username,
      firstName: entry.firstName,
      lastName: entry.lastName,
      sectionName: entry.sectionName,
      value: entry.completionTimeMinutes,
      rank: index + 1,
      completionTimeMinutes: entry.completionTimeMinutes
    }));
  }

  async getTopSections(limit: number): Promise<TopSection[]> {
    // Get all sections
    const { data: sections, error: sectionsError } = await this.supabase
      .from('tblsections')
      .select('section_id, section_name');

    if (sectionsError) throw new Error(sectionsError.message);

    // Get all students per section
    const { data: students, error: studentsError } = await this.supabase
      .from('tblusers')
      .select('user_id, section_id')
      .eq('role_id', 1)
      .not('section_id', 'is', null);

    if (studentsError) throw new Error(studentsError.message);

    // Get students who completed all chapters
    const { data: completions, error: completionsError } = await this.supabase
      .from('tblcompleted_chapters')
      .select('user_id, chapter_id')
      .eq('is_completed', true);

    if (completionsError) throw new Error(completionsError.message);

    // Count completions per user
    const userCompletionCounts = completions.reduce((acc: any, item: any) => {
      if (!acc[item.user_id]) acc[item.user_id] = 0;
      acc[item.user_id]++;
      return acc;
    }, {});

    // Get total chapters
    const { count: totalChapters } = await this.supabase
      .from('tblchapters')
      .select('*', { count: 'exact', head: true });

    // Group sections and calculate completion rates
    const sectionStats = sections.reduce((acc: any, section: any) => {
      const sectionId = section.section_id;
      const sectionStudents = students.filter(s => s.section_id === sectionId);
      
      const completedStudents = sectionStudents.filter(student => 
        userCompletionCounts[student.user_id] >= (totalChapters || 4)
      ).length;

      acc[sectionId] = {
        sectionId,
        sectionName: section.section_name,
        totalStudents: sectionStudents.length,
        completedStudents
      };
      
      return acc;
    }, {});

    // Convert to array and calculate completion rate
    const sorted = Object.values(sectionStats)
      .map((section: any) => ({
        ...section,
        completionRate: section.totalStudents > 0 
          ? (section.completedStudents / section.totalStudents) * 100 
          : 0
      }))
      .sort((a: any, b: any) => b.completedStudents - a.completedStudents)
      .slice(0, limit);

    return sorted.map((entry: any, index: number) => ({
      userId: entry.sectionId,
      username: entry.sectionName,
      sectionName: entry.sectionName,
      value: entry.completedStudents,
      rank: index + 1,
      completedStudents: entry.completedStudents,
      totalStudents: entry.totalStudents,
      completionRate: Math.round(entry.completionRate)
    }));
  }
}
