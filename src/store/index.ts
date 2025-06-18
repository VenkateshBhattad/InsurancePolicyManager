/**
 * Redux Store Configuration
 * Centralized state management for the Insurance Policy Manager app
 */

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Import slices
import clientsSlice from './slices/clientsSlice';
import policiesSlice from './slices/policiesSlice';
import dashboardSlice from './slices/dashboardSlice';
import settingsSlice from './slices/settingsSlice';
import syncSlice from './slices/syncSlice';
import notificationsSlice from './slices/notificationsSlice';

// Configure the store
export const store = configureStore({
  reducer: {
    clients: clientsSlice,
    policies: policiesSlice,
    dashboard: dashboardSlice,
    settings: settingsSlice,
    sync: syncSlice,
    notifications: notificationsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types for serializable check
        ignoredActions: [
          'persist/PERSIST',
          'persist/REHYDRATE',
          'persist/PAUSE',
          'persist/PURGE',
          'persist/REGISTER',
        ],
        // Ignore these field paths in all actions
        ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
        // Ignore these paths in the state
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: __DEV__,
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Use throughout your app instead of plain `useDispatch` and `useSelector`
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
