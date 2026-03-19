-- ================================================================
--  COMPLETE SUPABASE SETUP SCRIPT
--  Run this entirely in: Supabase > SQL Editor > New Query
--  Order matters — do not rearrange sections.
-- ================================================================


-- ================================================================
--  EXTENSIONS
-- ================================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS "pgjwt";      -- sign() for JWT tokens


-- ================================================================
--  CLEANUP (safe re-run: drops everything and rebuilds cleanly)
-- ================================================================
DROP TRIGGER  IF EXISTS trg_award_achievement        ON tblcompleted_chapters;
DROP TRIGGER  IF EXISTS trg_init_user_chapters       ON tblusers;
DROP TRIGGER  IF EXISTS trg_init_user_profile        ON tblusers;
DROP TRIGGER  IF EXISTS trg_update_profile_timestamp ON tbluserprofiles;
DROP FUNCTION IF EXISTS fn_award_achievement_on_complete();
DROP FUNCTION IF EXISTS fn_init_user_chapters();
DROP FUNCTION IF EXISTS fn_init_user_profile();
DROP FUNCTION IF EXISTS fn_update_timestamp();
DROP FUNCTION IF EXISTS fn_login(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS fn_register(TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS fn_complete_chapter(UUID, INT);
DROP FUNCTION IF EXISTS fn_get_user_state(UUID);
DROP TABLE IF EXISTS tblsessions            CASCADE;
DROP TABLE IF EXISTS tbluserachievements    CASCADE;
DROP TABLE IF EXISTS tblachievements        CASCADE;
DROP TABLE IF EXISTS tblcompleted_chapters  CASCADE;
DROP TABLE IF EXISTS tbluserprofiles        CASCADE;
DROP TABLE IF EXISTS tblchapters            CASCADE;
DROP TABLE IF EXISTS tblusers               CASCADE;


-- ================================================================
--  TABLE: tblusers
--  Core account credentials. Profile data lives in tbluserprofiles.
-- ================================================================
CREATE TABLE tblusers (
    user_id     UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    username    TEXT        UNIQUE NOT NULL,
    password    TEXT        NOT NULL,
    email       TEXT        UNIQUE NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tblusers DISABLE ROW LEVEL SECURITY;


-- ================================================================
--  TABLE: tbluserprofiles
--  All non-credential user data: display name, avatar, stats.
-- ================================================================
CREATE TABLE tbluserprofiles (
    profile_id       UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id          UUID        UNIQUE NOT NULL REFERENCES tblusers(user_id) ON DELETE CASCADE,

    -- Display
    display_name     TEXT,                          -- shown in-game; defaults to username
    avatar_url       TEXT,                          -- URL or asset key

    -- Game stats (updated by the game as the player progresses)
    total_playtime   INT         DEFAULT 0,         -- seconds played across all chapters
    total_artifacts  INT         DEFAULT 0,         -- total artifacts ever collected
    last_played_at   TIMESTAMPTZ,                   -- last time the player was active
    last_chapter_id  INT         DEFAULT 1,         -- last chapter the player was on

    -- Meta
    created_at       TIMESTAMPTZ DEFAULT NOW(),
    updated_at       TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tbluserprofiles DISABLE ROW LEVEL SECURITY;


-- ================================================================
--  TABLE: tblchapters
--  Master list of chapters. Seed data below.
-- ================================================================
CREATE TABLE tblchapters (
    chapter_id    INT  PRIMARY KEY,
    chapter_name  TEXT NOT NULL,
    chapter_order INT  NOT NULL,
    description   TEXT
);
ALTER TABLE tblchapters DISABLE ROW LEVEL SECURITY;

INSERT INTO tblchapters (chapter_id, chapter_name, chapter_order, description) VALUES
    (1, 'Chapter 1', 1, 'Collect all artifacts from the ground'),
    (2, 'Chapter 2', 2, 'Chapter 2 description here'),
    (3, 'Chapter 3', 3, 'Chapter 3 description here'),
    (4, 'Chapter 4', 4, 'Chapter 4 description here');


-- ================================================================
--  TABLE: tblcompleted_chapters
--  One row per user per chapter — tracks completion state.
-- ================================================================
CREATE TABLE tblcompleted_chapters (
    id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID        NOT NULL REFERENCES tblusers(user_id) ON DELETE CASCADE,
    chapter_id     INT         NOT NULL REFERENCES tblchapters(chapter_id),
    is_completed   BOOLEAN     DEFAULT FALSE,
    completed_at   TIMESTAMPTZ,
    UNIQUE (user_id, chapter_id)
);
ALTER TABLE tblcompleted_chapters DISABLE ROW LEVEL SECURITY;


-- ================================================================
--  TABLE: tblachievements
--  Master list of all possible achievements.
-- ================================================================
CREATE TABLE tblachievements (
    achievement_id   UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
    achievement_key  TEXT  UNIQUE NOT NULL,   -- stable identifier used in code
    achievement_name TEXT  NOT NULL,
    description      TEXT,
    icon_key         TEXT                     -- optional: sprite/asset name in Unity
);
ALTER TABLE tblachievements DISABLE ROW LEVEL SECURITY;

INSERT INTO tblachievements (achievement_key, achievement_name, description, icon_key) VALUES
    ('complete_chapter_1', 'Artifact Hunter',     'Collected all artifacts in Chapter 1',   'icon_chapter1'),
    ('complete_chapter_2', 'Going Deeper',         'Completed Chapter 2',                    'icon_chapter2'),
    ('complete_chapter_3', 'Halfway There',         'Completed Chapter 3',                    'icon_chapter3'),
    ('complete_chapter_4', 'Endgame',               'Completed Chapter 4',                    'icon_chapter4'),
    ('complete_all',       'Master of the Realm',  'Finished every chapter in the game',     'icon_master'),
    ('first_login',        'Welcome Back',          'Logged in for the first time',           'icon_welcome');


-- ================================================================
--  TABLE: tbluserachievements
--  Records which achievements each user has earned.
-- ================================================================
CREATE TABLE tbluserachievements (
    id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id        UUID        NOT NULL REFERENCES tblusers(user_id) ON DELETE CASCADE,
    achievement_id UUID        NOT NULL REFERENCES tblachievements(achievement_id),
    unlocked_at    TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE (user_id, achievement_id)
);
ALTER TABLE tbluserachievements DISABLE ROW LEVEL SECURITY;


-- ================================================================
--  TABLE: tblsessions
--  JWT token store — one row per active session.
--  Works for both Unity (device_type='unity') and Web ('web').
-- ================================================================
CREATE TABLE tblsessions (
    session_id   UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id      UUID        NOT NULL REFERENCES tblusers(user_id) ON DELETE CASCADE,
    token        TEXT        NOT NULL,
    device_type  TEXT        CHECK (device_type IN ('unity', 'web', 'mobile')) DEFAULT 'unity',
    expires_at   TIMESTAMPTZ NOT NULL,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE tblsessions DISABLE ROW LEVEL SECURITY;

-- Index to quickly purge expired sessions
CREATE INDEX idx_sessions_expires ON tblsessions(expires_at);


-- ================================================================
--  UTILITY FUNCTION: auto-update updated_at
-- ================================================================
CREATE OR REPLACE FUNCTION fn_update_timestamp()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_update_profile_timestamp
    BEFORE UPDATE ON tbluserprofiles
    FOR EACH ROW EXECUTE FUNCTION fn_update_timestamp();


-- ================================================================
--  TRIGGER: auto-create chapter rows when a new user registers
-- ================================================================
CREATE OR REPLACE FUNCTION fn_init_user_chapters()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO tblcompleted_chapters (user_id, chapter_id, is_completed)
    SELECT NEW.user_id, chapter_id, FALSE
    FROM   tblchapters
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_init_user_chapters
    AFTER INSERT ON tblusers
    FOR EACH ROW EXECUTE FUNCTION fn_init_user_chapters();


-- ================================================================
--  TRIGGER: auto-create profile row when a new user registers
-- ================================================================
CREATE OR REPLACE FUNCTION fn_init_user_profile()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO tbluserprofiles (user_id, display_name)
    VALUES (NEW.user_id, NEW.username)
    ON CONFLICT DO NOTHING;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_init_user_profile
    AFTER INSERT ON tblusers
    FOR EACH ROW EXECUTE FUNCTION fn_init_user_profile();


-- ================================================================
--  TRIGGER: auto-award achievements when a chapter is completed
-- ================================================================
CREATE OR REPLACE FUNCTION fn_award_achievement_on_complete()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_key  TEXT;
    v_ach  tblachievements%ROWTYPE;
    v_done INT;
BEGIN
    -- Only fires when is_completed just changed to TRUE
    IF NEW.is_completed = TRUE AND (OLD.is_completed IS DISTINCT FROM TRUE) THEN

        -- Per-chapter achievement
        v_key := 'complete_chapter_' || NEW.chapter_id;
        SELECT * INTO v_ach FROM tblachievements WHERE achievement_key = v_key;
        IF FOUND THEN
            INSERT INTO tbluserachievements (user_id, achievement_id)
            VALUES (NEW.user_id, v_ach.achievement_id)
            ON CONFLICT DO NOTHING;
        END IF;

        -- Check if all 4 chapters now completed → award master achievement
        SELECT COUNT(*) INTO v_done
        FROM tblcompleted_chapters
        WHERE user_id = NEW.user_id AND is_completed = TRUE;

        IF v_done >= 4 THEN
            SELECT * INTO v_ach FROM tblachievements WHERE achievement_key = 'complete_all';
            IF FOUND THEN
                INSERT INTO tbluserachievements (user_id, achievement_id)
                VALUES (NEW.user_id, v_ach.achievement_id)
                ON CONFLICT DO NOTHING;
            END IF;
        END IF;

    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER trg_award_achievement
    AFTER UPDATE ON tblcompleted_chapters
    FOR EACH ROW EXECUTE FUNCTION fn_award_achievement_on_complete();


-- ================================================================
--  FUNCTION: fn_register(username, password, email, device_type)
--  Registers a new user and returns a JWT session token.
--
--  Call via: POST /rest/v1/rpc/fn_register
--  Body:     { "p_username":"...", "p_password":"...",
--              "p_email":"...", "p_device_type":"unity" }
-- ================================================================
CREATE OR REPLACE FUNCTION fn_register(
    p_username    TEXT,
    p_password    TEXT,
    p_email       TEXT,
    p_device_type TEXT DEFAULT 'unity'
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_user       tblusers%ROWTYPE;
    v_token      TEXT;
    v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '7 days';
    v_secret     TEXT := 'YOUR_JWT_SECRET_HERE';   -- ← replace with your secret
BEGIN
    -- Validate inputs
    IF TRIM(p_username) = '' OR TRIM(p_password) = '' OR TRIM(p_email) = '' THEN
        RAISE EXCEPTION 'Username, password, and email are required';
    END IF;

    -- Insert user (triggers auto-create profile + chapter rows)
    INSERT INTO tblusers (username, password, email)
    VALUES (TRIM(p_username), p_password, LOWER(TRIM(p_email)))
    RETURNING * INTO v_user;

    -- Award first_login achievement
    INSERT INTO tbluserachievements (user_id, achievement_id)
    SELECT v_user.user_id, achievement_id
    FROM   tblachievements
    WHERE  achievement_key = 'first_login'
    ON CONFLICT DO NOTHING;

    -- Sign JWT
    v_token := sign(
        json_build_object(
            'sub',  v_user.user_id::TEXT,
            'name', v_user.username,
            'exp',  EXTRACT(EPOCH FROM v_expires_at)::INT
        ),
        v_secret
    );

    -- Save session
    INSERT INTO tblsessions (user_id, token, device_type, expires_at)
    VALUES (v_user.user_id, v_token, p_device_type, v_expires_at);

    RETURN json_build_object(
        'user_id',    v_user.user_id,
        'username',   v_user.username,
        'email',      v_user.email,
        'token',      v_token,
        'expires_at', v_expires_at
    );

EXCEPTION
    WHEN unique_violation THEN
        RAISE EXCEPTION 'Username or email already taken';
END;
$$;


-- ================================================================
--  FUNCTION: fn_login(username, password, device_type)
--  Authenticates a user and returns a JWT session token.
--
--  Call via: POST /rest/v1/rpc/fn_login
--  Body:     { "p_username":"...", "p_password":"...",
--              "p_device_type":"unity" }
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
    v_token      TEXT;
    v_expires_at TIMESTAMPTZ := NOW() + INTERVAL '7 days';
    v_secret     TEXT := 'YOUR_JWT_SECRET_HERE';   -- ← replace with your secret
BEGIN
    -- Verify credentials
    SELECT * INTO v_user
    FROM   tblusers
    WHERE  username = p_username AND password = p_password
    LIMIT  1;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid username or password';
    END IF;

    -- Fetch profile
    SELECT * INTO v_profile
    FROM   tbluserprofiles
    WHERE  user_id = v_user.user_id;

    -- Update last_played_at
    UPDATE tbluserprofiles
    SET    last_played_at = NOW()
    WHERE  user_id = v_user.user_id;

    -- Sign JWT
    v_token := sign(
        json_build_object(
            'sub',  v_user.user_id::TEXT,
            'name', v_user.username,
            'exp',  EXTRACT(EPOCH FROM v_expires_at)::INT
        ),
        v_secret
    );

    -- Upsert session (replace any old session for this user+device)
    DELETE FROM tblsessions
    WHERE  user_id = v_user.user_id AND device_type = p_device_type;

    INSERT INTO tblsessions (user_id, token, device_type, expires_at)
    VALUES (v_user.user_id, v_token, p_device_type, v_expires_at);

    RETURN json_build_object(
        'user_id',        v_user.user_id,
        'username',       v_user.username,
        'email',          v_user.email,
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
--  FUNCTION: fn_complete_chapter(user_id, chapter_id)
--  Marks a chapter complete. Triggers auto-award achievements.
--  Also updates profile stats.
--
--  Call via: POST /rest/v1/rpc/fn_complete_chapter
--  Body:     { "p_user_id":"<uuid>", "p_chapter_id": 1 }
-- ================================================================
CREATE OR REPLACE FUNCTION fn_complete_chapter(
    p_user_id    UUID,
    p_chapter_id INT
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_next_chapter_id  INT := p_chapter_id + 1;
    v_next_unlocked    BOOLEAN := FALSE;
BEGIN
    -- Mark chapter as completed
    UPDATE tblcompleted_chapters
    SET    is_completed = TRUE,
           completed_at  = NOW()
    WHERE  user_id    = p_user_id
    AND    chapter_id = p_chapter_id
    AND    is_completed = FALSE;   -- no-op if already completed

    -- Update profile: last chapter reached
    UPDATE tbluserprofiles
    SET    last_chapter_id = GREATEST(last_chapter_id, p_chapter_id),
           last_played_at  = NOW()
    WHERE  user_id = p_user_id;

    -- Check if a next chapter exists and should unlock
    IF v_next_chapter_id <= 4 THEN
        v_next_unlocked := TRUE;
    END IF;

    RETURN json_build_object(
        'chapter_id',       p_chapter_id,
        'is_completed',     TRUE,
        'next_chapter_id',  v_next_chapter_id,
        'next_unlocked',    v_next_unlocked
    );
END;
$$;


-- ================================================================
--  FUNCTION: fn_get_user_state(user_id)
--  Returns the full game state for a user in one query:
--  profile + all chapter statuses + all earned achievements.
--
--  Call via: POST /rest/v1/rpc/fn_get_user_state
--  Body:     { "p_user_id": "<uuid>" }
-- ================================================================
CREATE OR REPLACE FUNCTION fn_get_user_state(
    p_user_id UUID
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_profile      JSON;
    v_chapters     JSON;
    v_achievements JSON;
BEGIN
    -- Profile
    SELECT row_to_json(p) INTO v_profile
    FROM (
        SELECT
            u.user_id,
            u.username,
            u.email,
            pr.display_name,
            pr.avatar_url,
            pr.total_playtime,
            pr.total_artifacts,
            pr.last_played_at,
            pr.last_chapter_id
        FROM tblusers u
        JOIN tbluserprofiles pr ON pr.user_id = u.user_id
        WHERE u.user_id = p_user_id
    ) p;

    -- Chapters (with unlock logic: ch1 always unlocked, others unlock if previous is_completed)
    SELECT json_agg(c ORDER BY c.chapter_order) INTO v_chapters
    FROM (
        SELECT
            ch.chapter_id,
            ch.chapter_name,
            ch.chapter_order,
            ch.description,
            COALESCE(cc.is_completed, FALSE) AS is_completed,
            cc.completed_at,
            -- Unlock rule: chapter 1 always unlocked;
            -- chapter N unlocked when chapter N-1 is completed
            CASE
                WHEN ch.chapter_id = 1 THEN TRUE
                ELSE COALESCE((
                    SELECT is_completed
                    FROM tblcompleted_chapters
                    WHERE user_id = p_user_id AND chapter_id = ch.chapter_id - 1
                ), FALSE)
            END AS is_unlocked
        FROM tblchapters ch
        LEFT JOIN tblcompleted_chapters cc
            ON cc.chapter_id = ch.chapter_id AND cc.user_id = p_user_id
    ) c;

    -- Achievements
    SELECT json_agg(a ORDER BY a.unlocked_at) INTO v_achievements
    FROM (
        SELECT
            ach.achievement_key,
            ach.achievement_name,
            ach.description,
            ach.icon_key,
            ua.unlocked_at
        FROM tbluserachievements ua
        JOIN tblachievements ach ON ach.achievement_id = ua.achievement_id
        WHERE ua.user_id = p_user_id
    ) a;

    RETURN json_build_object(
        'profile',      v_profile,
        'chapters',     COALESCE(v_chapters,     '[]'::JSON),
        'achievements', COALESCE(v_achievements, '[]'::JSON)
    );
END;
$$;


-- ================================================================
--  FUNCTION: fn_update_profile(user_id, display_name, avatar_url,
--                               total_playtime, total_artifacts)
--  Updates profile data from the game.
--
--  Call via: POST /rest/v1/rpc/fn_update_profile
--  Body:     { "p_user_id":"<uuid>", "p_display_name":"...", ... }
--  All params except p_user_id are optional (pass NULL to skip).
-- ================================================================
CREATE OR REPLACE FUNCTION fn_update_profile(
    p_user_id        UUID,
    p_display_name   TEXT    DEFAULT NULL,
    p_avatar_url     TEXT    DEFAULT NULL,
    p_total_playtime INT     DEFAULT NULL,
    p_total_artifacts INT    DEFAULT NULL
)
RETURNS JSON LANGUAGE plpgsql AS $$
DECLARE
    v_profile tbluserprofiles%ROWTYPE;
BEGIN
    UPDATE tbluserprofiles SET
        display_name    = COALESCE(p_display_name,    display_name),
        avatar_url      = COALESCE(p_avatar_url,      avatar_url),
        total_playtime  = COALESCE(p_total_playtime,  total_playtime),
        total_artifacts = COALESCE(p_total_artifacts, total_artifacts),
        last_played_at  = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_profile;

    RETURN row_to_json(v_profile);
END;
$$;


-- ================================================================
--  CLEANUP JOB: remove expired sessions
--  Run manually or schedule via pg_cron (Supabase Pro):
--    SELECT cron.schedule('0 * * * *', $$
--      DELETE FROM tblsessions WHERE expires_at < NOW();
--    $$);
-- ================================================================
-- DELETE FROM tblsessions WHERE expires_at < NOW();


-- ================================================================
--  VERIFY — run these to confirm everything is set up correctly:
-- ================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- SELECT routine_name FROM information_schema.routines
--   WHERE routine_schema = 'public' ORDER BY routine_name;
--
-- SELECT trigger_name, event_object_table FROM information_schema.triggers
--   WHERE trigger_schema = 'public';