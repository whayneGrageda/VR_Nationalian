-- ================================================================
-- UPDATE LOGIN FUNCTION TO USE BCRYPT PASSWORD VERIFICATION
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
    -- Verify credentials using crypt for bcrypt password verification
    SELECT u.* INTO v_user
    FROM   tblusers u
    WHERE  u.username = p_username 
    AND    u.password = crypt(p_password, u.password)
    LIMIT  1;

    IF NOT FOUND THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Invalid username or password'
        );
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

    -- Delete old sessions for this device type
    DELETE FROM tblsessions
    WHERE  user_id = v_user.user_id AND device_type = p_device_type;

    -- Insert new session
    INSERT INTO tblsessions (user_id, token, device_type, expires_at, is_active)
    VALUES (v_user.user_id, v_token, p_device_type, v_expires_at, true);

    RETURN json_build_object(
        'success',        true,
        'user_id',        v_user.user_id,
        'username',       v_user.username,
        'email',          v_user.email,
        'role_id',        v_user.role_id,
        'role',           v_role_name,
        'first_name',     v_user.first_name,
        'middle_initial', v_user.middle_initial,
        'last_name',      v_user.last_name,
        'section_id',     v_user.section_id,
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
