# 🔄 New Supabase Project Setup - Quick Guide

## ✅ Step 1: Configuration Updated

Your `.env` file has been updated with new credentials:

```env
VITE_SUPABASE_URL=https://xmytqmeeznnoiimoilrx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 🗄️ Step 2: Set Up Database Tables (REQUIRED!)

You **MUST** run the SQL setup to create the `teachers` table and enable authentication.

### Option 1: Run Full Setup (Recommended) ⭐

1. **Open Supabase Dashboard**
   - Go to: https://xmytqmeeznnoiimoilrx.supabase.co
   - Log in to your Supabase account

2. **Open SQL Editor**
   - Click **"SQL Editor"** in the left sidebar
   - Click **"New Query"**

3. **Copy and Run the SQL**
   - Open the file: `supabase-auth-tables.sql`
   - Copy **ALL** the contents
   - Paste into the SQL Editor
   - Click **"Run"** (or press Ctrl+Enter)
   - Wait for ✅ **Success** message

### Option 2: Run Minimal Setup (Quick)

If you want a simpler setup:
   - Open the file: `supabase-auth-tables-minimal.sql`
   - Follow same steps as above

---

## 🔍 Step 3: Verify Setup

After running the SQL, verify it worked:

```sql
-- Run this in SQL Editor
SELECT * FROM public.teachers;
```

Should return: Empty table (no error) ✅

---

## 🧪 Step 4: Test Your App

1. **Restart your development server** (if running):
   ```powershell
   # Press Ctrl+C to stop
   # Then restart:
   npm run dev
   ```

2. **Test Registration**:
   - Navigate to: `http://localhost:5173/teacher/register`
   - Create a new account with:
     - Email: `test@example.com`
     - Password: `Test123456`
     - Confirm password: `Test123456`
   - Submit the form

3. **Check Supabase Dashboard**:
   - Go to **Authentication** → **Users**
   - You should see your new user!
   - Go to **Table Editor** → **teachers**
   - You should see the teacher profile!

4. **Check your email**:
   - Look for confirmation email from Supabase
   - Click the confirmation link
   - Return to login page

5. **Test Login**:
   - Navigate to: `http://localhost:5173/teacher/login`
   - Login with your credentials
   - Should redirect to dashboard!

---

## 🎯 What Changed

### Old Configuration ❌
```
URL: https://vfxzvptysbfxniweailc.supabase.co
API: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmeHp2...
```

### New Configuration ✅
```
URL: https://xmytqmeeznnoiimoilrx.supabase.co
API: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhteXRx...
```

---

## 🚨 Important Notes

### 1. **You MUST run the SQL setup!**
Without running `supabase-auth-tables.sql`:
- ❌ Registration will work (creates auth.users)
- ❌ But no teacher profile table
- ❌ No automatic profile creation
- ❌ No Row Level Security

With the SQL setup:
- ✅ Registration creates auth.users
- ✅ Automatically creates teacher profile
- ✅ Row Level Security enabled
- ✅ Full functionality ready

### 2. **Restart your dev server**
After changing `.env`, you need to restart:
```powershell
# Stop: Ctrl+C
# Start: npm run dev
```

### 3. **Clear browser data (if needed)**
If you get errors, clear localStorage:
- Open DevTools (F12)
- Go to Application → Local Storage
- Delete all `supabase.auth.*` entries
- Refresh page

---

## 📋 Quick Checklist

Use this to verify everything is set up:

- [ ] ✅ Updated `.env` file (already done!)
- [ ] 🗄️ Ran SQL setup in Supabase dashboard
- [ ] 🔄 Restarted dev server
- [ ] 🧪 Tested registration
- [ ] 👀 Verified user in Supabase → Authentication
- [ ] 👤 Verified profile in Supabase → teachers table
- [ ] 📧 Confirmed email address
- [ ] 🔐 Tested login
- [ ] ✨ Successfully reached dashboard

---

## 🆘 Troubleshooting

### Issue: "Missing Supabase configuration"
**Solution**: Restart your dev server after changing `.env`

### Issue: "relation 'public.teachers' does not exist"
**Solution**: Run the SQL setup file in Supabase SQL Editor

### Issue: "Invalid login credentials"
**Solution**: Make sure you confirmed your email (check inbox/spam)

### Issue: Can't see users in dashboard
**Solution**: Make sure you're logged into the correct project:
- URL should be: https://xmytqmeeznnoiimoilrx.supabase.co

---

## 📚 Reference Files

All documentation updated with new URL:

1. **`supabase-auth-tables.sql`** - Full database setup
2. **`supabase-auth-tables-minimal.sql`** - Minimal setup
3. **`WHERE_CREDENTIALS_ARE_SAVED.md`** - Where data is stored
4. **`STORAGE_QUICK_MAP.md`** - Quick reference
5. **`SUPABASE_TABLES_SETUP_GUIDE.md`** - Detailed setup guide

---

## 🎉 Next Steps

1. **Run the SQL setup** (Step 2 above) - **DO THIS NOW!**
2. **Restart your dev server**
3. **Test registration/login**
4. **Start building your app!**

Your new Supabase project is ready to go! 🚀

---

## 📞 Quick Commands

```powershell
# Restart dev server
npm run dev

# Check if server is running
# Open: http://localhost:5173

# Test registration page
# Open: http://localhost:5173/teacher/register

# Test login page
# Open: http://localhost:5173/teacher/login
```

---

## 🔗 Important Links

- **Supabase Dashboard**: https://xmytqmeeznnoiimoilrx.supabase.co
- **SQL Editor**: https://xmytqmeeznnoiimoilrx.supabase.co/project/_/sql
- **Authentication**: https://xmytqmeeznnoiimoilrx.supabase.co/project/_/auth/users
- **Table Editor**: https://xmytqmeeznnoiimoilrx.supabase.co/project/_/editor

---

**Status**: ✅ Configuration updated, ready to set up database!
