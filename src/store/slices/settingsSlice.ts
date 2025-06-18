/**
 * Settings Redux Slice
 * Manages app settings and preferences
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AppSettings, ReminderType, AppError } from '../../types';
import * as SecureStore from 'expo-secure-store';

interface SettingsState {
  settings: AppSettings;
  loading: boolean;
  error: AppError | null;
}

const defaultSettings: AppSettings = {
  notificationsEnabled: true,
  reminderIntervals: [ReminderType.SEVEN_DAYS, ReminderType.THIRTY_DAYS],
  autoSyncEnabled: true,
  darkModeEnabled: false,
  biometricAuthEnabled: false,
  googleSheetsConnected: false,
};

const initialState: SettingsState = {
  settings: defaultSettings,
  loading: false,
  error: null,
};

// Async thunks for settings operations
export const loadSettings = createAsyncThunk(
  'settings/loadSettings',
  async (_, { rejectWithValue }) => {
    try {
      const settingsJson = await SecureStore.getItemAsync('app_settings');
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        return { ...defaultSettings, ...settings };
      }
      return defaultSettings;
    } catch (error) {
      return rejectWithValue({
        code: 'LOAD_SETTINGS_ERROR',
        message: 'Failed to load settings',
        details: error,
      });
    }
  }
);

export const saveSettings = createAsyncThunk(
  'settings/saveSettings',
  async (settings: AppSettings, { rejectWithValue }) => {
    try {
      await SecureStore.setItemAsync('app_settings', JSON.stringify(settings));
      return settings;
    } catch (error) {
      return rejectWithValue({
        code: 'SAVE_SETTINGS_ERROR',
        message: 'Failed to save settings',
        details: error,
      });
    }
  }
);

export const updateSetting = createAsyncThunk(
  'settings/updateSetting',
  async (
    { key, value }: { key: keyof AppSettings; value: any },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as { settings: SettingsState };
      const updatedSettings = {
        ...state.settings.settings,
        [key]: value,
      };
      
      await SecureStore.setItemAsync('app_settings', JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      return rejectWithValue({
        code: 'UPDATE_SETTING_ERROR',
        message: 'Failed to update setting',
        details: error,
      });
    }
  }
);

export const resetSettings = createAsyncThunk(
  'settings/resetSettings',
  async (_, { rejectWithValue }) => {
    try {
      await SecureStore.deleteItemAsync('app_settings');
      return defaultSettings;
    } catch (error) {
      return rejectWithValue({
        code: 'RESET_SETTINGS_ERROR',
        message: 'Failed to reset settings',
        details: error,
      });
    }
  }
);

// Create the slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    toggleNotifications: (state) => {
      state.settings.notificationsEnabled = !state.settings.notificationsEnabled;
    },
    toggleAutoSync: (state) => {
      state.settings.autoSyncEnabled = !state.settings.autoSyncEnabled;
    },
    toggleDarkMode: (state) => {
      state.settings.darkModeEnabled = !state.settings.darkModeEnabled;
    },
    toggleBiometricAuth: (state) => {
      state.settings.biometricAuthEnabled = !state.settings.biometricAuthEnabled;
    },
    setGoogleSheetsConnected: (state, action: PayloadAction<boolean>) => {
      state.settings.googleSheetsConnected = action.payload;
    },
    updateReminderIntervals: (state, action: PayloadAction<ReminderType[]>) => {
      state.settings.reminderIntervals = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Load settings
    builder
      .addCase(loadSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(loadSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Save settings
    builder
      .addCase(saveSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(saveSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Update setting
    builder
      .addCase(updateSetting.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSetting.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(updateSetting.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Reset settings
    builder
      .addCase(resetSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resetSettings.fulfilled, (state, action) => {
        state.loading = false;
        state.settings = action.payload;
      })
      .addCase(resetSettings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });
  },
});

// Export actions
export const {
  clearError,
  toggleNotifications,
  toggleAutoSync,
  toggleDarkMode,
  toggleBiometricAuth,
  setGoogleSheetsConnected,
  updateReminderIntervals,
} = settingsSlice.actions;

// Selectors
export const selectSettings = (state: { settings: SettingsState }) => state.settings.settings;
export const selectSettingsLoading = (state: { settings: SettingsState }) => state.settings.loading;
export const selectSettingsError = (state: { settings: SettingsState }) => state.settings.error;

// Individual setting selectors
export const selectNotificationsEnabled = (state: { settings: SettingsState }) => 
  state.settings.settings.notificationsEnabled;
export const selectAutoSyncEnabled = (state: { settings: SettingsState }) => 
  state.settings.settings.autoSyncEnabled;
export const selectDarkModeEnabled = (state: { settings: SettingsState }) => 
  state.settings.settings.darkModeEnabled;
export const selectBiometricAuthEnabled = (state: { settings: SettingsState }) => 
  state.settings.settings.biometricAuthEnabled;
export const selectGoogleSheetsConnected = (state: { settings: SettingsState }) => 
  state.settings.settings.googleSheetsConnected;
export const selectReminderIntervals = (state: { settings: SettingsState }) => 
  state.settings.settings.reminderIntervals;

export default settingsSlice.reducer;
