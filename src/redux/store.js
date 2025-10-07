// src/redux/store.js
import { configureStore } from '@reduxjs/toolkit';
import gameReducer, { gameMiddleware } from './gameSlice';
import authReducer from './firebaseAuthSlice';

export const store = configureStore({
  reducer: {
    game: gameReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(gameMiddleware),
});
