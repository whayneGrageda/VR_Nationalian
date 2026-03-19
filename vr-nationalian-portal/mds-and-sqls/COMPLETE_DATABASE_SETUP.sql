-- ================================================================
--  COMPLETE DATABASE SETUP: Roles & Sections
--  Run this AFTER running REVERT_PARTIAL_UPDATE.sql
-- ================================================================

-- ================================================================
--  PART 1: CREATE ROLES TABLE
-- ================================================================

-- Create roles table
CREATE TABLE IF NOT EXISTS tblroles (
    role_id   INT PRIMARY KEY,
    role_name TEXT UNIQUE NOT NULL
);

-- Insert role definitions
INSERT INTO tblroles (role_id, role_name) VALUES
    (1, 'student'),
    (2, 'prof'),
    (3, 'admin')
ON CONFLICT (role_id) DO NOTHING;

-- ================================================================
--  PART 2: ADD ROLE_ID TO USERS
-- ================================================================

-- Add role_id column to tblusers
ALTER TABLE tblusers 
ADD COLUMN IF NOT EXISTS role_id INT DEFAULT 1 REFERENCES tblroles(role_id);

-- Update existing users to have student role (role_id = 1)
UPDATE tblusers SET role_id = 1 WHERE role_id IS NULL;

-- ================================================================
--  PART 3: CREATE DEFAULT USERS
-- ================================================================

-- Create default admin user
INSERT INTO tblusers (username, password, email, role_id)
VALUES ('admin', 'admin123', 'admin@nuquest.com', 3)
ON CONFLICT (username) DO NOTHING;

-- Create default professor user
INSERT INTO tblusers (username, password, email, role_id)
VALUES ('prof1', 'prof123', 'prof@nuquest.com', 2)
ON CONFLICT (username) DO NOTHING;

-- ================================================================
--  PART 4: UPDATE LOGIN FUNCTION
-- ================================================================

