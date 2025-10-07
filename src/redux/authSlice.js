import { createSlice } from '@reduxjs/toolkit';

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  isNewUser: false, // Track if user is new to show registration
};

// Load user data from localStorage
const loadUserFromStorage = () => {
  try {
    const userData = localStorage.getItem('sql-quest-user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return {
        user: parsedUser,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isNewUser: false,
      };
    }
  } catch (error) {
    console.error('Error loading user from storage:', error);
  }
  return initialState;
};

// Save user data to localStorage
const saveUserToStorage = (userData) => {
  try {
    localStorage.setItem('sql-quest-user', JSON.stringify(userData));
  } catch (error) {
    console.error('Error saving user to storage:', error);
  }
};

// Remove user data from localStorage
const removeUserFromStorage = () => {
  try {
    localStorage.removeItem('sql-quest-user');
  } catch (error) {
    console.error('Error removing user from storage:', error);
  }
};

// Check if username exists in localStorage
const checkUsernameExists = (username) => {
  try {
    const users = localStorage.getItem('sql-quest-users');
    if (users) {
      const userList = JSON.parse(users);
      return userList.some(user => user.username.toLowerCase() === username.toLowerCase());
    }
  } catch (error) {
    console.error('Error checking username:', error);
  }
  return false;
};

// Save new user to users list
const saveNewUser = (userData) => {
  try {
    const users = localStorage.getItem('sql-quest-users');
    let userList = users ? JSON.parse(users) : [];
    
    // Check if user already exists
    const existingUser = userList.find(user => user.username.toLowerCase() === userData.username.toLowerCase());
    if (existingUser) {
      throw new Error('Username already exists');
    }
    
    userList.push(userData);
    localStorage.setItem('sql-quest-users', JSON.stringify(userList));
    return true;
  } catch (error) {
    console.error('Error saving new user:', error);
    throw error;
  }
};

// Authenticate user
const authenticateUser = (username, password) => {
  try {
    const users = localStorage.getItem('sql-quest-users');
    if (users) {
      const userList = JSON.parse(users);
      const user = userList.find(user => 
        user.username.toLowerCase() === username.toLowerCase() && 
        user.password === password
      );
      return user || null;
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
  }
  return null;
};

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState: loadUserFromStorage(),
  reducers: {
    // Set loading state
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    
    // Set error state
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    
    // Clear error state
    clearError: (state) => {
      state.error = null;
    },
    
    // Check if user is new
    checkNewUser: (state, action) => {
      const username = action.payload;
      state.isNewUser = !checkUsernameExists(username);
      state.error = null;
    },
    
    // Register new user
    registerUser: (state, action) => {
      const { username, password, email } = action.payload;
      state.isLoading = true;
      state.error = null;
      
      try {
        // Check if username already exists
        if (checkUsernameExists(username)) {
          state.error = 'Username already exists';
          state.isLoading = false;
          return;
        }
        
        // Create new user data
        const newUser = {
          id: Date.now().toString(),
          username,
          password, // In a real app, this should be hashed
          email,
          createdAt: new Date().toISOString(),
          gameProgress: {
            currentLevel: 1,
            lives: 3,
            progress: [],
            skipCount: 0,
            videoWatched: false,
          },
          stats: {
            totalPlayTime: 0,
            levelsCompleted: 0,
            totalScore: 0,
            lastPlayed: new Date().toISOString(),
          }
        };
        
        // Save user to users list
        saveNewUser(newUser);
        
        // Set as current user
        state.user = newUser;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.isNewUser = false;
        state.error = null;
        
        // Save to localStorage
        saveUserToStorage(newUser);
        
      } catch (error) {
        state.error = error.message || 'Registration failed';
        state.isLoading = false;
      }
    },
    
    // Login user
    loginUser: (state, action) => {
      const { username, password } = action.payload;
      state.isLoading = true;
      state.error = null;
      
      try {
        const user = authenticateUser(username, password);
        
        if (user) {
          state.user = user;
          state.isAuthenticated = true;
          state.isLoading = false;
          state.isNewUser = false;
          state.error = null;
          
          // Save to localStorage
          saveUserToStorage(user);
        } else {
          state.error = 'Invalid username or password';
          state.isLoading = false;
        }
      } catch (error) {
        state.error = 'Login failed';
        state.isLoading = false;
      }
    },
    
    // Logout user
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = null;
      state.isNewUser = false;
      
      // Remove from localStorage
      removeUserFromStorage();
    },
    
    // Update user profile
    updateUserProfile: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        saveUserToStorage(state.user);
      }
    },
    
    // Update game progress
    updateGameProgress: (state, action) => {
      if (state.user) {
        state.user.gameProgress = { ...state.user.gameProgress, ...action.payload };
        saveUserToStorage(state.user);
      }
    },
    
    // Reset new user flag
    resetNewUserFlag: (state) => {
      state.isNewUser = false;
    }
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  checkNewUser,
  registerUser,
  loginUser,
  logoutUser,
  updateUserProfile,
  updateGameProgress,
  resetNewUserFlag,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;
export const selectIsNewUser = (state) => state.auth.isNewUser;

export default authSlice.reducer;
