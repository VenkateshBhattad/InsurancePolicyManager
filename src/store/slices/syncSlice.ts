/**
 * Sync Redux Slice
 * Manages data synchronization with Google Sheets
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { SyncStatus, AppError } from '../../types';

interface SyncState {
  status: SyncStatus;
  loading: boolean;
  error: AppError | null;
}

const initialState: SyncState = {
  status: {
    lastSyncDate: null,
    isOnline: true,
    isSyncing: false,
    hasConflicts: false,
    pendingChanges: 0,
  },
  loading: false,
  error: null,
};

// Async thunks for sync operations
export const checkOnlineStatus = createAsyncThunk(
  'sync/checkOnlineStatus',
  async (_, { rejectWithValue }) => {
    try {
      // Simple network check
      const response = await fetch('https://www.google.com', {
        method: 'HEAD',
        mode: 'no-cors',
      });
      return true;
    } catch (error) {
      return false;
    }
  }
);

export const syncWithGoogleSheets = createAsyncThunk(
  'sync/syncWithGoogleSheets',
  async (_, { rejectWithValue, getState }) => {
    try {
      // This will be implemented when we create the Google Sheets service
      // For now, simulate sync process
      
      // Check if online
      const isOnline = await checkOnlineStatus();
      if (!isOnline) {
        throw new Error('No internet connection');
      }

      // Simulate sync delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Return sync result
      return {
        lastSyncDate: new Date().toISOString(),
        isOnline: true,
        isSyncing: false,
        hasConflicts: false,
        pendingChanges: 0,
      };
    } catch (error) {
      return rejectWithValue({
        code: 'SYNC_ERROR',
        message: 'Failed to sync with Google Sheets',
        details: error,
      });
    }
  }
);

export const uploadToGoogleSheets = createAsyncThunk(
  'sync/uploadToGoogleSheets',
  async (_, { rejectWithValue }) => {
    try {
      // This will upload local changes to Google Sheets
      // Implementation will be added in Google Sheets service
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        uploadedRecords: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue({
        code: 'UPLOAD_ERROR',
        message: 'Failed to upload to Google Sheets',
        details: error,
      });
    }
  }
);

export const downloadFromGoogleSheets = createAsyncThunk(
  'sync/downloadFromGoogleSheets',
  async (_, { rejectWithValue }) => {
    try {
      // This will download changes from Google Sheets
      // Implementation will be added in Google Sheets service
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      return {
        downloadedRecords: 0,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue({
        code: 'DOWNLOAD_ERROR',
        message: 'Failed to download from Google Sheets',
        details: error,
      });
    }
  }
);

export const resolveConflicts = createAsyncThunk(
  'sync/resolveConflicts',
  async (resolutions: Record<string, 'local' | 'remote'>, { rejectWithValue }) => {
    try {
      // Process conflict resolutions
      // Implementation will be added when conflict resolution is implemented
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        resolvedConflicts: Object.keys(resolutions).length,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue({
        code: 'RESOLVE_CONFLICTS_ERROR',
        message: 'Failed to resolve conflicts',
        details: error,
      });
    }
  }
);

// Create the slice
const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    setOnlineStatus: (state, action: PayloadAction<boolean>) => {
      state.status.isOnline = action.payload;
    },
    setSyncingStatus: (state, action: PayloadAction<boolean>) => {
      state.status.isSyncing = action.payload;
    },
    setPendingChanges: (state, action: PayloadAction<number>) => {
      state.status.pendingChanges = action.payload;
    },
    incrementPendingChanges: (state) => {
      state.status.pendingChanges += 1;
    },
    decrementPendingChanges: (state) => {
      if (state.status.pendingChanges > 0) {
        state.status.pendingChanges -= 1;
      }
    },
    setHasConflicts: (state, action: PayloadAction<boolean>) => {
      state.status.hasConflicts = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetSyncStatus: (state) => {
      state.status = initialState.status;
    },
  },
  extraReducers: (builder) => {
    // Check online status
    builder
      .addCase(checkOnlineStatus.fulfilled, (state, action) => {
        state.status.isOnline = action.payload;
      });

    // Sync with Google Sheets
    builder
      .addCase(syncWithGoogleSheets.pending, (state) => {
        state.loading = true;
        state.status.isSyncing = true;
        state.error = null;
      })
      .addCase(syncWithGoogleSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.status = action.payload;
      })
      .addCase(syncWithGoogleSheets.rejected, (state, action) => {
        state.loading = false;
        state.status.isSyncing = false;
        state.error = action.payload as AppError;
      });

    // Upload to Google Sheets
    builder
      .addCase(uploadToGoogleSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadToGoogleSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.status.lastSyncDate = action.payload.timestamp;
        state.status.pendingChanges = 0;
      })
      .addCase(uploadToGoogleSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Download from Google Sheets
    builder
      .addCase(downloadFromGoogleSheets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(downloadFromGoogleSheets.fulfilled, (state, action) => {
        state.loading = false;
        state.status.lastSyncDate = action.payload.timestamp;
      })
      .addCase(downloadFromGoogleSheets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Resolve conflicts
    builder
      .addCase(resolveConflicts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(resolveConflicts.fulfilled, (state, action) => {
        state.loading = false;
        state.status.hasConflicts = false;
        state.status.lastSyncDate = action.payload.timestamp;
      })
      .addCase(resolveConflicts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });
  },
});

// Export actions
export const {
  setOnlineStatus,
  setSyncingStatus,
  setPendingChanges,
  incrementPendingChanges,
  decrementPendingChanges,
  setHasConflicts,
  clearError,
  resetSyncStatus,
} = syncSlice.actions;

// Selectors
export const selectSyncStatus = (state: { sync: SyncState }) => state.sync.status;
export const selectSyncLoading = (state: { sync: SyncState }) => state.sync.loading;
export const selectSyncError = (state: { sync: SyncState }) => state.sync.error;
export const selectIsOnline = (state: { sync: SyncState }) => state.sync.status.isOnline;
export const selectIsSyncing = (state: { sync: SyncState }) => state.sync.status.isSyncing;
export const selectHasConflicts = (state: { sync: SyncState }) => state.sync.status.hasConflicts;
export const selectPendingChanges = (state: { sync: SyncState }) => state.sync.status.pendingChanges;
export const selectLastSyncDate = (state: { sync: SyncState }) => state.sync.status.lastSyncDate;

export default syncSlice.reducer;
