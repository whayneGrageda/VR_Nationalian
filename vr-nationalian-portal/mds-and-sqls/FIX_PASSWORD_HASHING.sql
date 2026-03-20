-- ================================================================
-- FIX PASSWORD HASHING - RUN THIS TO ENABLE PASSWORD HASHING
-- ================================================================
-- This script:
-- 1. Creates a trigger to automatically hash passwords on INSERT/UPDATE
-- 2. Hashes all existing plain text passwords
-- ================================================================

-- Step 1: Enable pgcrypto extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Step 2: Create trigger function to hash passwords
CREATE OR REPLACE FUNCTION hash_password_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Only hash if password is not already hashed (doesn't start with $2)
    IF NEW.password IS NOT NULL AND NEW.password NOT LIKE '$2%' THEN
        NEW.password := crypt(NEW.password, gen_salt('bf'));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 3: Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_hash_password ON tblusers;

-- Step 4: Create trigger on tblusers table
CREATE TRIGGER trigger_hash_password
    BEFORE INSERT OR UPDATE OF password ON tblusers
    FOR EACH ROW
    EXECUTE FUNCTION hash_password_trigger();

-- Step 5: Hash all existing passwords that are not already hashed
UPDATE tblusers
SET password = crypt(password, gen_salt('bf'))
WHERE password NOT LIKE '$2%';

-- Step 6: Verify the update
SELECT 
    user_id,
    username,
    role_id,
    CASE 
        WHEN password LIKE '$2%' THEN 'Hashed ✓'
        ELSE 'Plain Text ✗'
    END as password_status
FROM tblusers
ORDER BY role_id, username;

-- ================================================================
-- DONE! All passwords are now hashed and future passwords will be
-- automatically hashed by the trigger.
-- ================================================================
