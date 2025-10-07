# 📚 Supabase Authentication Tables Setup Guide

## ❓ Do You Need to Create Tables?

### Short Answer: **Partially YES**

- ❌ **DON'T create `auth.users`** - Supabase creates this automatically
- ✅ **DO create `teachers` profile table** - For storing additional teacher info (recommended)

---

## 🔍 What Supabase Provides Automatically

When you use `supabase.auth.signUp()`, Supabase **automatically** manages:

| Table | Purpose | You Manage? |
|-------|---------|-------------|
| `auth.users` | Core user authentication | ❌ NO - Supabase manages |
| `auth.sessions` | Active sessions | ❌ NO - Supabase manages |
| `auth.refresh_tokens` | Token refresh | ❌ NO - Supabase manages |

**These tables are in the `auth` schema and are managed by Supabase. DO NOT modify them directly!**

---

## ✅ What You Should Create

### Option 1: No Additional Tables (Works but Limited)

Your current code will work **without** creating any tables because:
- `supabase.auth.signUp()` automatically creates a user in `auth.users`
- `supabase.auth.signInWithPassword()` authenticates against `auth.users`

**Limitation**: You can only store email and password. No additional info like name, school, etc.

---

### Option 2: Create Teachers Profile Table (Recommended ⭐)

Create a custom `teachers` table to store additional information.

---

## 📝 How to Set Up in Supabase

### Step 1: Go to Supabase SQL Editor

1. Open your Supabase project: https://vfxzvptysbfxniweailc.supabase.co
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"**

### Step 2: Choose Your SQL Script

#### **Option A: Full Version** (Recommended)
Use the file: **`supabase-auth-tables.sql`**

Features:
- ✅ Teachers profile table with additional fields
- ✅ Row Level Security (RLS) for data protection
- ✅ Automatic profile creation on signup
- ✅ Auto-updating timestamps
- ✅ Helpful views for querying
- ✅ Proper indexes for performance

#### **Option B: Minimal Version** (Quickstart)
Use the file: **`supabase-auth-tables-minimal.sql`**

Features:
- ✅ Basic teachers table
- ✅ Simple RLS policies
- ✅ Auto-create profile on signup
- 🔹 Fewer fields, simpler setup

### Step 3: Run the SQL

1. Copy the contents of your chosen SQL file
2. Paste into the SQL Editor
3. Click **"Run"** or press `Ctrl+Enter`
4. Check for success message ✅

---

## 🎯 What Each SQL File Does

### Full Version (`supabase-auth-tables.sql`)

```sql
-- Creates teachers table with fields:
- id (UUID, primary key)
- user_id (links to auth.users)
- email
- full_name
- school_name
- subject
- created_at
- updated_at

-- Sets up Row Level Security (RLS)
- Users can only see/edit their own profile

-- Creates automatic trigger
- When user signs up, profile is auto-created

-- Adds helper functions
- Auto-update timestamps
- Easy querying with views
```

### Minimal Version (`supabase-auth-tables-minimal.sql`)

```sql
-- Creates simple teachers table:
- id
- user_id (links to auth.users)
- email
- full_name
- created_at

-- Basic RLS policies

-- Auto-create profile on signup
```

---

## 🔄 How It Works Together

### Without Custom Table
```
User signs up → auth.users created → Done
User logs in → auth.users checked → Session created
```

### With Teachers Table (Recommended)
```
User signs up 
  ↓
auth.users created (by Supabase)
  ↓
Trigger fires automatically
  ↓
teachers profile created (by your SQL)
  ↓
Done - User has both auth account AND profile
```

---

## 💡 Example: Using the Teachers Table

### After running the SQL, you can query teacher data:

```javascript
// In your React components
import { supabase } from '../supabaseClient';

// Get current teacher's profile
async function getTeacherProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('teachers')
    .select('*')
    .eq('user_id', user.id)
    .single();
    
  return data;
}

// Update teacher profile
async function updateTeacherProfile(updates) {
  const { data: { user } } = await supabase.auth.getUser();
  
  const { data, error } = await supabase
    .from('teachers')
    .update(updates)
    .eq('user_id', user.id);
    
  return { data, error };
}
```

---

## 🔒 Security Features (Full Version)

### Row Level Security (RLS)
Ensures teachers can only access their own data:

```sql
-- Teachers can only SELECT their own row
auth.uid() = user_id

-- Teachers can only UPDATE their own row
auth.uid() = user_id
```

### Automatic Profile Creation
When a new user signs up, a profile is automatically created:

```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_teacher();
```

---

## ✅ Verification Steps

### After Running the SQL

1. **Check Table Exists**
   ```sql
   SELECT * FROM public.teachers;
   ```
   Should return empty table (no error)

2. **Test Signup**
   - Use your Register component to create a new teacher
   - Check Supabase Dashboard → Authentication → Users
   - Should see new user

3. **Check Profile Created**
   ```sql
   SELECT * FROM public.teachers;
   ```
   Should show the new teacher profile

4. **Check RLS Working**
   - Log in as Teacher A
   - Try to query teachers table
   - Should only see Teacher A's profile

---

## 🚨 Common Issues & Solutions

### Issue: "permission denied for table teachers"
**Solution**: Run the GRANT permissions section:
```sql
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.teachers TO authenticated;
```

### Issue: "relation 'public.teachers' does not exist"
**Solution**: Run the CREATE TABLE section from the SQL file

### Issue: Profile not created on signup
**Solution**: Check the trigger exists:
```sql
SELECT trigger_name FROM information_schema.triggers 
WHERE event_object_table = 'teachers';
```

### Issue: Can see other teachers' data
**Solution**: RLS not enabled. Run:
```sql
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
```

---

## 🎓 Understanding the Tables

### auth.users (Managed by Supabase)
```
┌─────────────────────────────────────┐
│          auth.users                 │
├─────────────────────────────────────┤
│ id (UUID)                           │
│ email                               │
│ encrypted_password                  │
│ email_confirmed_at                  │
│ last_sign_in_at                     │
│ raw_user_meta_data                  │
│ created_at                          │
└─────────────────────────────────────┘
        ↑
        │ (referenced by user_id)
        │
┌─────────────────────────────────────┐
│       public.teachers               │
├─────────────────────────────────────┤
│ id (UUID)                           │
│ user_id → auth.users.id             │
│ email                               │
│ full_name                           │
│ school_name                         │
│ subject                             │
│ created_at                          │
│ updated_at                          │
└─────────────────────────────────────┘
```

---

## 📋 Quick Decision Guide

### Choose NO CUSTOM TABLE if:
- ✅ You only need email/password authentication
- ✅ No additional teacher information needed
- ✅ Simplest setup

### Choose CUSTOM TEACHERS TABLE if:
- ✅ You want to store teacher names, schools, subjects
- ✅ You want profile pages
- ✅ You need to query teacher information
- ✅ **Recommended for production apps**

---

## 🎯 Recommendation

**Use the FULL VERSION** (`supabase-auth-tables.sql`) because:

1. ✅ More professional and scalable
2. ✅ Better security with RLS
3. ✅ Automatic profile creation
4. ✅ Easy to add features later
5. ✅ Production-ready

---

## 📝 Summary

1. **auth.users is automatic** - Don't create it
2. **teachers table is optional** - But highly recommended
3. **Run the SQL file** in Supabase SQL Editor
4. **Verify it works** by signing up a test user
5. **Your React code** already works with this setup!

The authentication system you built will work **even better** with the custom teachers table! 🚀
