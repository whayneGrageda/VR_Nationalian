-- ================================================================
-- AUTO-GRANT "WELCOME BACK" ACHIEVEMENT ON FIRST LOGIN
-- ================================================================
-- This trigger automatically grants the "Welcome Back" achievement
-- to students when they create their first session (login for the first time).
-- Works for both Unity VR game and web portal logins.
-- ================================================================

-- Create the trigger function
CREATE OR REPLACE FUNCTION fn_grant_first_login_achievement()
RETURNS TRIGGER AS $$
DECLARE
    v_achievement_id UUID;
    v_user_role_id INT;
BEGIN
    -- Get the user's role
    SELECT role_id INTO v_user_role_id
    FROM tblusers
    WHERE user_id = NEW.user_id;

    -- Only proceed if user is a student (role_id = 1)
    IF v_user_role_id = 1 THEN
        -- Get the "Welcome Back" achievement ID
        SELECT achievement_id INTO v_achievement_id
        FROM tblachievements
        WHERE achievement_key = 'first_login';

        -- Check if achievement exists and user doesn't already have it
        IF v_achievement_id IS NOT NULL THEN
            -- Insert the achievement if it doesn't exist (using ON CONFLICT to avoid duplicates)
            INSERT INTO tbluserachievements (user_id, achievement_id)
            VALUES (NEW.user_id, v_achievement_id)
            ON CONFLICT (user_id, achievement_id) DO NOTHING;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on tblsessions table
-- This fires after a new session is created (when user logs in)
DROP TRIGGER IF EXISTS trg_grant_first_login_achievement ON tblsessions;

CREATE TRIGGER trg_grant_first_login_achievement
    AFTER INSERT ON tblsessions
    FOR EACH ROW
    EXECUTE FUNCTION fn_grant_first_login_achievement();

-- ================================================================
-- VERIFICATION QUERY
-- ================================================================
-- Run this to verify the trigger was created successfully:
-- SELECT trigger_name, event_manipulation, event_object_table 
-- FROM information_schema.triggers 
-- WHERE trigger_name = 'trg_grant_first_login_achievement';
