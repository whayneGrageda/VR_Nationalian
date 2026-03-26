# Archive Feature Implementation

## Overview
Archiving system for students and professors with immediate and scheduled archiving capabilities.

## Database Changes

### SQL Migration: ADD_IS_ACTIVE_TO_USERS.sql
- Adds `is_active` boolean column (default: true)
- Adds `scheduled_archive_date` timestamptz column
- Creates indexes for performance
- Users with `is_active = false` are archived

## Frontend Changes

### New Pages
1. **ArchivesPage.tsx** - View and manage archived users
   - Admin: Two tabs (Students, Professors)
   - Professor: Students tab only
   - Features: Bulk reactivate, bulk delete, search

### Updated Pages
1. **StudentsPage.tsx**
   - Added checkboxes for bulk selection
   - Added Archive button in actions column
   - Added bulk action buttons:
     - Archive (immediate)
     - Schedule Archive (with date picker)
     - Delete (bulk)
   - Added schedule archive modal

2. **Sidebar.tsx**
   - Added Archives menu item for Admin and Professor

3. **App.tsx**
   - Added routes for `/admin/archives` and `/professor/archives`

### CSS Updates
- Added `.btn-warning`, `.btn-danger`, `.btn-success` styles
- Added `.success-banner` style
- Added `.tabs` and `.tab` styles for tabbed interface

## Backend API Endpoints Needed

### Archive Endpoints
```
PATCH /api/users/:userId/archive
- Archives a user (sets is_active = false)
- Body: none
- Response: { success: true }

PATCH /api/users/:userId/reactivate
- Reactivates an archived user (sets is_active = true, clears scheduled_archive_date)
- Body: none
- Response: { success: true }

PATCH /api/users/:userId/schedule-archive
- Schedules a user for archiving
- Body: { scheduleDate: string (ISO date) }
- Response: { success: true }

GET /api/students/archived
- Gets all archived students (admin only)
- Response: ArchivedUser[]

GET /api/students/archived/professor/:professorId
- Gets archived students for a professor's sections
- Response: ArchivedUser[]

GET /api/professors/archived
- Gets all archived professors (admin only)
- Response: ArchivedUser[]
```

### Modified Endpoints
All existing student/professor list endpoints should filter by `is_active = true`:
- GET /api/students
- GET /api/students/professor/:professorId
- GET /api/professors

## Features

### Immediate Archive
- Single user: Click Archive button in actions column
- Bulk: Select multiple users, click "Archive (N)" button
- Sets `is_active = false` immediately

### Scheduled Archive
- Select multiple users
- Click "Schedule Archive" button
- Choose date in modal
- Sets `scheduled_archive_date` field
- Requires cron job or scheduled task to process

### Archives Page
- View all archived users
- Search by name, username, email
- Bulk reactivate
- Bulk delete (permanent)
- Shows scheduled archive date if applicable

### Reactivation
- Sets `is_active = true`
- Clears `scheduled_archive_date`
- User appears in normal lists again

## Security
- Professors can only archive/reactivate students in their sections
- Admins can archive/reactivate any user
- Archived users cannot log in (check in login function)

## Future Enhancements
- Cron job to process scheduled archives
- Email notifications before archiving
- Archive reason/notes field
- Audit log for archive actions
