# Database Documentation

## Overview

This database supports a game-based learning platform where students play through chapters, earn achievements, and are managed by professors through sections. It uses PostgreSQL with bcrypt password hashing, session-based authentication, and automated triggers for profile/chapter initialization and achievement unlocking.

---

## Tables

### `tblroles`
Defines user roles in the system.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| role_id | integer | PK | Unique role identifier |
| role_name | text | NOT NULL, UNIQUE | Role label (e.g., student, professor, admin) |

**Known role_id values:**
- `1` — Student
- `2` — Professor
- `3` — Admin

---

### `tblusers`
Core user accounts for all roles.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | uuid | PK, default gen_random_uuid() | Unique user identifier |
| username | text | NOT NULL, UNIQUE | Login username |
| password | text | NOT NULL | Bcrypt-hashed password |
| email | text | NOT NULL, UNIQUE | User email address |
| first_name | text | | First name |
| middle_initial | text | | Middle initial |
| last_name | text | | Last name |
| role_id | integer | FK → tblroles, default 1 | User role |
| section_id | uuid | FK → tblsections | Section enrollment (students) |
| created_at | timestamptz | default now() | Account creation timestamp |

---

### `tblsections`
Class sections created and managed by professors.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| section_id | uuid | PK, default gen_random_uuid() | Unique section identifier |
| section_name | text | NOT NULL | Display name of the section |
| professor_id | uuid | FK → tblusers(user_id) | Owning professor |
| is_hidden | boolean | default false | Visibility flag for students |
| created_at | timestamptz | default now() | Creation timestamp |
| updated_at | timestamptz | default now() | Last update timestamp |

---

### `tblchapters`
Master list of game chapters.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| chapter_id | integer | PK | Unique chapter identifier |
| chapter_name | text | NOT NULL | Chapter display name |
| chapter_order | integer | NOT NULL | Sort order for sequential unlocking |
| description | text | | Chapter description |

---

### `tblcompleted_chapters`
Tracks each student's completion status per chapter.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Record identifier |
| user_id | uuid | FK → tblusers | Student reference |
| chapter_id | integer | FK → tblchapters | Chapter reference |
| is_completed | boolean | default false | Whether the chapter is completed |
| completed_at | timestamptz | | Timestamp of completion |

> Auto-populated for every new user via the `trg_init_user_chapters` trigger.

---

### `tbluserprofiles`
Extended profile and game stats per user.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| profile_id | uuid | PK, default gen_random_uuid() | Profile identifier |
| user_id | uuid | FK → tblusers, UNIQUE | One profile per user |
| display_name | text | | In-game display name |
| avatar_url | text | | Avatar image URL |
| total_playtime | integer | default 0 | Total playtime in seconds/minutes |
| total_artifacts | integer | default 0 | Total artifacts collected |
| last_played_at | timestamptz | | Last game session timestamp |
| last_chapter_id | integer | default 1 | Most recent chapter reached |
| created_at | timestamptz | default now() | Profile creation timestamp |
| updated_at | timestamptz | default now() | Last update timestamp (auto-managed) |

> Auto-created for every new user via the `trg_init_user_profile` trigger.

---

### `tblsessions`
Active authentication sessions per user per device.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| session_id | uuid | PK, default gen_random_uuid() | Session identifier |
| user_id | uuid | FK → tblusers | Session owner |
| token | text | NOT NULL | Random base64 session token |
| device_type | text | CHECK IN ('unity', 'web', 'mobile'), default 'unity' | Client platform |
| expires_at | timestamptz | NOT NULL | Expiry time (30 days from creation) |
| created_at | timestamptz | default now() | Session creation timestamp |
| is_active | boolean | NOT NULL, default true | Whether session is active |

> One session per user per device type — old sessions are deleted on new login.

---

### `tblachievements`
Master catalog of all available achievements.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| achievement_id | uuid | PK, default gen_random_uuid() | Achievement identifier |
| achievement_key | text | NOT NULL, UNIQUE | Programmatic key (e.g., `complete_chapter_1`, `first_login`) |
| achievement_name | text | NOT NULL | Display name |
| description | text | | Description shown to user |
| icon_key | text | | Icon asset reference |

**Known achievement keys:**
- `first_login` — Awarded on first session creation
- `complete_chapter_1` through `complete_chapter_4` — Awarded on chapter completion
- `complete_all` — Awarded when all 4 chapters are completed

---

