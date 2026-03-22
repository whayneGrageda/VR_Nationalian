export interface QuizScore {
  quizId: string;
  userId: string;
  chapterId: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: Date;
}

export interface StudentQuizScores {
  userId: string;
  username: string;
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  sectionId: string;
  sectionName?: string;
  scores: QuizScore[];
}