CREATE OR REPLACE FUNCTION fn_login(
    p_username    TEXT,
    p_password    TEXT,
    p_device_type TEXT DEFAULT 'unity'
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_user       tblusers%ROWTYPE;
    v_profile    tbluserprofiles%ROWTYPE;
    v_role_name  TEXT;
    v_token      TEXT;
    v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '7 days';
BEGIN
    -- Verify credentials
    SELECT u.* INTO v_user
    FROM   tblusers u
    WHERE  u.username = p_username AND u.password = p_password
    LIMIT  1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;

    -- Get role name
    SELECT r.role_name INTO v_role_name
    FROM   tblroles r
    WHERE  r.role_id = v_user.role_id;

    -- Fetch profile
    SELECT * INTO v_profile
    FROM   tbluserprofiles
    WHERE  user_id = v_user.user_id;

    -- Update last_played_at
    UPDATE tbluserprofiles
    SET    last_played_at = NOW()
    WHERE  user_id = v_user.user_id;

    -- Generate simple token
    v_token := v_user.user_id::TEXT || '_' || EXTRACT(EPOCH FROM NOW())::TEXT;

    -- Delete old sessions
    DELETE FROM tblsessions
    WHERE  user_id = v_user.user_id AND device_type = p_device_type;

    -- Insert new session
    INSERT INTO tblsessions (user_id, token, device_type, expires_at)
    VALUES (v_user.user_id, v_token, p_device_type, v_expires_at);

    RETURN json_build_object(
        'user_id',        v_user.user_id,
        'username',       v_user.username,
        'email',          v_user.email,
        'role_id',        v_user.role_id,
        'role',           v_role_name,
        'display_name',   v_profile.display_name,
        'avatar_url',     v_profile.avatar_url,
        'total_playtime', v_profile.total_playtime,
        'total_artifacts',v_profile.total_artifacts,
        'last_chapter_id',v_profile.last_chapter_id,
        'token',          v_token,
        'expires_at',     v_expires_at
    );
END;
$$;

-- ================================================================
--  PART 5: CREATE SECTIONS TABLE
-- ================================================================

CREATE TABLE IF NOT EXISTS tblsections (
    section_id   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    section_name TEXT        NOT NULL,
    professor_id UUID        NOT NULL REFERENCES tblusers(user_id) ON DELETE CASCADE,
    is_hidden    BOOLEAN     DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW(),
    updated_at   TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_sections_professor ON tblsections(professor_id);

-- ================================================================
--  PART 6: ADD SECTION_ID TO USERS
-- ================================================================

-- Add section_id to tblusers (students belong to one section)
ALTER TABLE tblusers 
ADD COLUMN IF NOT EXISTS section_id UUID REFERENCES tblsections(section_id) ON DELETE SET NULL;

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_users_section ON tblusers(section_id);

-- ================================================================
--  PART 7: SECTION MANAGEMENT FUNCTIONS
-- ================================================================

-- Create Section (Simple - just name)
CREATE OR REPLACE FUNCTION fn_create_section(
    p_professor_id UUID,
    p_section_name TEXT
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_section tblsections%ROWTYPE;
BEGIN
    -- Verify user is a professor
    IF NOT EXISTS (
        SELECT 1 FROM tblusers 
        WHERE user_id = p_professor_id AND role_id = 2
    ) THEN
        RAISE EXCEPTION 'Only professors can create sections';
    END IF;
    
    -- Insert section
    INSERT INTO tblsections (professor_id, section_name)
    VALUES (p_professor_id, p_section_name)
    RETURNING * INTO v_section;
    
    RETURN row_to_json(v_section);
END;
$$;

-- Update Section
CREATE OR REPLACE FUNCTION fn_update_section(
    p_section_id   UUID,
    p_professor_id UUID,
    p_section_name TEXT
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_section tblsections%ROWTYPE;
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM tblsections 
        WHERE section_id = p_section_id AND professor_id = p_professor_id
    ) THEN
        RAISE EXCEPTION 'Section not found or access denied';
    END IF;
    
    -- Update section
    UPDATE tblsections SET
        section_name = p_section_name,
        updated_at = NOW()
    WHERE section_id = p_section_id
    RETURNING * INTO v_section;
    
    RETURN row_to_json(v_section);
END;
$$;

-- Delete Section
CREATE OR REPLACE FUNCTION fn_delete_section(
    p_section_id   UUID,
    p_professor_id UUID
)
RETURNS JSON LANGUAGE plpgsql AS $$
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM tblsections 
        WHERE section_id = p_section_id AND professor_id = p_professor_id
    ) THEN
        RAISE EXCEPTION 'Section not found or access denied';
    END IF;
    
    -- Remove section reference from students
    UPDATE tblusers SET section_id = NULL WHERE section_id = p_section_id;
    
    -- Delete section
    DELETE FROM tblsections WHERE section_id = p_section_id;
    
    RETURN json_build_object('success', TRUE, 'message', 'Section deleted');
END;
$$;

-- Hide/Show Section
CREATE OR REPLACE FUNCTION fn_toggle_section_visibility(
    p_section_id   UUID,
    p_professor_id UUID,
    p_is_hidden    BOOLEAN
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_section tblsections%ROWTYPE;
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM tblsections 
        WHERE section_id = p_section_id AND professor_id = p_professor_id
    ) THEN
        RAISE EXCEPTION 'Section not found or access denied';
    END IF;
    
    -- Update visibility
    UPDATE tblsections SET
        is_hidden = p_is_hidden,
        updated_at = NOW()
    WHERE section_id = p_section_id
    RETURNING * INTO v_section;
    
    RETURN row_to_json(v_section);
END;
$$;

-- Get Professor's Sections
CREATE OR REPLACE FUNCTION fn_get_professor_sections(
    p_professor_id UUID
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_sections JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'section_id', s.section_id,
            'section_name', s.section_name,
            'is_hidden', s.is_hidden,
            'student_count', (
                SELECT COUNT(*) 
                FROM tblusers 
                WHERE section_id = s.section_id AND role_id = 1
            ),
            'created_at', s.created_at,
            'updated_at', s.updated_at
        ) ORDER BY s.created_at DESC
    ) INTO v_sections
    FROM tblsections s
    WHERE s.professor_id = p_professor_id;
    
    RETURN COALESCE(v_sections, '[]'::JSON);
END;
$$;

-- Get Students in Section
CREATE OR REPLACE FUNCTION fn_get_section_students(
    p_section_id   UUID,
    p_professor_id UUID
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_students JSON;
BEGIN
    -- Verify ownership
    IF NOT EXISTS (
        SELECT 1 FROM tblsections 
        WHERE section_id = p_section_id AND professor_id = p_professor_id
    ) THEN
        RAISE EXCEPTION 'Section not found or access denied';
    END IF;
    
    -- Get students
    SELECT json_agg(
        json_build_object(
            'user_id', u.user_id,
            'username', u.username,
            'email', u.email,
            'display_name', p.display_name,
            'total_artifacts', p.total_artifacts,
            'total_playtime', p.total_playtime,
            'last_chapter_id', p.last_chapter_id,
            'last_played_at', p.last_played_at,
            'created_at', u.created_at
        ) ORDER BY u.username
    ) INTO v_students
    FROM tblusers u
    LEFT JOIN tbluserprofiles p ON p.user_id = u.user_id
    WHERE u.section_id = p_section_id AND u.role_id = 1;
    
    RETURN COALESCE(v_students, '[]'::JSON);
END;
$$;

-- ================================================================
--  PART 8: STUDENT MANAGEMENT FUNCTIONS
-- ================================================================

-- Create Student Account (by Professor)
CREATE OR REPLACE FUNCTION fn_create_student(
    p_professor_id UUID,
    p_section_id   UUID,
    p_username     TEXT,
    p_password     TEXT,
    p_email        TEXT
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_user tblusers%ROWTYPE;
BEGIN
    -- Verify professor owns this section
    IF NOT EXISTS (
        SELECT 1 FROM tblsections 
        WHERE section_id = p_section_id AND professor_id = p_professor_id
    ) THEN
        RAISE EXCEPTION 'Section not found or access denied';
    END IF;
    
    -- Create student account
    INSERT INTO tblusers (username, password, email, role_id, section_id)
    VALUES (p_username, p_password, p_email, 1, p_section_id)
    RETURNING * INTO v_user;
    
    -- Profile and chapters are auto-created by triggers
    
    RETURN json_build_object(
        'user_id', v_user.user_id,
        'username', v_user.username,
        'email', v_user.email,
        'section_id', v_user.section_id
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Username or email already exists';
END;
$$;

-- Update Student
CREATE OR REPLACE FUNCTION fn_update_student(
    p_professor_id UUID,
    p_student_id   UUID,
    p_username     TEXT DEFAULT NULL,
    p_password     TEXT DEFAULT NULL,
    p_email        TEXT DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_user tblusers%ROWTYPE;
BEGIN
    -- Verify professor owns the student's section
    IF NOT EXISTS (
        SELECT 1 FROM tblusers u
        JOIN tblsections s ON s.section_id = u.section_id
        WHERE u.user_id = p_student_id 
        AND s.professor_id = p_professor_id
        AND u.role_id = 1
    ) THEN
        RAISE EXCEPTION 'Student not found or access denied';
    END IF;
    
    -- Update student
    UPDATE tblusers SET
        username = COALESCE(p_username, username),
        password = COALESCE(p_password, password),
        email = COALESCE(p_email, email)
    WHERE user_id = p_student_id
    RETURNING * INTO v_user;
    
    RETURN row_to_json(v_user);
    
EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Username or email already exists';
END;
$$;

-- Delete Student
CREATE OR REPLACE FUNCTION fn_delete_student(
    p_professor_id UUID,
    p_student_id   UUID
)
RETURNS JSON LANGUAGE plpgsql AS $$
BEGIN
    -- Verify professor owns the student's section
    IF NOT EXISTS (
        SELECT 1 FROM tblusers u
        JOIN tblsections s ON s.section_id = u.section_id
        WHERE u.user_id = p_student_id 
        AND s.professor_id = p_professor_id
        AND u.role_id = 1
    ) THEN
        RAISE EXCEPTION 'Student not found or access denied';
    END IF;
    
    -- Delete student (cascades to profile, chapters, etc.)
    DELETE FROM tblusers WHERE user_id = p_student_id;
    
    RETURN json_build_object('success', TRUE, 'message', 'Student deleted');
END;
$$;

-- ================================================================
--  VERIFICATION QUERIES
-- ================================================================

-- Check roles table
SELECT 'Roles Table:' AS info;
SELECT * FROM tblroles;

-- Check users with roles
SELECT 'Users with Roles:' AS info;
SELECT u.user_id, u.username, u.email, r.role_name 
FROM tblusers u
JOIN tblroles r ON r.role_id = u.role_id
LIMIT 10;

-- Check sections table exists
SELECT 'Sections Table Exists:' AS info;
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'tblsections';

-- Check functions exist
SELECT 'Section Functions:' AS info;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE 'fn_%section%'
ORDER BY routine_name;

SELECT 'Student Functions:' AS info;
SELECT routine_name FROM information_schema.routines
WHERE routine_schema = 'public' AND routine_name LIKE 'fn_%student%'
ORDER BY routine_name;

-- ================================================================
--  SETUP COMPLETE
-- ================================================================
SELECT '✓ Database setup complete!' AS status;
