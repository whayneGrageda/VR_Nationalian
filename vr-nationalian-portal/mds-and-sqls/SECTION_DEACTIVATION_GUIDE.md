# Section Deactivation Guide

## Overview

Sections can be deactivated instead of deleted, allowing for better data retention and the ability to reactivate sections later.

## Database Changes

The `tblsections` table now includes an `is_active` column:
- Type: `BOOLEAN NOT NULL DEFAULT true`
- When `false`, the section is considered deactivated

## Behavior When a Section is Deactivated

### For Professors
- **Can still view** the section in their sections list (with a visual indicator)
- **Can still manage** students in the section
- **Can reactivate** the section at any time
- **Can still access** all section data and analytics

### For Students
- **Remain enrolled** in the section
- **Can still access** all their content, chapters, and progress
- **Can still submit** quizzes and complete chapters
- The section **does not appear** in new enrollment lists
- No functional changes to their experience

### For Admins
- **Full visibility** of both active and inactive sections
- **Can manage** both active and inactive sections
- **Can bulk deactivate** multiple sections at once
- **Can bulk delete** sections (permanent removal)

## Use Cases

### When to Deactivate
- End of semester/term (keep data for records)
- Temporary suspension of a class
- Section is full and no longer accepting students
- Professor is on leave but will return

### When to Delete
- Section was created by mistake
- Data is no longer needed and can be permanently removed
- Cleaning up test/demo sections

## API Endpoints

### Deactivate a Section
```
PATCH /api/sections/:sectionId/deactivate
```

### Reactivate a Section
```
PATCH /api/sections/:sectionId/activate
```

### Bulk Deactivate
```
PATCH /api/sections/bulk-deactivate
Body: { sectionIds: string[] }
```

## Database Query Examples

### Get only active sections
```sql
SELECT * FROM tblsections WHERE is_active = true;
```

### Get all sections (including inactive)
```sql
SELECT * FROM tblsections;
```

### Deactivate a section
```sql
UPDATE tblsections SET is_active = false WHERE section_id = 'uuid-here';
```

### Reactivate a section
```sql
UPDATE tblsections SET is_active = true WHERE section_id = 'uuid-here';
```

## Migration Notes

- Existing sections will have `is_active = true` by default
- No data migration needed
- Index added for performance: `idx_sections_is_active`
