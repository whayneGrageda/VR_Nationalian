# VR Nationalian Web Portal

Complete web portal for professors and admins to manage the VR Nationalian educational game system.

## Architecture

- **Clean Architecture** with clear separation of concerns
- **SOLID Principles** for maintainable code
- **DRY** - Don't Repeat Yourself
- **Single Source of Truth**
- **KISS** - Keep It Simple
- **YAGNI** - You Aren't Gonna Need It

## Tech Stack

- **Backend**: Node.js v20.17.0, TypeScript, Express
- **Frontend**: React, TypeScript (TSX), Vite
- **Database**: Supabase (PostgreSQL)
- **Package Manager**: npm 10.8.3

## Project Structure

```
vr-nationalian-portal/
├── backend/                     # Express API Server
│   ├── src/
│   │   ├── domain/              # Business entities and interfaces
│   │   │   ├── entities/        # User, Section, Professor, Student
│   │   │   └── repositories/    # Repository interfaces (contracts)
│   │   ├── application/         # Use cases (business logic)
│   │   │   └── usecases/        # Auth, Section, Student, Professor
│   │   ├── infrastructure/      # External services implementation
│   │   │   ├── database/        # Supabase client factory
│   │   │   └── repositories/    # Repository implementations
│   │   └── presentation/        # API layer
│   │       ├── controllers/     # Request handlers
│   │       └── routes/          # Route definitions
│   ├── .env                     # Environment variables
│   └── package.json
├── frontend/                    # React SPA
│   ├── src/
│   │   ├── components/          # Reusable components
│   │   │   ├── Layout.tsx       # Main layout with sidebar
│   │   │   ├── Sidebar.tsx      # Navigation sidebar
│   │   │   └── ProtectedRoute.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── AuthContext.tsx  # Authentication state
│   │   ├── pages/               # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── ProfessorDashboard.tsx
│   │   │   ├── AdminDashboard.tsx
│   │   │   ├── SectionsPage.tsx
│   │   │   ├── StudentsPage.tsx
│   │   │   └── AdminProfessorsPage.tsx
│   │   └── main.tsx
│   └── package.json
└── package.json                 # Root workspace config
```

## Features

### ✅ Completed Features

#### Authentication
- Login with username/password (bcrypt hashed)
- Role-based access control (Student/Professor/Admin)
- Session management with active/inactive tracking
- Logout functionality that deactivates sessions
- Protected routes
- Automatic "Welcome Back" achievement on first login
- Prevents duplicate sessions per device type

#### Student Features
- Personal dashboard with progress tracking
- View chapter completion status
- View unlocked achievements
- Track playtime statistics
- Access to leaderboards

#### Professor Features
- Dashboard with section statistics
- Section management (Create, Read, Update, Delete)
- Student management (Create, Read, Update, Delete)
- Filter students by section
- View student progress and achievements

#### Admin Features
- System-wide dashboard with real-time health monitoring
- Quick insights (2x2 grid with key metrics)
- Recent activity feed (5 most recent, green background)
- Professor management (Create, Read, Update, Delete)
- Access to all sections and students
- Analytics page with time-based trends and insights
- Leaderboard system with podium-style rankings

#### Analytics & Insights
- Weekly completion trends (line chart)
- Chapter difficulty analysis with drop-off rates
- Achievement rarity ranking
- At-risk student alerts
- Playtime distribution
- Chapter completion rates
- Achievement unlock rates

#### Leaderboard System
- Most Achievements (top 10 students)
- Fastest Completion (speedrunners who completed all 4 chapters)
- Top Sections (sections with highest completion rates)
- Podium-style display for top 3
- Rankings list showing positions 4-10
- Medal icons (Crown, Medal, Star) for top 3
- Available in all three user role sidebars

