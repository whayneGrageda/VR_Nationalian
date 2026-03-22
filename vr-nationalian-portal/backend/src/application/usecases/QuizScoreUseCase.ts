import { IQuizScoreRepository } from '../../domain/repositories/IQuizScoreRepository';
import { QuizScore, StudentQuizScores } from '../../domain/entities/QuizScore';

export class QuizScoreUseCase {
  constructor(private quizScoreRepository: IQuizScoreRepository) {}

  async getStudentQuizScores(userId: string): Promise<QuizScore[]> {
    return this.quizScoreRepository.getStudentQuizScores(userId);
  }

  async getAllStudentsQuizScores(): Promise<StudentQuizScores[]> {
    return this.quizScoreRepository.getChapterQuizScores(0); // 0 means all chapters
  }

  async getProfessorStudentsQuizScores(professorId: string): Promise<StudentQuizScores[]> {
    return this.quizScoreRepository.getProfessorStudentsQuizScores(professorId);
  }

  async getChapterQuizScores(chapterId: number): Promise<StudentQuizScores[]> {
    return this.quizScoreRepository.getChapterQuizScores(chapterId);
  }

  async getSectionQuizScores(sectionId: string, chapterId: number): Promise<StudentQuizScores[]> {
    return this.quizScoreRepository.getSectionQuizScores(sectionId, chapterId);
  }
}
