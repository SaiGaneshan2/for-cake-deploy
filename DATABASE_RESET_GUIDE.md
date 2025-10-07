# 🔄 COMPLETE DATABASE RESET - STEP BY STEP

## ⚠️ IMPORTANT: Follow These Steps IN ORDER

---

## 📋 **STEP 1: DELETE OLD USERS IN SUPABASE**

Before running the SQL, clean up old test users:

1. Go to Supabase Dashboard: https://xmytqmeeznnoiimoilrx.supabase.co
2. Click **Authentication** → **Users**
3. **DELETE ALL USERS** (teacher@gmail.com, teacher2@gmail.com, varsha@gmail.com, etc.)
   - Click on each user
   - Click the "Delete user" button
   - Confirm deletion

**Why?** Start completely fresh with no leftover data!

---

## 📋 **STEP 2: RUN THE COMPLETE RESET SQL**

1. In Supabase, go to **SQL Editor**
2. Create a new query
3. **Copy and paste the ENTIRE SQL from `COMPLETE_DATABASE_RESET.sql`**
4. Click **RUN**
5. Wait for it to complete

**Expected output:**
- ✅ Teachers table created: YES ✅
- ✅ Trigger created: YES ✅
- ✅ RLS enabled: YES ✅
- ✅ Policies created: 5 ✅

---

## 📋 **STEP 3: RESTART YOUR DEV SERVER**

In VS Code terminal:

```powershell
# Press Ctrl+C to stop the current server

# Then start it again
npm run dev
```

**Wait until you see:** `Local: http://localhost:5174/`

---

## 📋 **STEP 4: TEST REGISTRATION**

1. Go to: `http://localhost:5174/teacher/register`

2. Register a NEW user:
   - Email: `test@example.com`
   - Password: `TestPass123`
   - Confirm: `TestPass123`

3. Click **Create Account**

**Expected result:** ✅ "Registration successful! Please check your email..."

---

## 📋 **STEP 5: VERIFY IN SUPABASE**

Go back to Supabase:

### Check Authentication:
1. **Authentication** → **Users**
2. You should see `test@example.com`
3. Status should be **CONFIRMED** ✅

### Check Teachers Table:
1. **Table Editor** → **teachers**
2. You should see a row with:
   - email: `test@example.com`
   - user_id: (a UUID)
   - full_name: (null - that's OK!)

---

## 📋 **STEP 6: TEST LOGIN**

1. Go to: `http://localhost:5174/teacher/login`

2. Login with:
   - Email: `test@example.com`
   - Password: `TestPass123`

3. Click **Sign In**

**Expected result:** ✅ Should redirect to dashboard!

---

## ✅ **SUCCESS CHECKLIST**

- [ ] All old users deleted from Supabase
- [ ] SQL script ran without errors
- [ ] Verification shows all ✅
- [ ] Dev server restarted
- [ ] New registration works
- [ ] User appears in auth.users (CONFIRMED)
- [ ] User appears in teachers table
- [ ] Login works!

---

## 🚨 **IF IT STILL FAILS:**

### Error: "Database error loading user after sign-up"

**Check this SQL:**

```sql
-- Check if trigger is running
SELECT * FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Check permissions
SELECT grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name='teachers';
```

### Error: "Invalid login credentials"

**Check this:**

1. Are you using the EXACT password you set?
2. Is the user confirmed? Run:

```sql
SELECT email, email_confirmed_at FROM auth.users;
```

---

## 💡 **WHAT CHANGED:**

1. ✅ **Simplified registration** - No longer checks for profile immediately
2. ✅ **Auto-confirm users** - New trigger confirms emails automatically
3. ✅ **Better error handling** - Trigger won't block signup if it fails
4. ✅ **Service role policy** - Trigger has permission to insert profiles
5. ✅ **Clean slate** - Deleted all old conflicting data

---

## 🎯 **WHAT SHOULD HAPPEN:**

```
USER REGISTERS
    ↓
1. User created in auth.users (with email confirmed)
    ↓
2. Trigger fires automatically
    ↓
3. Profile created in teachers table
    ↓
4. Registration success message shown
    ↓
5. User can login immediately
```

---

**Start with STEP 1 and work through each step!** 🚀

Don't skip any steps - they build on each other!