#### UI/UX
- Dark theme design (#111827 backgrounds, #1e293b borders)
- Responsive sidebar navigation for all roles
- Modal forms for CRUD operations
- Data tables with actions
- Skeleton loading states
- Empty states with placeholders
- Error handling and validation
- Special violet highlight for "Master of the Realm" achievement
- Green background for recent activities
- Lucide React icons throughout

## Setup Instructions

### Prerequisites
- Node.js v20.17.0
- npm 10.8.3
- Supabase account with database setup

### 1. Install Dependencies

```bash
cd vr-nationalian-portal
npm install
```

This will install dependencies for root, backend, and frontend workspaces.

### 2. Configure Backend

Create `backend/.env` file:

```env
PORT=3000
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings.

### 3. Database Setup

Ensure your Supabase database has all required tables and functions:

#### Required Tables
- `tblusers` - User accounts (students, professors, admins)
- `tblsections` - Class sections
- `tblchapters` - Game chapters
- `tblachievements` - Achievement definitions
- `tbluserachievements` - User achievement unlocks
- `tblcompleted_chapters` - Chapter completion tracking
- `tbluserprofiles` - User profile data and playtime
- `tblsessions` - Login session tracking

#### Required Functions
- `fn_login()` - Authentication with bcrypt password hashing
- `fn_create_section()`, `fn_get_sections_by_professor()`, `fn_update_section()`, `fn_delete_section()`
- `fn_create_student()`, `fn_get_students_by_section()`, `fn_update_student()`, `fn_delete_student()`
- `fn_update_profile()` - Update user profile with password hashing

#### Database Triggers
Run the SQL migration to enable automatic achievement granting:
```bash
# In Supabase SQL Editor, run:
# mds-and-sqls/GRANT_FIRST_LOGIN_ACHIEVEMENT.sql
```

This creates a trigger that automatically grants the "Welcome Back" achievement when students log in for the first time (works for both Unity VR and web portal).

Run the SQL migration to add session tracking:
```bash
# In Supabase SQL Editor, run:
# mds-and-sqls/ADD_IS_ACTIVE_TO_SESSIONS.sql
```

This adds the `is_active` column to track active/inactive sessions for accurate login metrics and proper logout functionality.

See `mds-and-sqls/ACHIEVEMENT_TRIGGER_README.md` for detailed setup instructions.

### 4. Run Development Servers

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```
Server runs on http://localhost:3000

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```
App runs on http://localhost:5173

### 5. Build for Production

```bash
npm run build
```

This builds both backend and frontend.

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login (all roles)
  - Body: `{ username, password }`
  - Returns: User object with session token
- `POST /api/auth/logout` - Logout (all roles)
  - Body: `{ sessionToken }`
  - Returns: Success message

### Health Check
- `GET /api/health` - System health status
  - Returns: Database status, API uptime, active VR sessions

### Sections
- `POST /api/sections` - Create section
  - Body: `{ sectionName, professorId }`
- `GET /api/sections/professor/:professorId` - Get professor's sections
- `PUT /api/sections/:id` - Update section
  - Body: `{ sectionName }`
- `DELETE /api/sections/:id` - Delete section

### Students
- `POST /api/students` - Create student
  - Body: `{ username, password, firstName, middleInitial, lastName, sectionId }`
- `GET /api/students/section/:sectionId` - Get students by section
- `PUT /api/students/:id` - Update student
  - Body: `{ username, firstName, middleInitial, lastName, sectionId }`
- `DELETE /api/students/:id` - Delete student

### Professors (Admin only)
- `POST /api/professors` - Create professor
  - Body: `{ username, password, firstName, middleInitial, lastName }`
- `GET /api/professors` - Get all professors
- `PUT /api/professors/:id` - Update professor
  - Body: `{ username, firstName, middleInitial, lastName }`
- `DELETE /api/professors/:id` - Delete professor

### Analytics (Admin only)
- `GET /api/analytics/admin` - Get comprehensive analytics
  - Returns: Student counts, completion rates, top students, recent activity

### Leaderboards
- `GET /api/leaderboards` - Get all leaderboard data
  - Returns: Top achievements, fastest completions, top sections

### Student Progress
- `GET /api/student-progress/:userId` - Get student progress
  - Returns: Chapters completed, achievements unlocked, playtime

### User Profile
- `GET /api/user-profile/:userId` - Get user profile
- `PUT /api/user-profile/:userId` - Update user profile
- `PUT /api/user-profile/:userId/password` - Change password

## Access Control

### Role-Based Access

- **Students (role_id = 1)**
  - Unity VR game access
  - Web portal access (view-only dashboard)
  - View personal progress and achievements
  - Access leaderboards
  - Update profile and change password

- **Professors (role_id = 2)**
  - Web portal access
  - Manage their own sections
  - Manage students within their sections
  - View student progress and achievements
  - View their dashboard with section statistics
  - Access leaderboards

- **Admins (role_id = 3)**
  - Web portal access
  - Manage all professors
  - Access all sections and students
  - System-wide analytics and insights
  - Real-time health monitoring
  - Access leaderboards

## Development

### Code Style
- TypeScript strict mode enabled
- Clean Architecture principles
- Dependency injection
- Interface-based design

### Frontend
- React 18 with TypeScript
- Vite for fast development
- CSS modules for styling
- Context API for state management

### Backend
- Express with TypeScript
- Clean Architecture layers
- Repository pattern
- Use case pattern

## Troubleshooting

### Backend won't start
- Check `.env` file exists with correct Supabase credentials
- Verify Node.js version: `node --version` (should be v20.17.0)
- Check port 3000 is not in use

### Frontend won't connect to backend
- Ensure backend is running on port 3000
- Check Vite proxy configuration in `vite.config.ts`
- Verify CORS is enabled in backend

### Login fails
- Verify user exists in Supabase `tblusers` table
- Check user has role_id 2 (professor) or 3 (admin)
- Ensure `fn_login()` function exists in Supabase

### Database errors
- Verify all Supabase functions are created
- Check table structure matches SKILL.md schema
- Ensure foreign key constraints are set up

## Security Notes

✅ **Current Implementation**
- Passwords hashed with bcrypt at database level (pgcrypto extension)
- Session-based authentication with active/inactive tracking
- Logout functionality that deactivates sessions
- Role-based access control
- Database-level password validation via Supabase RPC functions
- Automatic achievement granting via database triggers
- Prevents duplicate sessions per device type

🔒 **Production Recommendations**
- Enable Row Level Security (RLS) in Supabase
- Implement JWT tokens with refresh tokens
- Add rate limiting on login endpoints
- Implement HTTPS only
- Add CSRF protection
- Add password strength requirements in UI
- Implement account lockout after failed attempts
- Add audit logging for sensitive operations

## License

ISC
