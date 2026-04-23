# VR Nationalian Web Portal

## Architecture
Clean Architecture with clear separation of concerns:
- Domain Layer (Entities & Repository Interfaces)
- Application Layer (Use Cases & Business Logic)
- Infrastructure Layer (Database & External Services)
- Presentation Layer (Controllers & Routes)

## Principles
- SOLID Principles
- DRY (Don't Repeat Yourself)
- Single Source of Truth
- KISS (Keep It Simple)
- YAGNI (You Aren't Gonna Need It)
- Dependency Injection
- Interface-Based Design

## Tech Stack
- Backend: Node.js v20.17.0, TypeScript, Express
- Frontend: React 18, TypeScript (TSX), Vite
- Database: Supabase (Postgres)
- Real-time: Supabase Realtime (@supabase/supabase-js)
- Authentication: bcrypt password hashing, session-based
- Package Manager: npm 10.8.3
- Icons: Lucide React
- Charts: Recharts (for analytics visualizations)
- Styling: CSS with dark theme (#111827, #1e293b, #e2e8f0)
- Fonts: Inter (UI), JetBrains Mono (code/labels)

## Features

### Authentication & Security
- Bcrypt password hashing at database level
- Role-based access control (Student/Professor/Admin)
- Session management with active/inactive tracking
- Logout functionality that deactivates sessions
- Database triggers for automatic achievement granting
- Prevents duplicate sessions per device type
- Account deactivation/archiving system with scheduled archiving
- User-friendly error messages (no technical jargon exposed to users)

### Student Portal
- Personal dashboard with progress tracking
- Chapter completion status (4 chapters)
- Achievement tracking and unlocks
- Playtime statistics
- Leaderboard access
- Profile management

### Professor Portal
- Section management (view sections with student counts)
- Student management within sections (edit and archive only)
- Student progress monitoring with clickable rows for quick access
- Achievement tracking per student
- Section statistics dashboard
- Leaderboard access
- Archive management (view and reactivate archived students)
- Bulk archive operations with scheduling
- Chapter-wise quiz score tracking
- Permission restrictions: cannot delete students, sections, or archived users

### Admin Portal
- System-wide dashboard with real-time health monitoring
- Quick insights (2x2 grid: avg students/section, logins today, most active section, chapters this week)
- Recent activity feed (5 most recent, green background, violet highlight for Master of the Realm)
- Professor management (full CRUD operations)
- Section management with deactivation/activation (admin-only)
- Student management with permanent deletion (admin-only)
- Archive management (view, reactivate, and permanently delete archived users)
- Analytics page with time-based trends and insights
- Leaderboard system access
- Bulk operations (archive, delete, deactivate sections)
- Full administrative control over all system entities

### Analytics & Insights
- Weekly completion trends (line chart)
- Chapter difficulty analysis with drop-off rates
- Achievement rarity ranking
- At-risk student alerts
- Playtime distribution
- Chapter completion rates
- Achievement unlock rates

### Leaderboard System
- Most Achievements (top 10 students with podium display)
- Fastest Completion (speedrunners who completed all 4 chapters)
- Top Sections (sections with highest completion rates)
- Podium-style top 3 with Crown/Medal/Star icons
- Rankings list for positions 4-10 with placeholders
- Available across all user roles

### UI/UX
- Dark theme design with consistent color palette
- Responsive sidebar navigation for all roles
- Modal forms for CRUD operations
- Skeleton loading states for better perceived performance
- Empty states with helpful placeholders
- Real-time data updates via Supabase
- User-friendly error messages (network issues, server errors, etc.)
- Comprehensive error handling and validation
- Lucide React icons throughout
- Role-based permission controls and UI elements
- Clickable table rows for quick navigation
- Status badges (Active/Inactive, Archived) with visual indicators
- Student count display in sections
- Bulk selection with checkboxes
- Pagination for large datasets
- Filter and search capabilities
- Success/error banners for user feedback

## System & Data Flow Architecture

The portal utilizes **Supabase Realtime** to provide instant updates. The following diagrams document the system's functional and technical flow according to standard DFD levels.

### 4.2.1 Use Case Diagram
Describes the functional interactions between actors and the real-time system.

```mermaid
graph TD
    %% Actors
    Student([Student])
    Professor([Professor])
    Admin([Admin])
    Supabase((Supabase Realtime))

    %% Use Cases
    UC1(Perform VR Activities / Quizzes)
    UC2(View Live Leaderboards)
    UC3(Monitor Real-time Analytics)
    UC4(Auto-update Dashboard State)

    %% Relationships
    Student --- UC1
    Student --- UC2
    Professor --- UC2
    Admin --- UC2
    Admin --- UC3

    %% Realtime Flow
    UC1 ==> Supabase
    Supabase ==> UC4
    UC4 --> UC2
    UC4 --> UC3

    %% Styling for Black Text
    style Supabase fill:#3ecf8e,stroke:#333,stroke-width:2px,color:#000
    style UC4 fill:#3b82f6,stroke:#333,stroke-width:2px,color:#000
    style Student fill:#f8fafc,stroke:#333,color:#000
    style Professor fill:#f8fafc,stroke:#333,color:#000
    style Admin fill:#f8fafc,stroke:#333,color:#000
```

### 4.2.2 Data Flow Diagram Level 0 (Context)
Defines the overall scope and external boundaries of the VR Nationalian System.

```mermaid
graph LR
    %% Actors
    Student[Student]
    Professor[Professor]
    Admin[Admin]
    VRApp[VR Mobile App]

    %% System
    System((0.0 VR Nationalian System))

    %% Data Flows
    Student -- "Login / Stats Requests" --> System
    System -- "Live Leaderboards" --> Student

    Professor -- "Section Management" --> System
    System -- "Progress Data" --> Professor

    Admin -- "System Analytics" --> System
    System -- "Global Stats" --> Admin

    VRApp -- "Activity / Quiz Data" --> System
    System -- "User State / Token" --> VRApp

    %% Styling for Black Text
    style System fill:#3b82f6,stroke:#333,stroke-width:2px,color:#000
    style Student fill:#f8fafc,stroke:#333,color:#000
    style Professor fill:#f8fafc,stroke:#333,color:#000
    style Admin fill:#f8fafc,stroke:#333,color:#000
    style VRApp fill:#f8fafc,stroke:#333,color:#000
```

### 4.2.3 Data Flow Diagram Level 1 (Functional)
Breaks down the core real-time loop into four human-readable processes managing data movement from VR to Web.

```mermaid
graph TD
    %% External Entities
    S[Student / Professor]
    A[Admin]
    VR[VR Mobile App]

    %% Processes
    P1((1.0 Submit Progress))
    P2((2.0 Verify Identity))
    P3((3.0 Save to Database))
    P4((4.0 Sync Live Dashboard))

    %% Data Stores
    D1[/Authentication Data/]
    D2[/Assessment Data/]
    D3[/Assessment Artifacts/]

    %% Flows from Entities
    S -- "Input Request" --> P1
    VR -- "VR Data Payload" --> P1
    A -- "Management Query" --> P1

    %% Internal Flows
    P1 -- "Request Payload" --> P2
    P2 -- "Verify fn_login" --> D1
    D1 -- "Auth Token" --> P2
    P2 -- "Authorized Data" --> P3
    P3 -- "Record Progress" --> D2
    P3 -- "Record Achievement" --> D3
    
    P3 -- "Real-time Signal" --> P4
    P4 -- "Query Stats" --> D2
    D2 -- "Latest Stats" --> P4
    
    %% Outputs
    P4 -- "Refreshed UI" --> S
    P4 -- "Live Analytics" --> A

    %% Styling for Black Text
    style P1 fill:#f8fafc,stroke:#333,color:#000
    style P2 fill:#f8fafc,stroke:#333,color:#000
    style P3 fill:#f8fafc,stroke:#333,color:#000
    style P4 fill:#f8fafc,stroke:#333,color:#000
    style D1 fill:#cbd5e1,stroke:#333,color:#000
    style D2 fill:#cbd5e1,stroke:#333,color:#000
    style D3 fill:#cbd5e1,stroke:#333,color:#000
```

### 4.2.4 Real-time Implementation Mapping
The following table maps the diagram processes to their actual locations in the source code.

| DFD Process | Code Implementation Location | Technology |
| :--- | :--- | :--- |
| **1.0 Submit Progress** | `SupabaseManager.cs` (Unity) / `LeaderboardPage.tsx` | C# / React |
| **2.0 Verify Identity** | Supabase RPC: `fn_login` | PL/pgSQL |
| **3.0 Save to Database** | Supabase RPC: `SubmitQuiz`, `CompleteChapter` | PL/pgSQL |
| **4.0 Sync Live Dashboard** | `frontend/src/utils/supabaseClient.ts` | WebSocket (Supabase) |
| **4.2 Web State Listener** | `LeaderboardPage.tsx`, `AnalyticsPage.tsx`, `StudentDashboard.tsx` | React `useEffect` |
| **4.3 Update UI Stats** | Callbacks like `fetchLeaderboards()` or `fetchStats()` | React Hooks |

### 4.2.5 Data Flow Diagram Level 2 (Process Explosions)
Technical breakdown of user validation, result archival, and the real-time sync cycle.

#### Process 2.0: Identity Verification
```mermaid
graph TD
    User([User Entity]) -- "Credentials" --> P2_1[2.1 Receive Login Data]
    P2_1 -- "Execute fn_login" --> P2_2[2.2 Cross-check Identity]
    P2_2 -- "Query" --> D1[/Authentication Data/]
    D1 -- "Match" --> P2_2
    P2_2 -- "Status" --> P2_3[2.3 Generate Token]
    P2_3 -- "JWT Token" --> User

    %% Styling for Black Text
    style P2_1 fill:#f8fafc,stroke:#333,color:#000
    style P2_2 fill:#f8fafc,stroke:#333,color:#000
    style P2_3 fill:#f8fafc,stroke:#333,color:#000
    style D1 fill:#cbd5e1,stroke:#333,color:#000
```

#### Process 3.0: Progress Archival
```mermaid
graph TD
    VR([VR App Entity]) -- "SubmitQuiz payload" --> P3_1[3.1 Capture Result]
    P3_1 -- "Validation" --> P3_2[3.2 Commit to Table]
    P3_2 -- "Update: tblquizscores" --> D2[/Assessment Data/]
    P3_2 -- "Update: tbluserachievements" --> D3[/Assessment Artifacts/]

    %% Styling for Black Text
    style P3_1 fill:#f8fafc,stroke:#333,color:#000
    style P3_2 fill:#f8fafc,stroke:#333,color:#000
    style D2 fill:#cbd5e1,stroke:#333,color:#000
    style D3 fill:#cbd5e1,stroke:#333,color:#000
```

#### Process 4.0: Real-time Sync Loop
```mermaid
graph TD
    DB[(Supabase DB)] -- "WAL Update" --> P4_1[4.1 Broadcast Event]
    P4_1 -- "WebSocket Msg" --> P4_2[4.2 Web State Listener]
    P4_2 -- "Auto-Refresh" --> P4_3[4.3 Update UI Stats]
    P4_3 -- "Live View" --> Web([Web Dashboard])

    %% Styling for Black Text
    style P4_1 fill:#3ecf8e,stroke:#333,color:#000
    style P4_2 fill:#f8fafc,stroke:#333,color:#000
    style P4_3 fill:#f8fafc,stroke:#333,color:#000
    style Web fill:#3b82f6,stroke:#333,color:#000
    style DB fill:#cbd5e1,stroke:#333,color:#000
```


## Project Structure

### Backend (`/backend/src`)
```
backend/src/
├── application/
│   └── usecases/          # Business logic layer
│       ├── AnalyticsUseCase.ts
│       ├── AuthUseCase.ts
│       ├── LeaderboardUseCase.ts
│       ├── ProfessorUseCase.ts
│       ├── QuizScoreUseCase.ts
│       ├── SectionUseCase.ts
│       ├── StatsUseCase.ts
│       ├── StudentProgressUseCase.ts
│       ├── StudentUseCase.ts
│       └── UserProfileUseCase.ts
├── domain/
│   ├── entities/          # Domain models
│   │   ├── Analytics.ts
│   │   ├── Leaderboard.ts
│   │   ├── Professor.ts
│   │   ├── QuizScore.ts
│   │   ├── Section.ts
│   │   ├── StudentProgress.ts
│   │   └── User.ts
│   └── repositories/      # Repository interfaces
│       ├── IAnalyticsRepository.ts
│       ├── ILeaderboardRepository.ts
│       ├── IProfessorRepository.ts
│       ├── IQuizScoreRepository.ts
│       ├── ISectionRepository.ts
│       ├── IStudentProgressRepository.ts
│       └── IUserRepository.ts
├── infrastructure/
│   ├── database/
│   │   └── SupabaseClient.ts
│   └── repositories/      # Repository implementations
│       ├── AnalyticsRepository.ts
│       ├── LeaderboardRepository.ts
│       ├── ProfessorRepository.ts
│       ├── QuizScoreRepository.ts
│       ├── SectionRepository.ts
│       ├── StudentProgressRepository.ts
│       └── UserRepository.ts
├── presentation/
│   ├── controllers/       # Request handlers
│   │   ├── AnalyticsController.ts
│   │   ├── AuthController.ts
│   │   ├── HealthController.ts
│   │   ├── LeaderboardController.ts
│   │   ├── ProfessorController.ts
│   │   ├── QuizScoreController.ts
│   │   ├── SectionController.ts
│   │   ├── StatsController.ts
│   │   ├── StudentController.ts
│   │   ├── StudentProgressController.ts
│   │   └── UserProfileController.ts
│   └── routes/
│       └── index.ts       # API route definitions
└── index.ts               # Application entry point
```

### Frontend (`/frontend/src`)
```
frontend/src/
├── components/            # Reusable UI components
│   ├── Layout.tsx         # Main layout wrapper
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── StudentLayout.tsx  # Student-specific layout
│   ├── StudentSidebar.tsx # Student navigation
│   ├── Pagination.tsx     # Pagination component
│   ├── Skeleton.tsx       # Loading skeletons
│   └── ProtectedRoute.tsx # Route guard
├── contexts/
│   └── AuthContext.tsx    # Authentication state management
├── pages/
│   ├── admin/             # Admin-only pages
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProfessorsPage.tsx
│   │   ├── AdminStudentsPage.tsx
│   │   └── AnalyticsPage.tsx
│   ├── professor/         # Professor-only pages
│   │   ├── ProfessorDashboard.tsx
│   │   ├── SectionsPage.tsx
│   │   └── StudentsPage.tsx
│   ├── shared/            # Multi-role pages
│   │   ├── LoginPage.tsx
│   │   ├── ArchivesPage.tsx
│   │   ├── LeaderboardPage.tsx
│   │   └── ChaptersPage.tsx
│   └── student/           # Student-only pages
│       ├── StudentDashboard.tsx
│       ├── StudentAchievements.tsx
│       ├── StudentAssessments.tsx
│       └── StudentSettings.tsx
├── utils/
│   ├── errorHandler.ts    # User-friendly error handling
│   └── supabaseClient.ts  # Supabase configuration
├── App.tsx                # Root component with routing
└── main.tsx               # Application entry point
```

### Documentation (`/mds-and-sqls`)
- `database (1).md` - Complete database schema and functions
- `FEATURES.md` - Feature checklist and roadmap
- `API_DOCUMENTATION.md` - API endpoint documentation
- `USER_FRIENDLY_ERROR_HANDLING.md` - Error handling guide
- `SECTION_DEACTIVATION_GUIDE.md` - Section deactivation feature
- `ARCHIVE_IMPLEMENTATION.md` - Archive system documentation
- `LEADERBOARD_IMPLEMENTATION.md` - Leaderboard system guide
- SQL migration files for database updates

## Recent Updates

### April 2026 - Frontend Reorganization & Code Structure
- **Frontend Reorganization**: Restructured pages by role for better maintainability
  - Created role-based folders: `admin/`, `professor/`, `student/`, `shared/`
  - Moved CSS files alongside their components
  - Updated all import paths automatically
  - Improved code organization and discoverability
- **Section Management Enhancements**:
  - Added student count display in sections table
  - Implemented section deactivation (admin-only)
  - Deactivated sections remain accessible but hidden from new enrollments
  - Bulk deactivation support with checkbox selection
- **Permission System Refinements**:
  - Professors: Can only edit and archive students (no deletion)
  - Professors: Cannot edit, delete, or deactivate sections (view-only)
  - Professors: Cannot permanently delete archived users
  - Admins: Full control over all destructive operations
- **User Experience Improvements**:
  - User-friendly error messages replacing technical jargon
  - Network errors show helpful connectivity guidance
  - Clickable table rows for faster navigation
  - Status badges with visual indicators (Active/Inactive)
  - Improved bulk operations with better feedback
- **Error Handling System**:
  - Centralized error handler utility
  - Consistent error messages across all pages
  - Graceful handling of network failures
  - Better user feedback for server errors
