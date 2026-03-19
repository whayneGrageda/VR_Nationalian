-- ================================================================
-- ADD is_active COLUMN TO tblsessions
-- ================================================================
-- This migration adds an is_active column to track whether a session
-- is currently active or has been logged out.
-- ================================================================

-- Add is_active column (defaults to true for new sessions)
ALTER TABLE tblsessions 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true NOT NULL;

-- Set all existing sessions to active
UPDATE tblsessions 
SET is_active = true 
WHERE is_active IS NULL;

-- Create index for faster queries on active sessions
CREATE INDEX IF NOT EXISTS idx_sessions_is_active ON tblsessions(is_active);

-- Create index for active sessions by user (useful for checking if user is logged in)
CREATE INDEX IF NOT EXISTS idx_sessions_user_active ON tblsessions(user_id, is_active);

-- ================================================================
-- USAGE NOTES
-- ================================================================
-- When user logs in: is_active = true (default)
-- When user logs out: UPDATE tblsessions SET is_active = false WHERE session_id = ?
-- 
-- Query active sessions: SELECT * FROM tblsessions WHERE is_active = true
-- Query logins today: SELECT COUNT(*) FROM tblsessions WHERE created_at >= TODAY AND is_active = true
-- ================================================================

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
-- Run this to verify the column was added:
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'tblsessions' AND column_name = 'is_active';
