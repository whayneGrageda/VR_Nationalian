-- ================================================================
-- MAKE PROFESSOR_ID NULLABLE IN SECTIONS TABLE
-- This allows sections to be created without a professor assigned
-- ================================================================

-- Remove NOT NULL constraint from professor_id
ALTER TABLE tblsections 
ALTER COLUMN professor_id DROP NOT NULL;

-- Verify the change
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'tblsections' 
AND column_name = 'professor_id';
