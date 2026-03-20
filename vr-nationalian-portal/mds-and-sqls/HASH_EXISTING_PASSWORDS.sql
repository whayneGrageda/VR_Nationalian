-- ================================================================
-- HASH EXISTING PASSWORDS MIGRATION
-- This script hashes all existing plain text passwords in tblusers
-- ================================================================

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Hash all existing passwords that are not already hashed
-- Hashed passwords with bcrypt start with '$2a$' or '$2b$'
UPDATE tblusers
SET password = crypt(password, gen_salt('bf'))
WHERE password NOT LIKE '$2%';

-- Verify the update
SELECT 
    user_id,
    username,
    role_id,
    CASE 
        WHEN password LIKE '$2%' THEN 'Hashed'
        ELSE 'Plain Text'
    END as password_status
FROM tblusers
ORDER BY role_id, username;
