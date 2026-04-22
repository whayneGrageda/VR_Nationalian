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
- Styling: CSS with dark theme (#111827, #1e293b, #e2e8f0)

## Features

### Authentication & Security
- Bcrypt password hashing at database level
- Role-based access control (Student/Professor/Admin)
- Session management with active/inactive tracking
- Logout functionality that deactivates sessions
- Database triggers for automatic achievement granting
- Prevents duplicate sessions per device type

### Student Portal
- Personal dashboard with progress tracking
- Chapter completion status (4 chapters)
- Achievement tracking and unlocks
- Playtime statistics
- Leaderboard access
- Profile management

### Professor Portal
- Section management (CRUD operations)
- Student management within sections
- Student progress monitoring
- Achievement tracking per student
- Section statistics dashboard
- Leaderboard access
- Archive management (view and reactivate archived students)
- Bulk archive operations with scheduling

### Admin Portal
- System-wide dashboard with real-time health monitoring
- Quick insights (2x2 grid: avg students/section, logins today, most active section, chapters this week)
- Recent activity feed (5 most recent, green background, violet highlight for Master of the Realm)
- Professor management (CRUD operations)
- Section deactivation/activation (admin-only)
- Student deletion (permanent removal, admin-only)
- Archive management (view, reactivate, and delete archived users)
- Analytics page with time-based trends
- Leaderboard system access
- Bulk operations (archive, delete, deactivate)

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
- Dark theme design
- Responsive sidebar navigation for all roles
- Modal forms for CRUD operations
- Skeleton loading states
- Empty states with placeholders
- Real-time data updates
- User-friendly error messages (no technical jargon)
- Error handling and validation
- Lucide React icons throughout
- Role-based permission controls
- Clickable table rows for quick navigation
- Status badges (Active/Inactive, Archived)
- Student count display in sections
- Bulk selection with checkboxes

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
    System((0.0 VR Nationalian System))
    System --- Student[Student]
    System --- Professor[Professor]
    System --- Admin[Admin]
    System --- VRApp[VR Mobile App]
    style System fill:#3b82f6,stroke:#333,stroke-width:2px,color:#000
```

### 4.2.3 Data Flow Diagram Level 1 (Functional)
Breaks down the core real-time loop into four human-readable processes.

```mermaid
graph TD
    P1((1.0 Submit Progress))
    P2((2.0 Verify Identity))
    P3((3.0 Save to Database))
    P4((4.0 Sync Live Dashboard))

    D1[/Authentication Data/]
    D2[/Assessment Data/]

    P1 -- payload --> P2
    P2 -- fn_login --> D1
    P2 -- auth ok --> P3
    P3 -- insert --> D2
    P3 -- WAL signal --> P4
    P4 -- query --> D2
    P4 -- broadcast --> P1

    style P1 fill:#f8fafc,stroke:#333,color:#000
    style P2 fill:#f8fafc,stroke:#333,color:#000
    style P3 fill:#f8fafc,stroke:#333,color:#000
    style P4 fill:#f8fafc,stroke:#333,color:#000
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
    User([User]) -- "p_username / p_password" --> P2_1[2.1 Receive Login Payload]
    P2_1 -- "Execute fn_login()" --> P2_2[2.2 RPC Logic]
    P2_2 -- "Query" --> D1[/Auth Data/]
    P2_2 -- "Token" --> User
    style P2_1 fill:#f8fafc,stroke:#333,color:#000
    style P2_2 fill:#f8fafc,stroke:#333,color:#000
```

#### Process 3.0: Progress Archival
```mermaid
graph TD
    VR([VR App]) -- "Score / Chapter ID" --> P3_1[3.1 Capture Result]
    P3_1 -- "Commit" --> P3_2[3.2 Update Tables]
    P3_2 -- "Insert" --> D2[/Assessment Data/]
    style P3_1 fill:#f8fafc,stroke:#333,color:#000
    style P3_2 fill:#f8fafc,stroke:#333,color:#000
```

#### Process 4.0: Real-time Sync Loop
```mermaid
graph TD
    D2[(Supabase DB)] -- "WAL Update" --> P4_1[4.1 Broadcast Event]
    P4_1 -- "WebSocket Msg" --> P4_2[4.2 Web Listener]
    P4_2 -- "State Refresh" --> P4_3[4.3 Update UI]
    P4_3 -- "Live View" --> Web([Web Dashboard])
    style P4_1 fill:#3ecf8e,stroke:#333,color:#000
    style P4_2 fill:#f8fafc,stroke:#333,color:#000
    style P4_3 fill:#f8fafc,stroke:#333,color:#000
```


## Recent Updates

### March 2026 - Permission Refinements & Section Management
- **Section Deactivation**: Admins can now deactivate sections without deleting them
  - Deactivated sections remain accessible to professors and enrolled students
  - Hidden from new student enrollment
  - Can be reactivated at any time
- **User-Friendly Error Handling**: Replaced technical errors with clear, actionable messages
  - Network connectivity issues show helpful guidance
  - Server errors provide user-friendly explanations
  - Consistent error handling across all pages
- **Permission Updates**:
  - Professors can only edit and archive students (no deletion)
  - Professors cannot edit, delete, or deactivate sections
  - Professors cannot permanently delete archived users
  - All destructive actions (delete, deactivate) are admin-only
- **UX Improvements**:
  - Added student count column in sections view
  - Made entire student rows clickable for quick access
  - Added bulk operations with checkbox selection
  - Improved visual indicators with status badges
