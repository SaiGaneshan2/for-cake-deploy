# 🚀 How to Run Your Project

## ✅ **Step-by-Step Instructions**

### **1. Install Dependencies**

Open your terminal in the project folder and run:

```bash
npm install
```

**Wait for it to complete** (may take 1-2 minutes)

---

### **2. Enable Firebase Services** (IMPORTANT!)

Before running the app, you MUST enable these in Firebase Console:

1. **Go to**: https://console.firebase.google.com/
2. **Select project**: `godhelp-ada9f`
3. **Enable Authentication**:
   - Click "Authentication" → "Get started"
   - Go to "Sign-in method" tab
   - Enable "Email/Password"
   - Click "Save"

4. **Enable Firestore Database**:
   - Click "Firestore Database" → "Create database"
   - Choose "Start in production mode"
   - Select location (closest to you)
   - Click "Done"

---

### **3. Run the Project**

**Option 1: Run Both Server and Frontend Together** (Recommended)
```bash
npm run dev
```

**Option 2: Run Separately** (If Option 1 doesn't work)

**Terminal 1** - Run the backend server:
```bash
npm run server
```

**Terminal 2** - Run the frontend:
```bash
npx vite
```

---

### **4. Access Your App**

Once running, open your browser:
- **Frontend**: http://localhost:5173/
- **Backend**: http://localhost:3001/

---

## 🎯 **Test Your Authentication**

### **Register a New User:**
1. Go to: http://localhost:5173/teacher/register
2. Enter email: `test@example.com`
3. Enter password: `password123`
4. Confirm password
5. Click "Create Account"

### **Login:**
1. Go to: http://localhost:5173/teacher/login
2. Enter same credentials
3. Click "Login"

---

## 🚨 **Troubleshooting**

### **Issue: "concurrently is not recognized"**
**Solution:**
```bash
npm install
```

### **Issue: "Missing Firebase configuration"**
**Solution:** Make sure your `.env` file has:
```env
VITE_FIREBASE_API_KEY=AIzaSyABRLQZUA1QZOXN6fBBH-J-feePZfWP88s
VITE_FIREBASE_AUTH_DOMAIN=godhelp-ada9f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=godhelp-ada9f
VITE_FIREBASE_STORAGE_BUCKET=godhelp-ada9f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=138312654761
VITE_FIREBASE_APP_ID=1:138312654761:web:ba34b6e8a9536d1a986eb8
```

### **Issue: "Registration failed: Database error"**
**Solution:** Enable Authentication and Firestore in Firebase Console (see Step 2 above)

### **Issue: Port already in use**
**Solution:** Kill the process or use different ports:
```bash
npx vite --port 5174
```

---

## 📁 **Project Structure**

```
for-mega-cake/
├── src/
│   ├── firebase.js              # Firebase configuration
│   ├── components/
│   │   └── auth/
│   │       ├── Login.jsx        # Login page
│   │       └── Register.jsx     # Registration page
│   └── redux/
│       ├── firebaseAuthSlice.js # Auth state management
│       └── store.js             # Redux store
├── server.js                    # Backend server
├── .env                         # Firebase config (DO NOT COMMIT!)
└── package.json                 # Dependencies
```

---

## ✅ **Quick Checklist**

- [ ] `npm install` completed successfully
- [ ] Firebase Authentication enabled
- [ ] Firestore Database created
- [ ] `.env` file has correct Firebase config
- [ ] Both server and frontend running
- [ ] Can access http://localhost:5173/

---

## 🎉 **You're All Set!**

Your project should now be running with Firebase authentication fully integrated!

**Need help?** Check the Firebase Console to see if users are being created when you register.
