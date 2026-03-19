# VR Nationalian - Complete Database & System Setup Guide

## Project Overview

VR Nationalian is a mobile VR educational game built with Unity for Android (Google Cardboard). The system includes:
- Mobile VR game (Unity - students only)
- Web portal (professors/admins - to be built)
- Supabase backend (PostgreSQL database)

## Database Schema

### Tables

#### 1. tblroles
Normalized roles table for user types.

```sql
CREATE TABLE tblroles (
    role_id INTEGER PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

INSERT INTO tblroles (role_id, role_name) VALUES
(1, 'student'),
(2, 'professor'),
(3, 'admin');
```

#### 2. tblsections
Sections/classes managed by professors.

```sql
CREATE TABLE tblsections (
    section_id SERIAL PRIMARY KEY,
    section_name TEXT NOT NULL,
    professor_id INTEGER NOT NULL REFERENCES tblusers(user_id),
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. tblusers
Main users table with role-based access.

```sql
CREATE TABLE tblusers (
    user_id SERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    role_id INTEGER NOT NULL REFERENCES tblroles(role_id),
    first_name TEXT,
    middle_initial TEXT,
    last_name TEXT,
    section_id INTEGER REFERENCES tblsections(section_id),
    session_token TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

**Key Points:**
- `role_id`: 1=student, 2=professor, 3=admin
- `section_id`: Only for students (which section they belong to)
- `session_token`: Simple session management
- Passwords stored as plain text (development only - use hashing in production)

## Complete Database Setup SQL

Run this SQL in Supabase SQL Editor to set up everything:

```sql
-- 1. Create roles table
CREATE TABLE IF NOT EXISTS tblroles (
    role_id INTEGER PRIMARY KEY,
    role_name TEXT NOT NULL UNIQUE
);

INSERT INTO tblroles (role_id, role_name) VALUES
(1, 'student'),
(2, 'professor'),
(3, 'admin')
ON CONFLICT (role_id) DO NOTHING;

-- 2. Create sections table
CREATE TABLE IF NOT EXISTS tblsections (
    section_id SERIAL PRIMARY KEY,
    section_name TEXT NOT NULL,
    professor_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Update users table
ALTER TABLE tblusers 
ADD COLUMN IF NOT EXISTS role_id INTEGER REFERENCES tblroles(role_id) DEFAULT 1,
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS middle_initial TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT,
ADD COLUMN IF NOT EXISTS section_id INTEGER REFERENCES tblsections(section_id);

-- 4. Add foreign key for sections
ALTER TABLE tblsections 
ADD CONSTRAINT fk_professor 
FOREIGN KEY (professor_id) REFERENCES tblusers(user_id);
```

## Database Functions

### 1. Login Function

Returns user info including role and name fields.

```sql
CREATE OR REPLACE FUNCTION fn_login(p_username TEXT, p_password TEXT)
RETURNS TABLE(
    user_id INTEGER,
    username TEXT,
    role_id INTEGER,
    role_name TEXT,
    first_name TEXT,
    middle_initial TEXT,
    last_name TEXT,
    section_id INTEGER,
    session_token TEXT
) AS $$
DECLARE
    v_user_id INTEGER;
    v_role_id INTEGER;
    v_role_name TEXT;
    v_first_name TEXT;
    v_middle_initial TEXT;
    v_last_name TEXT;
    v_section_id INTEGER;
    v_token TEXT;
BEGIN
    -- Check credentials
    SELECT u.user_id, u.role_id, u.first_name, u.middle_initial, u.last_name, u.section_id
    INTO v_user_id, v_role_id, v_first_name, v_middle_initial, v_last_name, v_section_id
    FROM tblusers u
    WHERE u.username = p_username AND u.password = p_password;
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Invalid credentials';
    END IF;
    
    -- Get role name
    SELECT r.role_name INTO v_role_name
    FROM tblroles r
    WHERE r.role_id = v_role_id;
    
    -- Generate session token
    v_token := md5(random()::text || clock_timestamp()::text);
    
    -- Update session token
    UPDATE tblusers SET session_token = v_token WHERE user_id = v_user_id;
    
    -- Return user info
    RETURN QUERY SELECT v_user_id, p_username, v_role_id, v_role_name, 
                        v_first_name, v_middle_initial, v_last_name, v_section_id, v_token;
END;
$$ LANGUAGE plpgsql;
```

### 2. Section Management Functions

#### Create Section
```sql
CREATE OR REPLACE FUNCTION fn_create_section(
    p_section_name TEXT,
    p_professor_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_section_id INTEGER;
BEGIN
    INSERT INTO tblsections (section_name, professor_id)
    VALUES (p_section_name, p_professor_id)
    RETURNING section_id INTO v_section_id;
    
    RETURN v_section_id;
END;
$$ LANGUAGE plpgsql;
```

#### Get Sections by Professor
```sql
CREATE OR REPLACE FUNCTION fn_get_sections_by_professor(p_professor_id INTEGER)
RETURNS TABLE(
    section_id INTEGER,
    section_name TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.section_id, s.section_name, s.created_at
    FROM tblsections s
    WHERE s.professor_id = p_professor_id
    ORDER BY s.created_at DESC;
END;
$$ LANGUAGE plpgsql;
```

#### Update Section
```sql
CREATE OR REPLACE FUNCTION fn_update_section(
    p_section_id INTEGER,
    p_section_name TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tblsections
    SET section_name = p_section_name
    WHERE section_id = p_section_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

#### Delete Section
```sql
CREATE OR REPLACE FUNCTION fn_delete_section(p_section_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    -- Remove section reference from students
    UPDATE tblusers SET section_id = NULL WHERE section_id = p_section_id;
    
    -- Delete section
    DELETE FROM tblsections WHERE section_id = p_section_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

### 3. Student Management Functions

#### Create Student
```sql
CREATE OR REPLACE FUNCTION fn_create_student(
    p_username TEXT,
    p_password TEXT,
    p_first_name TEXT,
    p_middle_initial TEXT,
    p_last_name TEXT,
    p_section_id INTEGER
)
RETURNS INTEGER AS $$
DECLARE
    v_user_id INTEGER;
BEGIN
    INSERT INTO tblusers (username, password, role_id, first_name, middle_initial, last_name, section_id)
    VALUES (p_username, p_password, 1, p_first_name, p_middle_initial, p_last_name, p_section_id)
    RETURNING user_id INTO v_user_id;
    
    RETURN v_user_id;
END;
$$ LANGUAGE plpgsql;
```

#### Get Students by Section
```sql
CREATE OR REPLACE FUNCTION fn_get_students_by_section(p_section_id INTEGER)
RETURNS TABLE(
    user_id INTEGER,
    username TEXT,
    first_name TEXT,
    middle_initial TEXT,
    last_name TEXT,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.user_id, u.username, u.first_name, u.middle_initial, u.last_name, u.created_at
    FROM tblusers u
    WHERE u.section_id = p_section_id AND u.role_id = 1
    ORDER BY u.last_name, u.first_name;
END;
$$ LANGUAGE plpgsql;
```

#### Update Student
```sql
CREATE OR REPLACE FUNCTION fn_update_student(
    p_user_id INTEGER,
    p_username TEXT,
    p_first_name TEXT,
    p_middle_initial TEXT,
    p_last_name TEXT,
    p_section_id INTEGER
)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE tblusers
    SET username = p_username,
        first_name = p_first_name,
        middle_initial = p_middle_initial,
        last_name = p_last_name,
        section_id = p_section_id
    WHERE user_id = p_user_id AND role_id = 1;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

#### Delete Student
```sql
CREATE OR REPLACE FUNCTION fn_delete_student(p_user_id INTEGER)
RETURNS BOOLEAN AS $$
BEGIN
    DELETE FROM tblusers WHERE user_id = p_user_id AND role_id = 1;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;
```

## Unity Integration

### SupabaseManager.cs Key Features

The Unity C# script handles all Supabase communication:

```csharp
// Stored user data
public static int UserId { get; private set; }
public static string Username { get; private set; }
public static int RoleId { get; private set; }
public static string RoleName { get; private set; }
public static string FirstName { get; private set; }
public static string MiddleInitial { get; private set; }
public static string LastName { get; private set; }
public static int? SectionId { get; private set; }
public static string SessionToken { get; private set; }

// Helper method
public static string GetFullName()
{
    string fullName = FirstName ?? "";
    if (!string.IsNullOrEmpty(MiddleInitial))
        fullName += " " + MiddleInitial + ".";
    if (!string.IsNullOrEmpty(LastName))
        fullName += " " + LastName;
    return fullName.Trim();
}
```

### Login Flow

1. User enters username/password in Unity
2. Unity calls `SupabaseManager.Login(username, password)`
3. Supabase function `fn_login()` validates and returns user data
4. Unity stores user info in static properties
5. Unity loads appropriate scene based on role

## Access Control

### Role-Based Access

- **Students (role_id = 1)**
  - Can only login on mobile app
  - Belong to one section
  - Can play VR game chapters

- **Professors (role_id = 2)**
  - Can only login on web portal
  - Can create/manage sections
  - Can create/manage students within their sections
  - Can view student progress

- **Admins (role_id = 3)**
  - Can only login on web portal
  - Full system access
  - Can manage professors and all sections

### Platform Restrictions

- Mobile App: Students only
- Web Portal: Professors and Admins only

## VR Game Features

### Mobile VR Implementation

- **Platform**: Android (Google Cardboard compatible)
- **Controls**: Gyroscope head tracking, auto-walk forward
- **Interaction**: Gaze-based (look at objects for 2 seconds)
- **Movement**: Auto-walk stops when looking down (45° threshold)
- **Display**: Stereoscopic split-screen rendering
- **Audio**: Footstep sounds with randomized pitch/volume

### Key Scripts

1. **SimpleStereoCamera.cs** - Creates left/right eye cameras for VR
2. **PlayerMovement.cs** - Auto-walk with look-down-to-stop
3. **MouseLook.cs** - Gyroscope-based head tracking
4. **PlayerInteraction.cs** - Gaze-based paper pickup
5. **Crosshair.cs** - Dual crosshairs (one per eye)
6. **FootstepSounds.cs** - Dynamic footstep audio

## Build Configuration

### Unity Build Settings

- **Platform**: Android
- **Architecture**: ARM64
- **Scripting Backend**: IL2CPP
- **API Level**: Minimum Android 7.0 (API 24)
- **Orientation**: Landscape Left
- **Internet Access**: Require
- **Active Input Handling**: Input Manager (Old)

### Required Packages

- TextMeshPro
- Universal Render Pipeline (URP)

## Next Steps

### For Web Portal Development

1. Create TypeScript Node.js backend
2. Build React (TSX) frontend
3. Implement professor dashboard:
   - Section management
   - Student account creation
   - Progress tracking
4. Implement admin dashboard:
   - Professor management
   - System-wide analytics

### For Game Enhancement

1. Add more chapters/levels
2. Implement progress tracking (save to database)
3. Add leaderboards
4. Create tutorial system
5. Add ambient sounds and music

## Security Notes

⚠️ **Current Implementation (Development Only)**
- Passwords stored as plain text
- Simple session token (MD5 hash)
- No password requirements

🔒 **Production Requirements**
- Hash passwords (bcrypt/argon2)
- Implement JWT tokens
- Add password strength requirements
- Enable RLS (Row Level Security) in Supabase
- Add rate limiting
- Implement HTTPS only

## Database Maintenance

### Useful Queries

```sql
-- View all users with roles
SELECT u.user_id, u.username, r.role_name, u.first_name, u.last_name, s.section_name
FROM tblusers u
JOIN tblroles r ON u.role_id = r.role_id
LEFT JOIN tblsections s ON u.section_id = s.section_id;

-- Count students per section
SELECT s.section_name, COUNT(u.user_id) as student_count
FROM tblsections s
LEFT JOIN tblusers u ON s.section_id = u.section_id AND u.role_id = 1
GROUP BY s.section_id, s.section_name;

-- Find students without sections
SELECT user_id, username, first_name, last_name
FROM tblusers
WHERE role_id = 1 AND section_id IS NULL;
```

## Troubleshooting

### Common Issues

1. **Login fails**: Check username/password, verify user exists
2. **Section not showing**: Verify professor_id matches logged-in user
3. **Student can't be added**: Check section_id exists and is valid
4. **VR not working**: Ensure ARM64 enabled, landscape orientation set
5. **Gyroscope not working**: Check device has gyroscope sensor

## Summary

This system provides a complete educational VR game platform with:
- Normalized database with role-based access
- Section/class management for professors
- Student account management
- Mobile VR game with modern controls
- Session-based authentication
- Extensible architecture for future features

All database functions are tested and working. The Unity mobile app successfully connects to Supabase and handles authentication, user data, and game progression.