### `tbluserachievements`
Junction table tracking which achievements each user has unlocked.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | uuid | PK, default gen_random_uuid() | Record identifier |
| user_id | uuid | FK → tblusers | User reference |
| achievement_id | uuid | FK → tblachievements | Achievement reference |
| unlocked_at | timestamptz | default now() | When the achievement was unlocked |

---

## Triggers

| Trigger Name | Table | Function | Event | Orientation |
|---|---|---|---|---|
| `trigger_hash_password` | tblusers | `hash_password_trigger` | BEFORE INSERT, BEFORE UPDATE | ROW |
| `trg_init_user_profile` | tblusers | `fn_init_user_profile` | AFTER INSERT | ROW |
| `trg_init_user_chapters` | tblusers | `fn_init_user_chapters` | AFTER INSERT | ROW |
| `trg_grant_first_login_achievement` | tblsessions | `fn_grant_first_login_achievement` | AFTER INSERT | ROW |
| `trg_award_achievement` | tblcompleted_chapters | `fn_award_achievement_on_complete` | AFTER UPDATE | ROW |
| `trg_update_profile_timestamp` | tbluserprofiles | `fn_update_timestamp` | BEFORE UPDATE | ROW |

### Trigger Details

**`trigger_hash_password`**
Fires before any INSERT or UPDATE on `tblusers`. If the password field is not already bcrypt-hashed (does not start with `$2`), it hashes it using `crypt()` with a blowfish salt. Prevents double-hashing.

**`trg_init_user_profile`**
Fires after a new row is inserted into `tblusers`. Automatically creates a `tbluserprofiles` record with `display_name` set to the new user's username.

**`trg_init_user_chapters`**
Fires after a new row is inserted into `tblusers`. Inserts one `tblcompleted_chapters` record per chapter in `tblchapters`, all with `is_completed = FALSE`, giving the new user a fresh chapter progress slate.

**`trg_grant_first_login_achievement`**
Fires after a new row is inserted into `tblsessions`. If the user is a student (role_id = 1) and the `first_login` achievement exists, it awards the achievement (using `ON CONFLICT DO NOTHING` to prevent duplicates).

**`trg_award_achievement`**
Fires after an UPDATE on `tblcompleted_chapters`. When `is_completed` transitions to `TRUE`, it awards the per-chapter achievement (`complete_chapter_<id>`) and checks if all 4 chapters are complete to award the `complete_all` master achievement.

**`trg_update_profile_timestamp`**
Fires before any UPDATE on `tbluserprofiles`. Sets `updated_at = NOW()` automatically.

---

## Functions

### Authentication

#### `fn_login(p_username, p_password, p_device_type)`
Authenticates a user by username and bcrypt password comparison. Deletes any existing session for that user+device combination, creates a new 30-day session token, and returns a JSON object with `user_id`, `username`, `email`, `role_id`, `first_name`, `middle_initial`, `last_name`, `section_id`, `token`, and `expires_at`. Raises an exception on invalid credentials.

#### `fn_register(p_username, p_password, p_email, p_device_type)`
Registers a new student account (role_id = 1). Hashes the password with bcrypt, inserts the user into `tblusers`, creates a session token, and returns user info with the session token. Profile and chapter records are created automatically via triggers.

---

### Chapter Progression

#### `fn_complete_chapter(p_user_id, p_chapter_id)`
Marks a chapter as completed for a user (only if not already completed). Updates the user's profile `last_chapter_id` to the greater of the current value or the completed chapter. Returns a JSON object with `chapter_id`, `is_completed`, `next_chapter_id`, and `next_unlocked` (true if next chapter id ≤ 4).

#### `fn_get_user_state(p_user_id)`
Returns the complete game state for a user as a single JSON object containing:
- `profile` — user info + profile stats
- `chapters` — all chapters with `is_completed`, `completed_at`, and `is_unlocked` (Chapter 1 always unlocked; subsequent chapters unlock when the previous one is completed)
- `achievements` — list of unlocked achievements with metadata

---

### Section Management

#### `fn_create_section(p_professor_id, p_section_name)`
Creates a new section. Verifies the caller has role_id = 2 (professor). Returns the new section row as JSON.

#### `fn_delete_section(p_professor_id, p_section_id)`
Deletes a section after verifying professor ownership. Nullifies `section_id` on all enrolled students before deletion. Returns a success JSON.

