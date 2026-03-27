-- Add is_active column to tblsections
-- This allows sections to be deactivated without deleting them
-- Inactive sections should not be visible to students for enrollment

ALTER TABLE tblsections 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Add comment to explain the column
COMMENT ON COLUMN tblsections.is_active IS 'Whether the section is active. Inactive sections are hidden from students but professors can still view them.';

-- Create index for faster filtering of active sections
CREATE INDEX IF NOT EXISTS idx_sections_is_active ON tblsections(is_active);

-- Note: When a section is deactivated (is_active = false):
-- 1. Students already enrolled remain enrolled
-- 2. The section is hidden from student enrollment views
-- 3. Professors can still see and manage the section
-- 4. Students in inactive sections can still access their content
-- 5. The section can be reactivated at any time
