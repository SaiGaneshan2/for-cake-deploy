import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { firebaseAuth } from '../firebase';

// Initial state
const initialState = {
  user: null,
  profile: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

// Async thunks for authentication
export const registerTeacher = createAsyncThunk(
  'auth/registerTeacher',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user, error } = await firebaseAuth.signUpTeacher(email, password);
      if (error) throw error;
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const loginTeacher = createAsyncThunk(
  'auth/loginTeacher',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { user, error } = await firebaseAuth.signInTeacher(email, password);
      if (error) throw error;
      return user;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logoutTeacher = createAsyncThunk(
  'auth/logoutTeacher',
  async (_, { rejectWithValue }) => {
    try {
      const { error } = await firebaseAuth.signOut();
      if (error) throw error;
      return true;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTeacherProfile = createAsyncThunk(
  'auth/fetchTeacherProfile',
  async (userId, { rejectWithValue }) => {
    try {
      const { data, error } = await firebaseAuth.getTeacherProfile(userId);
      if (error) throw error;
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Create the auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
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

    // Reset auth state
    resetAuthState: (state) => {
      return initialState;
    },

    // Set user (for auth state changes)
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Register teacher
      .addCase(registerTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Login teacher
      .addCase(loginTeacher.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginTeacher.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      // Logout teacher
      .addCase(logoutTeacher.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logoutTeacher.fulfilled, (state) => {
        return initialState;
      })
      .addCase(logoutTeacher.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })

      // Fetch teacher profile
      .addCase(fetchTeacherProfile.fulfilled, (state, action) => {
        state.profile = action.payload;
      });
  },
});

// Export actions
export const {
  setLoading,
  setError,
  clearError,
  resetAuthState,
  setUser,
} = authSlice.actions;

// Export selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectProfile = (state) => state.auth.profile;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectError = (state) => state.auth.error;

export default authSlice.reducer;
