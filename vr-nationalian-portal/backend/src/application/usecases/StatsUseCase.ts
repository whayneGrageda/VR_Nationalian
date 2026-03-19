import { IUserRepository } from '../../domain/repositories/IUserRepository';
import { ISectionRepository } from '../../domain/repositories/ISectionRepository';
import { IProfessorRepository } from '../../domain/repositories/IProfessorRepository';

export interface DashboardStats {
  totalProfessors: number;
  totalSections: number;
  totalStudents: number;
  activeSessions: number;
}

export class StatsUseCase {
  constructor(
    private userRepository: IUserRepository,
    private sectionRepository: ISectionRepository,
    private professorRepository: IProfessorRepository
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const [professors, sections, students, sessions] = await Promise.all([
      this.professorRepository.getCount(),
      this.sectionRepository.getCount(),
      this.userRepository.getStudentCount(),
      this.userRepository.getActiveSessionCount()
    ]);

    return {
      totalProfessors: professors,
      totalSections: sections,
      totalStudents: students,
      activeSessions: sessions
    };
  }

  async getAdminOverview() {
    const supabase = (this.userRepository as any).supabase;

    // Get recent activity
    const { data: recentActivity } = await supabase
      .from('tblcompleted_chapters')
      .select(`
        user_id,
        completed_at,
        tblusers!inner(username, first_name, last_name),
        tblchapters!inner(chapter_name)
      `)
      .eq('is_completed', true)
      .order('completed_at', { ascending: false })
      .limit(5);

    const activities = (recentActivity || []).map((item: any) => ({
      type: 'chapter_completed',
      username: (item.tblusers as any).username,
      firstName: (item.tblusers as any).first_name,
      lastName: (item.tblusers as any).last_name,
      description: `completed ${(item.tblchapters as any).chapter_name}`,
      timestamp: item.completed_at
    }));

    // Get quick insights
    const { data: sectionsData } = await supabase
      .from('tblsections')
      .select(`
        section_id,
        section_name,
        tblusers!tblusers_section_id_fkey(user_id)
      `);

    const sectionStats = (sectionsData || []).map((section: any) => ({
      sectionId: section.section_id,
      sectionName: section.section_name,
      studentCount: section.tblusers?.length || 0
    }));

    const totalStudents = sectionStats.reduce((sum, s) => sum + s.studentCount, 0);
    const avgStudentsPerSection = sectionStats.length > 0 
      ? Math.round(totalStudents / sectionStats.length) 
      : 0;

    const mostActiveSection = sectionStats.reduce((max, section) => 
      section.studentCount > (max?.studentCount || 0) ? section : max
    , sectionStats[0] || null);

    // Get chapters completed this week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const { count: chaptersThisWeek } = await supabase
      .from('tblcompleted_chapters')
      .select('*', { count: 'exact', head: true })
      .eq('is_completed', true)
      .gte('completed_at', oneWeekAgo.toISOString());

    // Get logins today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { count: loginsToday } = await supabase
      .from('tblusers')
      .select('*', { count: 'exact', head: true })
      .gte('last_login', today.toISOString());

    return {
      recentActivity: activities,
      insights: {
        avgStudentsPerSection,
        mostActiveSection: mostActiveSection ? {
          name: mostActiveSection.sectionName,
          studentCount: mostActiveSection.studentCount
        } : null,
        loginsToday: loginsToday || 0,
        chaptersCompletedThisWeek: chaptersThisWeek || 0
      }
    };
  }
}
