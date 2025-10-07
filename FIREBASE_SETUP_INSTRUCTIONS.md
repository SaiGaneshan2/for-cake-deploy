# 🚀 Firebase Setup Instructions

## ✅ What's Been Done

I've completely replaced your Supabase setup with **Firebase** - a much easier and more powerful database solution. Here's what changed:

### **New Files Created:**
- ✅ `src/firebase.js` - Firebase configuration and auth service
- ✅ `src/redux/firebaseAuthSlice.js` - Redux slice for Firebase auth state

### **Updated Files:**
- ✅ `src/components/auth/Login.jsx` - Now uses Firebase authentication
- ✅ `src/components/auth/Register.jsx` - Now uses Firebase authentication
- ✅ `src/redux/store.js` - Updated to use Firebase auth slice
- ✅ `package.json` - Added Firebase dependencies, removed Supabase
- ✅ `.env` - Updated with Firebase configuration variables

---

## 🔧 What You Need to Do (5 minutes)

### **Step 1: Create Firebase Project**

1. **Go to**: https://console.firebase.google.com/
2. **Click**: "Add project" (or "Create a project")
3. **Enter project name**: `sql-quest` (or any name)
4. **Follow the prompts** (you can disable Google Analytics for now)
5. **Wait for project creation** (usually 30-60 seconds)

### **Step 2: Enable Authentication**

1. **In Firebase Console**, click **"Authentication"** (left sidebar)
2. **Click "Get started"**
3. **Go to "Sign-in method"** tab
4. **Enable "Email/Password"** provider:
   - Click "Email/Password"
   - Toggle "Enable" switch
   - Click "Save"

### **Step 3: Enable Firestore Database**

1. **In Firebase Console**, click **"Firestore Database"** (left sidebar)
2. **Click "Create database"**
3. **Choose "Start in production mode"** (you can change later)
4. **Select a location** (choose the closest to your users)
5. **Click "Done"**

### **Step 4: Get Your Firebase Config**

1. **In Firebase Console**, click the **gear icon** (⚙️) → **"Project settings"**
2. **Scroll down** to "Your apps" section
3. **Click "Web app"** icon (</>) or "Add app" if none exists
4. **Register your app**:
   - App nickname: `sql-quest-web`
   - Don't check the hosting boxes
   - Click "Register app"

5. **Copy the config object** that appears:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
     authDomain: "sql-quest-xxxxx.firebaseapp.com",
     projectId: "sql-quest-xxxxx",
     storageBucket: "sql-quest-xxxxx.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:xxxxxxxxxxxxxxx"
   };
   ```

### **Step 5: Update Your .env File**

**Replace the placeholder values** in your `.env` file with the actual values from Step 4:

```env
VITE_FIREBASE_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=sql-quest-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=sql-quest-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=sql-quest-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:xxxxxxxxxxxxxxx
```

### **Step 6: Restart Your App**

```bash
npm run dev
```

---

## 🎯 Test It Out

### **Test Registration:**
1. Go to your registration page
2. Enter email: `test@example.com`
3. Enter password: `123456` (or any 6+ characters)
4. Confirm password
5. Click "Create Account"

✅ **Expected**: Account created, profile auto-created in Firestore, redirected to dashboard

### **Test Login:**
1. Go to login page
2. Enter same email/password
3. Click "Login"

✅ **Expected**: Logged in, redirected to dashboard

### **Verify in Firebase:**
1. **Firebase Console** → **Authentication** → **Users** (see registered user)
2. **Firebase Console** → **Firestore Database** → **teachers** collection (see profile)

---

## 🔥 Firebase Advantages Over Supabase

| Feature | Firebase | Supabase |
|---------|----------|----------|
| **Setup Time** | 5 minutes | 15+ minutes |
| **Authentication** | Built-in, excellent | Good |
| **Real-time** | Native support | Via extensions |
| **Documentation** | Excellent | Good |
| **React Integration** | Perfect | Good |
| **Free Tier** | 1GB storage | 500MB storage |

---

## 🔧 Firebase Rules (Security)

Firebase automatically creates basic security rules. For production, you'll want to customize them:

**In Firebase Console → Firestore Database → Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Teachers can read/write their own profile
    match /teachers/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

---

## 📞 Need Help?

If you get stuck:
1. **Double-check** your `.env` file has the correct Firebase config values
2. **Make sure** Authentication and Firestore are enabled in Firebase Console
3. **Verify** the project ID in your config matches your Firebase project

**Firebase is now fully integrated!** 🚀 Much easier than Supabase, and ready to use!
