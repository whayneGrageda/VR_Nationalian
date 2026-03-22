import { SupabaseClient } from '@supabase/supabase-js';
import { IQuizScoreRepository } from '../../domain/repositories/IQuizScoreRepository';
import { QuizScore, StudentQuizScores } from '../../domain/entities/QuizScore';

export class QuizScoreRepository implements IQuizScoreRepository {
  constructor(private supabase: SupabaseClient) {}

  async getStudentQuizScores(userId: string): Promise<QuizScore[]> {
    const { data, error } = await this.supabase
      .from('tblquizscores')
      .select('*')
      .eq('user_id', userId)
      .order('chapter_id', { ascending: true });

    if (error) throw new Error(error.message);

    return (data || []).map((score: any) => ({
      quizId: score.quiz_id,
      userId: score.user_id,
      chapterId: score.chapter_id,
      score: score.score,
      totalQuestions: score.total_questions,
      percentage: parseFloat(score.percentage),
      completedAt: new Date(score.completed_at)
    }));
  }

  async getChapterQuizScores(chapterId: number): Promise<StudentQuizScores[]> {
    // Get all students with role_id = 1
    const { data: students, error: studentsError } = await this.supabase
      .from('tblusers')
      .select(`
        user_id,
        username,
        first_name,
        middle_initial,
        last_name,
        section_id,
        tblsections!section_id (
          section_name
        )
      `)
      .eq('role_id', 1)
      .order('first_name', { ascending: true });

    if (studentsError) throw new Error(studentsError.message);

    // Get all quiz scores
    const { data: scores, error: scoresError } = await this.supabase
      .from('tblquizscores')
      .select('*')
      .order('chapter_id', { ascending: true });

    if (scoresError) throw new Error(scoresError.message);

    // Map students with their scores
    return (students || []).map((student: any) => {
      const studentScores = (scores || [])
        .filter((s: any) => s.user_id === student.user_id)
        .map((s: any) => ({
          quizId: s.quiz_id,
          userId: s.user_id,
          chapterId: s.chapter_id,
          score: s.score,
          totalQuestions: s.total_questions,
          percentage: parseFloat(s.percentage),
          completedAt: new Date(s.completed_at)
        }));

      return {
        userId: student.user_id,
        username: student.username,
        firstName: student.first_name,
        middleInitial: student.middle_initial,
        lastName: student.last_name,
        sectionId: student.section_id,
        sectionName: student.tblsections?.section_name,
        scores: studentScores
      };
    });
  }

  async getProfessorStudentsQuizScores(professorId: string): Promise<StudentQuizScores[]> {
    // Get professor's sections
    const { data: sections, error: sectionsError } = await this.supabase
      .from('tblsections')
      .select('section_id')
      .eq('professor_id', professorId);

    if (sectionsError) throw new Error(sectionsError.message);

    const sectionIds = (sections || []).map((s: any) => s.section_id);

    if (sectionIds.length === 0) {
      return [];
    }

    // Get students in those sections
    const { data: students, error: studentsError } = await this.supabase
      .from('tblusers')
      .select(`
        user_id,
        username,
        first_name,
        middle_initial,
        last_name,
        section_id,
        tblsections!section_id (
          section_name
        )
      `)
      .eq('role_id', 1)
      .in('section_id', sectionIds)
      .order('first_name', { ascending: true });

    if (studentsError) throw new Error(studentsError.message);

    // Get quiz scores for these students
    const studentIds = (students || []).map((s: any) => s.user_id);

    if (studentIds.length === 0) {
      return [];
    }

    const { data: scores, error: scoresError } = await this.supabase
      .from('tblquizscores')
      .select('*')
      .in('user_id', studentIds)
      .order('chapter_id', { ascending: true });

    if (scoresError) throw new Error(scoresError.message);

    // Map students with their scores
    return (students || []).map((student: any) => {
      const studentScores = (scores || [])
        .filter((s: any) => s.user_id === student.user_id)
        .map((s: any) => ({
          quizId: s.quiz_id,
          userId: s.user_id,
          chapterId: s.chapter_id,
          score: s.score,
          totalQuestions: s.total_questions,
          percentage: parseFloat(s.percentage),
          completedAt: new Date(s.completed_at)
        }));

      return {
        userId: student.user_id,
        username: student.username,
        firstName: student.first_name,
        middleInitial: student.middle_initial,
        lastName: student.last_name,
        sectionId: student.section_id,
        sectionName: student.tblsections?.section_name,
        scores: studentScores
      };
    });
  }

  async getSectionQuizScores(sectionId: string, chapterId: number): Promise<StudentQuizScores[]> {
    const { data, error } = await this.supabase
      .from('tblquizscores')
      .select(`
        quiz_id,
        user_id,
        chapter_id,
        score,
        total_questions,
        percentage,
        completed_at,
        tblusers!inner (
          user_id,
          username,
          first_name,
          middle_initial,
          last_name,
          section_id,
          tblsections (
            section_name
          )
        )
      `)
      .eq('chapter_id', chapterId)
      .eq('tblusers.section_id', sectionId)
      .order('completed_at', { ascending: false });

    if (error) throw new Error(error.message);

    return (data || []).map((item: any) => ({
      userId: item.tblusers.user_id,
      username: item.tblusers.username,
      firstName: item.tblusers.first_name,
      middleInitial: item.tblusers.middle_initial,
      lastName: item.tblusers.last_name,
      sectionId: item.tblusers.section_id,
      sectionName: item.tblusers.tblsections?.section_name,
      scores: [{
        quizId: item.quiz_id,
        userId: item.user_id,
        chapterId: item.chapter_id,
        score: item.score,
        totalQuestions: item.total_questions,
        percentage: parseFloat(item.percentage),
        completedAt: new Date(item.completed_at)
      }]
    }));
  }
}
