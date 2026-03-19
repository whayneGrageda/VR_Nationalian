Context: I'm building a Unity game with Supabase as the backend. Here's everything set up so far:
Supabase Tables:
tblusers         → user_id (UUID PK), username (TEXT), password (TEXT), email (TEXT), created_at
tblchapters      → chapter_id (INT PK 1-4), chapter_name, chapter_order
tblcompleted_chapters → id (UUID PK), user_id (FK → tblusers), chapter_id (FK → tblchapters), is_completed (BOOLEAN), completed_at
Rules:

No Supabase Auth — custom login using username, password, email from tblusers
Chapter 1 is always unlocked by default
Chapters 2–4 unlock when the previous chapter's is_completed = true
One row per user per chapter in tblcompleted_chapters (enforced by UNIQUE constraint)
No external SDK — using plain Unity UnityWebRequest hitting the Supabase REST API

Game:

2x2 grid of chapter buttons on the chapter select screen
Chapter 1 scene = player collects artifacts on the ground. When all artifacts are collected, it should PATCH tblcompleted_chapters setting is_completed = true and completed_at = now() for that user_id + chapter_id = 1, which then unlocks Chapter 2