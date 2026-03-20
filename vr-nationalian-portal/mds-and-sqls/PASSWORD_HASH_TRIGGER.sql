-- ================================================================
-- PASSWORD HASHING TRIGGER
-- Automatically hash passwords on INSERT and UPDATE
-- ================================================================

-- Enable pgcrypto extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create trigger function to hash passwords
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

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_hash_password ON tblusers;

-- Create trigger on tblusers table
CREATE TRIGGER trigger_hash_password
    BEFORE INSERT OR UPDATE OF password ON tblusers
    FOR EACH ROW
    EXECUTE FUNCTION hash_password_trigger();

-- Test the trigger
-- This should automatically hash the password
-- INSERT INTO tblusers (username, password, email, role_id)
-- VALUES ('test_user', 'plaintext123', 'test@example.com', 1);
