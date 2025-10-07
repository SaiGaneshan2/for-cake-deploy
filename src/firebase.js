import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration - Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Validate configuration
if (!firebaseConfig.apiKey) {
  throw new Error('Missing Firebase configuration. Please check your .env file.');
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);

// Test connection on import
console.log('✅ Firebase initialized:', {
  projectId: firebaseConfig.projectId,
});

// Firebase Authentication Service
export const firebaseAuth = {
  // Teacher Registration
  async signUpTeacher(email, password) {
    console.log('🔐 Signing up teacher:', email);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log('✅ User created successfully:', user.uid);

      // Create teacher profile in Firestore (non-blocking)
      try {
        await this.createTeacherProfile(user.uid, {
          email: user.email,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } catch (profileErr) {
        // Do not fail signup if profile creation fails
        console.warn('⚠️ Profile creation failed, continuing signup anyway:', profileErr);
      }

      return { user, error: null };
    } catch (error) {
      console.error('❌ Signup error:', error);
      return { user: null, error };
    }
  },

  // Teacher Login
  async signInTeacher(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      return { user, error: null };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { user: null, error };
    }
  },

  // Logout
  async signOut() {
    try {
      await signOut(auth);
      return { error: null };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        unsubscribe();
        resolve(user);
      });
    });
  },

  // Listen to auth state changes
  onAuthStateChange(callback) {
    return onAuthStateChanged(auth, callback);
  },

  // Create teacher profile in Firestore
  async createTeacherProfile(userId, profileData) {
    try {
      await setDoc(doc(db, 'teachers', userId), {
        userId,
        ...profileData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Error creating profile:', error);
      return { success: false, error };
    }
  },

  // Get teacher profile
  async getTeacherProfile(userId) {
    try {
      const docSnap = await getDoc(doc(db, 'teachers', userId));
      if (docSnap.exists()) {
        return { data: docSnap.data(), error: null };
      } else {
        return { data: null, error: new Error('Profile not found') };
      }
    } catch (error) {
      console.error('❌ Error getting profile:', error);
      return { data: null, error };
    }
  },

  // Update teacher profile
  async updateTeacherProfile(userId, updates) {
    try {
      await updateDoc(doc(db, 'teachers', userId), {
        ...updates,
        updatedAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error('❌ Error updating profile:', error);
      return { success: false, error };
    }
  }
};

export default app;