#### `fn_toggle_section_visibility(p_professor_id, p_section_id, p_is_hidden)`
Updates the `is_hidden` flag on a section after verifying professor ownership. Returns the updated section row as JSON.

#### `fn_get_professor_sections(p_professor_id)`
Returns a JSON array of all sections belonging to the professor, each including `section_id`, `section_name`, `is_hidden`, `student_count`, `created_at`, and `updated_at`. Returns an empty array if none exist.

#### `fn_get_section_students(p_professor_id, p_section_id)`
Returns a JSON array of all students in a section, joined with their profile data (`display_name`, `total_artifacts`, `total_playtime`, `last_chapter_id`, `last_played_at`). Verifies professor ownership before returning. Returns an empty array if no students.

---

### Student Management

#### `fn_create_student(p_professor_id, p_section_id, p_username, p_password, p_email, p_first_name, p_middle_initial, p_last_name)`
Creates a student account under a professor's section. Verifies the caller is a professor (role_id = 2) or admin (role_id = 3). Professors may only create students in their own sections; admins can create in any section. Hashes the password with bcrypt, inserts into `tblusers` with role_id = 1, and returns `success`, `user_id`, `username`, and `email`. Profile and chapter records are created via triggers.

#### `fn_delete_student(p_professor_id, p_student_id)`
Deletes a student account after verifying the professor owns the student's section. Returns a success JSON.

#### `fn_update_profile(p_professor_id, p_student_id, p_username, p_password, p_email, p_first_name, p_middle_initial, p_last_name)`
Updates a student's account fields. Verifies the requester is a professor or admin, and that the student belongs to the professor's section (admins bypass this check). Only updates fields where a new value is provided (`COALESCE` pattern). Hashes the new password with bcrypt if provided. Returns `success` and `user_id`.

---

### Trigger Functions

#### `fn_award_achievement_on_complete()`
Used by `trg_award_achievement`. Awards the per-chapter achievement when a chapter is marked complete. Checks total completed chapters and awards `complete_all` when 4 are done.

#### `fn_grant_first_login_achievement()`
Used by `trg_grant_first_login_achievement`. Awards the `first_login` achievement to students on their first session insert.

#### `fn_init_user_chapters()`
Used by `trg_init_user_chapters`. Seeds `tblcompleted_chapters` for all existing chapters for the new user.

#### `fn_init_user_profile()`
Used by `trg_init_user_profile`. Creates the initial profile row for a new user.

#### `fn_update_timestamp()`
Used by `trg_update_profile_timestamp`. Sets `updated_at = NOW()` before any profile update.

#### `hash_password_trigger()`
Used by `trigger_hash_password`. Hashes plaintext passwords before insert or update, skipping already-hashed values.

---

### JWT Utilities

These functions support JWT token generation and verification (used internally or via PostgREST/Supabase auth flows).

| Function | Description |
|----------|-------------|
| `url_encode(data)` | Encodes binary data as base64url (replaces `+/=\n` with `-_` and strips padding) |
| `url_decode(data)` | Decodes a base64url string back to bytea, re-adding padding as needed |
| `algorithm_sign(signables, secret, algorithm)` | Signs a string using HMAC with HS256/HS384/HS512 |
| `sign(payload, secret, algorithm)` | Builds and signs a full JWT from a JSON payload |
| `try_cast_double(inp)` | Safely casts a value to double precision; returns NULL on failure (used for `nbf`/`exp` claims) |
| `verify(token, secret, algorithm)` | Verifies a JWT signature and validates `nbf`/`exp` time range; returns `header`, `payload`, and `valid` |

---

## Entity Relationship Summary

```
tblroles ──< tblusers >── tblsections (professor_id)
                │
                ├──< tblsessions
                ├──< tbluserprofiles
                ├──< tblcompleted_chapters >── tblchapters
                └──< tbluserachievements >── tblachievements
```

---

## Notes

- All passwords are hashed using **bcrypt (blowfish)** via PostgreSQL's `pgcrypto` extension (`crypt` / `gen_salt('bf')`).
- Session tokens are **random 32-byte base64 strings**, valid for **30 days**.
- Chapter unlock logic is **sequential**: Chapter 1 is always unlocked; Chapter N unlocks when Chapter N-1 is completed.
- Achievement awarding uses `ON CONFLICT DO NOTHING` throughout to ensure idempotency.
- The `fn_create_student` and `fn_update_profile` functions have two versions in the codebase — the more recent versions include full name fields and role-based authorization (professors vs. admins).
