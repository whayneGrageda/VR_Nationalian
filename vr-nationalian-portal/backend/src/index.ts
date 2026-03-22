import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { SupabaseClientFactory } from './infrastructure/database/SupabaseClient';
import { UserRepository } from './infrastructure/repositories/UserRepository';
import { SectionRepository } from './infrastructure/repositories/SectionRepository';
import { ProfessorRepository } from './infrastructure/repositories/ProfessorRepository';
import { StudentProgressRepository } from './infrastructure/repositories/StudentProgressRepository';
import { AnalyticsRepository } from './infrastructure/repositories/AnalyticsRepository';
import { LeaderboardRepository } from './infrastructure/repositories/LeaderboardRepository';
import { QuizScoreRepository } from './infrastructure/repositories/QuizScoreRepository';
import { AuthUseCase } from './application/usecases/AuthUseCase';
import { SectionUseCase } from './application/usecases/SectionUseCase';
import { StudentUseCase } from './application/usecases/StudentUseCase';
import { ProfessorUseCase } from './application/usecases/ProfessorUseCase';
import { StatsUseCase } from './application/usecases/StatsUseCase';
import { ProfessorStatsUseCase } from './application/usecases/ProfessorStatsUseCase';
import { UserProfileUseCase } from './application/usecases/UserProfileUseCase';
import { StudentProgressUseCase } from './application/usecases/StudentProgressUseCase';
import { AnalyticsUseCase } from './application/usecases/AnalyticsUseCase';
import { LeaderboardUseCase } from './application/usecases/LeaderboardUseCase';
import { QuizScoreUseCase } from './application/usecases/QuizScoreUseCase';
import { LogoutUseCase } from './application/usecases/LogoutUseCase';
import { AuthController } from './presentation/controllers/AuthController';
import { SectionController } from './presentation/controllers/SectionController';
import { StudentController } from './presentation/controllers/StudentController';
import { ProfessorController } from './presentation/controllers/ProfessorController';
import { StatsController } from './presentation/controllers/StatsController';
import { ProfessorStatsController } from './presentation/controllers/ProfessorStatsController';
import { UserProfileController } from './presentation/controllers/UserProfileController';
import { StudentProgressController } from './presentation/controllers/StudentProgressController';
import { AnalyticsController } from './presentation/controllers/AnalyticsController';
import { HealthController } from './presentation/controllers/HealthController';
import { LeaderboardController } from './presentation/controllers/LeaderboardController';
import { QuizScoreController } from './presentation/controllers/QuizScoreController';
import { LogoutController } from './presentation/controllers/LogoutController';
import { createRoutes } from './presentation/routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const supabase = SupabaseClientFactory.getInstance();
const userRepository = new UserRepository(supabase);
const sectionRepository = new SectionRepository(supabase);
const professorRepository = new ProfessorRepository(supabase);
const studentProgressRepository = new StudentProgressRepository(supabase);
const analyticsRepository = new AnalyticsRepository(supabase);
const leaderboardRepository = new LeaderboardRepository(supabase);
const quizScoreRepository = new QuizScoreRepository(supabase);

const authUseCase = new AuthUseCase(userRepository);
const sectionUseCase = new SectionUseCase(sectionRepository);
const studentUseCase = new StudentUseCase(userRepository);
const professorUseCase = new ProfessorUseCase(professorRepository);
const statsUseCase = new StatsUseCase(userRepository, sectionRepository, professorRepository);
const professorStatsUseCase = new ProfessorStatsUseCase(sectionRepository, userRepository);
const userProfileUseCase = new UserProfileUseCase(userRepository);
const studentProgressUseCase = new StudentProgressUseCase(studentProgressRepository);
const analyticsUseCase = new AnalyticsUseCase(analyticsRepository);
const leaderboardUseCase = new LeaderboardUseCase(leaderboardRepository);
const quizScoreUseCase = new QuizScoreUseCase(quizScoreRepository);
const logoutUseCase = new LogoutUseCase(userRepository);

const authController = new AuthController(authUseCase);
const sectionController = new SectionController(sectionUseCase);
const studentController = new StudentController(studentUseCase);
const professorController = new ProfessorController(professorUseCase);
const statsController = new StatsController(statsUseCase);
const professorStatsController = new ProfessorStatsController(professorStatsUseCase);
const userProfileController = new UserProfileController(userProfileUseCase);
const studentProgressController = new StudentProgressController(studentProgressUseCase);
const analyticsController = new AnalyticsController(analyticsUseCase);
const healthController = new HealthController(supabase);
const leaderboardController = new LeaderboardController(leaderboardUseCase);
const quizScoreController = new QuizScoreController(quizScoreUseCase);
const logoutController = new LogoutController(logoutUseCase);

const routes = createRoutes(authController, sectionController, studentController, professorController, statsController, professorStatsController, userProfileController, studentProgressController, analyticsController, healthController, leaderboardController, logoutController, quizScoreController);
app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
