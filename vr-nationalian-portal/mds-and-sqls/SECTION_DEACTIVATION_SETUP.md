# Section Deactivation Feature - Setup Instructions

## Status: Ready to Deploy

All code changes have been completed. Follow these steps to activate the feature:

## 1. Database Migration

Run the SQL migration to add the `is_active` column to `tblsections`:

```sql
-- File: ADD_IS_ACTIVE_TO_SECTIONS.sql
ALTER TABLE tblsections 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

COMMENT ON COLUMN tblsections.is_active IS 'Whether the section is active. Inactive sections are hidden from students but professors can still view them.';

CREATE INDEX IF NOT EXISTS idx_sections_is_active ON tblsections(is_active);
```

## 2. Restart Backend Server

After running the migration, restart your backend server to load the new API endpoints:

```bash
cd backend
npm run dev  # or your start command
```

## 3. Test the Feature

### As Admin:
1. Navigate to Sections page
2. You should see checkboxes and a "Status" column showing "Active"
3. Click the deactivate button (power off icon) on any section
4. The status should change to "Inactive"
5. Click the activate button (power on icon) to reactivate
6. Test bulk deactivate by selecting multiple sections

### As Professor:
1. Navigate to Sections page
2. You should NOT see checkboxes or deactivate buttons
3. You can only view sections and manage students

## 4. Verify API Endpoints

The following endpoints are now available:

- `PATCH /api/sections/:id/deactivate` - Deactivates a section (Admin only)
- `PATCH /api/sections/:id/activate` - Activates a section (Admin only)

## Changes Summary

### Backend:
- ✅ `SectionRepository.ts` - Added `deactivateSection()` and `activateSection()` methods
- ✅ `ISectionRepository.ts` - Added interface methods
- ✅ `SectionUseCase.ts` - Added use case methods
- ✅ `SectionController.ts` - Added controller endpoints
- ✅ `routes/index.ts` - Added PATCH routes
- ✅ `Section.ts` entity - Added `isActive` and `studentCount` fields

### Frontend:
- ✅ `SectionsPage.tsx` - Added deactivate/activate UI (admin only)
- ✅ `SectionsPage.tsx` - Added student count column
- ✅ `SectionsPage.tsx` - Added bulk deactivate action
- ✅ `errorHandler.ts` - Enhanced error handling

### Database:
- ✅ `ADD_IS_ACTIVE_TO_SECTIONS.sql` - Migration script ready
- ✅ `database (1).md` - Documentation updated
- ✅ `SECTION_DEACTIVATION_GUIDE.md` - Behavior documentation

## Permissions

| Action |