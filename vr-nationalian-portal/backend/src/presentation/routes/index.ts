import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { SectionController } from '../controllers/SectionController';
import { StudentController } from '../controllers/StudentController';
import { ProfessorController } from '../controllers/ProfessorController';
import { StatsController } from '../controllers/StatsController';
import { ProfessorStatsController } from '../controllers/ProfessorStatsController';
import { UserProfileController } from '../controllers/UserProfileController';
import { StudentProgressController } from '../controllers/StudentProgressController';
import { AnalyticsController } from '../controllers/AnalyticsController';
import { HealthController } from '../controllers/HealthController';
import { LeaderboardController } from '../controllers/LeaderboardController';
import { LogoutController } from '../controllers/LogoutController';
import { QuizScoreController } from '../controllers/QuizScoreController';

export function createRoutes(
  authController: AuthController,
  sectionController: SectionController,
  studentController: StudentController,
  professorController: ProfessorController,
  statsController: StatsController,
  professorStatsController: ProfessorStatsController,
  userProfileController: UserProfileController,
  studentProgressController: StudentProgressController,
  analyticsController: AnalyticsController,
  healthController: HealthController,
  leaderboardController: LeaderboardController,
  logoutController: LogoutController,
  quizScoreController: QuizScoreController
): Router {
  const router = Router();

  router.get('/health', healthController.checkHealth);
  router.get('/leaderboards', leaderboardController.getLeaderboards);

  router.post('/auth/login', authController.login);
  router.post('/auth/logout', logoutController.logout.bind(logoutController));

  router.get('/stats/dashboard', statsController.getDashboardStats);
  router.get('/stats/admin/overview', statsController.getAdminOverview);
  router.get('/stats/professor/:professorId', professorStatsController.getProfessorStats);

  router.put('/users/:userId/profile', userProfileController.updateProfile);
  router.put('/users/:userId/password', userProfileController.changePassword);

  router.get('/students/:userId/dashboard', studentProgressController.getDashboardStats);
  router.get('/students/:userId/chapters', studentProgressController.getChaptersWithProgress);
  router.get('/students/:userId/achievements', studentProgressController.getAchievementsWithProgress);

  router.get('/analytics/admin', analyticsController.getAdminAnalytics);
  router.get('/analytics/professor/:professorId', analyticsController.getProfessorAnalytics);

  router.post('/sections', sectionController.create);
  router.get('/sections', sectionController.getAll);
  router.get('/sections/professor/:professorId', sectionController.getByProfessor);
  router.put('/sections/:id', sectionController.update);
  router.delete('/sections/:id', sectionController.delete);

  router.post('/students', studentController.create);
  router.get('/students', studentController.getAll);
  router.get('/students/section/:sectionId', studentController.getBySection);
  router.get('/students/professor/:professorId', studentController.getByProfessor);
  router.put('/students/:id', studentController.update);
  router.delete('/students/:id', studentController.delete);

  router.post('/professors', professorController.create);
  router.get('/professors', professorController.getAll);
  router.put('/professors/:id', professorController.update);
  router.delete('/professors/:id', professorController.delete);

  router.get('/quiz-scores', quizScoreController.getAllStudentsQuizScores);
  router.get('/quiz-scores/professor/:professorId', quizScoreController.getProfessorStudentsQuizScores);
  router.get('/quiz-scores/:userId', quizScoreController.getStudentQuizScores);

  return router;
}
