# Section Deactivation Guide

## Overview

Sections can be deactivated instead of deleted, allowing for better data retention and the ability to reactivate sections later.

## Database Changes

The `tblsections` table now includes an `is_active` column:
- Type: `BOOLEAN NOT NULL DEFAULT true`
- When `false`, the section is considered deactivated

## Behavior When a Section is Deactivated

### For Admins
- **Can deactivate/activate** sections (professors cannot)
- **Full visibility** of both active and inactive sections
- **Can manage** both active and inactive sections
- **Can bulk deactivate** multiple sections at once
- **Can bulk delete** sections (permanent removal)

### For Professors
- **Cannot deactivate** their own sections (admin-only action)
- **Can still view** inactive sections in their list (with visual indicator)
- **Can still manage** students in inactive sections
- **Can still access** all section data and analytics
- **Can edit and delete** their sections

### For Students
- **Remain enrolled** in deactivated sections
- **Can still access** all their content, chapters, and progress
- **Can still submit** quizzes and complete chapters
- The section **does not appear** in new enrollment lists
- No functional changes to their experience

## Use Cases

### When to Deactivate (Admin Action)
- End of semester/term (keep data for records)
- Temporary suspension of a class
- Section is full and no longer accepting students
- Professor is on leave but section data needs to be preserved
- Compliance or administrative hold on a section

### When to Delete (Professor or Admin)
- Section was created by mistake
- Data is no longer needed and can be permanently removed
- Cleaning up test/demo sections

## Permission Model

| Action | Professor | Admin |
|--------|-----------|-------|
| View sections | Own sections only | All sections |
| Create section | ✓ | ✓ |
| Edit section | Own sections only | All sections |
| Delete section | Own sections only | All sections |
| **Deactivate section** | ✗ | ✓ |
| **Activate section** | ✗ | ✓ |
| View inactive sections | Own sections only | All sections |
| Manage students in inactive section | ✓ | ✓ |

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
