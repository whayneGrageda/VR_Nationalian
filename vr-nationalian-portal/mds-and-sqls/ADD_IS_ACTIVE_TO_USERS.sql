-- Add is_active column to tblusers for archiving functionality
-- Users with is_active = false will be listed in Archives

ALTER TABLE tblusers 
ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;

-- Create index for faster queries on archived users
CREATE INDEX IF NOT EXISTS idx_tblusers_is_active ON tblusers(is_active);

-- Add scheduled_archive_date for scheduled archiving
ALTER TABLE tblusers 
ADD COLUMN IF NOT EXISTS scheduled_archive_date timestamptz;

-- Create index for scheduled archive queries
CREATE INDEX IF NOT EXISTS idx_tblusers_scheduled_archive ON tblusers(scheduled_archive_date) 
WHERE scheduled_archive_date IS NOT NULL;

COMMENT ON COLUMN tblusers.is_active IS 'Whether the user account is active (false = archived)';
COMMENT ON COLUMN tblusers.scheduled_archive_date IS 'Date when the user should be automatically archived';
