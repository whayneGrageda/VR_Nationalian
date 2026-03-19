# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Step 1: Install Dependencies
```bash
cd vr-nationalian-portal
npm install
```

### Step 2: Configure Environment
Create `backend/.env`:
```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### Step 3: Start Development
Open two terminals:

**Terminal 1 - Backend:**
```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**
```bash
npm run dev:frontend
```

### Step 4: Access the Portal
Open http://localhost:5173 in your browser

Login with a professor or admin account from your Supabase database.

---

## 📋 Default Test Accounts

Create these in Supabase for testing:

### Professor Account
```sql
INSERT INTO tblusers (username, password, role_id, first_name, last_name)
VALUES ('prof1', 'password123', 2, 'John', 'Doe');
```

### Admin Account
```sql
INSERT INTO tblusers (username, password, role_id, first_name, last_name)
VALUES ('admin1', 'admin123', 3, 'Admin', 'User');
```

---

## 🎯 What You Can Do

### As Professor:
1. Create and manage sections
2. Add students to sections
3. Edit student information
4. View dashboard statistics

### As Admin:
1. Everything professors can do
2. Create and manage professor accounts
3. View system-wide analytics
4. Access all sections and students

---

## 🔧 Common Commands

```bash
# Install all dependencies
npm install

# Run backend only
npm run dev:backend

# Run frontend only
npm run dev:frontend

# Build for production
npm run build

# Build backend only
npm run build:backend

# Build frontend only
npm run build:frontend
```

---

## 📁 Key Files

- `backend/.env` - Backend configuration
- `backend/src/index.ts` - Backend entry point
- `frontend/src/App.tsx` - Frontend routes
- `frontend/src/pages/` - All page components

---

## 🐛 Troubleshooting

**Backend won't start?**
- Check `.env` file exists
- Verify Supabase credentials
- Ensure port 3000 is free

**Can't login?**
- Verify user exists in database
- Check role_id is 2 or 3 (not 1)
- Ensure password matches

**Frontend shows errors?**
- Make sure backend is running
- Check browser console for details
- Verify API calls in Network tab

---

## 📚 Next Steps

1. Read the full [README.md](./README.md)
2. Check [SKILL.md](../SKILL.md) for database schema
3. Explore the code structure
4. Customize the UI/UX
5. Add more features!
