-- ================================================================
--  REVERT PARTIAL DATABASE UPDATE
--  Run this to undo the partial changes before running the full setup
-- ================================================================

-- Remove role_id column from tblusers (if it exists)
ALTER TABLE tblusers DROP COLUMN IF EXISTS role_id;

-- Remove section_id column from tblusers (if it exists)
ALTER TABLE tblusers DROP COLUMN IF EXISTS section_id;

-- Drop indexes if they exist
DROP INDEX IF EXISTS idx_users_section;

-- Verify the revert
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'tblusers' 
ORDER BY ordinal_position;
