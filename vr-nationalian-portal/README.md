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
- Login with username/password
- Role-based access control (Professor/Admin)
- Session management
- Protected routes

#### Professor Features
- Dashboard with statistics
- Section management (Create, Read, Update, Delete)
- Student management (Create, Read, Update, Delete)
- Filter students by section

#### Admin Features
- System-wide dashboard
- Professor management (Create, Read, Update, Delete)
- Access to all sections and students
- System analytics

#### UI/UX
- Dark theme design (inspired by modern dev tools)
- Responsive sidebar navigation
- Modal forms for CRUD operations
- Data tables with actions
- Empty states and loading indicators
- Error handling and validation

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

Ensure your Supabase database has all required functions from SKILL.md:
- `fn_login()`
- `fn_create_section()`, `fn_get_sections_by_professor()`, `fn_update_section()`, `fn_delete_section()`
- `fn_create_student()`, `fn_get_students_by_section()`, `fn_update_student()`, `fn_delete_student()`

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
- `POST /api/auth/login` - Login (professors/admins only)
  - Body: `{ username, password }`
  - Returns: User object with session token

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

## Access Control

### Role-Based Access

- **Students (role_id = 1)**
  - Mobile app only (Unity VR game)
  - Cannot access web portal

- **Professors (role_id = 2)**
  - Web portal access
  - Manage their own sections
  - Manage students within their sections
  - View their dashboard

- **Admins (role_id = 3)**
  - Web portal access
  - Manage all professors
  - Access all sections and students
  - System-wide analytics

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

⚠️ **Current Implementation (Development Only)**
- Passwords stored as plain text in database
- Simple session token (MD5 hash)
- No password strength requirements
- No rate limiting

🔒 **Production Requirements**
- Hash passwords (bcrypt/argon2)
- Implement JWT tokens
- Add password strength validation
- Enable Row Level Security (RLS) in Supabase
- Add rate limiting
- Implement HTTPS only
- Add CSRF protection
- Implement refresh tokens

## License

ISC
