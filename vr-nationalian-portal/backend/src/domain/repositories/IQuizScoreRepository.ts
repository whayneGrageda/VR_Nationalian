import { QuizScore, StudentQuizScores } from '../entities/QuizScore';

export interface IQuizScoreRepository {
  getStudentQuizScores(userId: string): Promise<QuizScore[]>;
  getChapterQuizScores(chapterId: number): Promise<StudentQuizScores[]>;
  getProfessorStudentsQuizScores(professorId: string): Promise<StudentQuizScores[]>;
  getSectionQuizScores(sectionId: string, chapterId: number): Promise<StudentQuizScores[]>;
}
