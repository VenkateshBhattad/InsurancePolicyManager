/**
 * Notifications Redux Slice
 * Manages notification state and scheduling
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { NotificationData, ReminderType, AppError } from '../../types';
import * as Notifications from 'expo-notifications';

interface NotificationsState {
  notifications: NotificationData[];
  loading: boolean;
  error: AppError | null;
  permissionGranted: boolean;
  scheduledNotifications: string[]; // notification IDs
}

const initialState: NotificationsState = {
  notifications: [],
  loading: false,
  error: null,
  permissionGranted: false,
  scheduledNotifications: [],
};

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Async thunks for notification operations
export const requestNotificationPermissions = createAsyncThunk(
  'notifications/requestPermissions',
  async (_, { rejectWithValue }) => {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      
      if (finalStatus !== 'granted') {
        throw new Error('Notification permissions not granted');
      }
      
      return true;
    } catch (error) {
      return rejectWithValue({
        code: 'PERMISSION_ERROR',
        message: 'Failed to get notification permissions',
        details: error,
      });
    }
  }
);

export const scheduleRenewalReminder = createAsyncThunk(
  'notifications/scheduleRenewalReminder',
  async (
    {
      policyId,
      policyNumber,
      clientName,
      endDate,
      reminderType,
    }: {
      policyId: string;
      policyNumber: string;
      clientName: string;
      endDate: string;
      reminderType: ReminderType;
    },
    { rejectWithValue }
  ) => {
    try {
      const endDateTime = new Date(endDate);
      const now = new Date();
      
      // Calculate reminder date based on type
      let reminderDate: Date;
      switch (reminderType) {
        case ReminderType.SEVEN_DAYS:
          reminderDate = new Date(endDateTime.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case ReminderType.FIFTEEN_DAYS:
          reminderDate = new Date(endDateTime.getTime() - 15 * 24 * 60 * 60 * 1000);
          break;
        case ReminderType.THIRTY_DAYS:
          reminderDate = new Date(endDateTime.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case ReminderType.SIXTY_DAYS:
          reminderDate = new Date(endDateTime.getTime() - 60 * 24 * 60 * 60 * 1000);
          break;
        case ReminderType.NINETY_DAYS:
          reminderDate = new Date(endDateTime.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          reminderDate = new Date(endDateTime.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      
      // Don't schedule if reminder date is in the past
      if (reminderDate <= now) {
        return null;
      }
      
      const notificationId = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Policy Renewal Reminder',
          body: `Policy ${policyNumber} for ${clientName} expires soon`,
          data: {
            type: 'renewal_reminder',
            policyId,
            policyNumber,
            clientName,
          },
        },
        trigger: {
          date: reminderDate,
        },
      });
      
      return {
        notificationId,
        policyId,
        reminderType,
        scheduledDate: reminderDate.toISOString(),
      };
    } catch (error) {
      return rejectWithValue({
        code: 'SCHEDULE_NOTIFICATION_ERROR',
        message: 'Failed to schedule renewal reminder',
        details: error,
      });
    }
  }
);

export const cancelNotification = createAsyncThunk(
  'notifications/cancelNotification',
  async (notificationId: string, { rejectWithValue }) => {
    try {
      await Notifications.cancelScheduledNotificationAsync(notificationId);
      return notificationId;
    } catch (error) {
      return rejectWithValue({
        code: 'CANCEL_NOTIFICATION_ERROR',
        message: 'Failed to cancel notification',
        details: error,
      });
    }
  }
);

export const cancelAllNotifications = createAsyncThunk(
  'notifications/cancelAllNotifications',
  async (_, { rejectWithValue }) => {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      return true;
    } catch (error) {
      return rejectWithValue({
        code: 'CANCEL_ALL_NOTIFICATIONS_ERROR',
        message: 'Failed to cancel all notifications',
        details: error,
      });
    }
  }
);

export const getScheduledNotifications = createAsyncThunk(
  'notifications/getScheduledNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      return scheduledNotifications.map(notification => notification.identifier);
    } catch (error) {
      return rejectWithValue({
        code: 'GET_NOTIFICATIONS_ERROR',
        message: 'Failed to get scheduled notifications',
        details: error,
      });
    }
  }
);

// Create the slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    addNotification: (state, action: PayloadAction<NotificationData>) => {
      state.notifications.unshift(action.payload);
    },
    removeNotification: (state, action: PayloadAction<string>) => {
      state.notifications = state.notifications.filter(
        notification => notification.data?.id !== action.payload
      );
    },
    clearNotifications: (state) => {
      state.notifications = [];
    },
    markNotificationAsRead: (state, action: PayloadAction<string>) => {
      const notification = state.notifications.find(
        n => n.data?.id === action.payload
      );
      if (notification) {
        notification.data = { ...notification.data, read: true };
      }
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Request permissions
    builder
      .addCase(requestNotificationPermissions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(requestNotificationPermissions.fulfilled, (state, action) => {
        state.loading = false;
        state.permissionGranted = action.payload;
      })
      .addCase(requestNotificationPermissions.rejected, (state, action) => {
        state.loading = false;
        state.permissionGranted = false;
        state.error = action.payload as AppError;
      });

    // Schedule renewal reminder
    builder
      .addCase(scheduleRenewalReminder.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(scheduleRenewalReminder.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.scheduledNotifications.push(action.payload.notificationId);
        }
      })
      .addCase(scheduleRenewalReminder.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Cancel notification
    builder
      .addCase(cancelNotification.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelNotification.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledNotifications = state.scheduledNotifications.filter(
          id => id !== action.payload
        );
      })
      .addCase(cancelNotification.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Cancel all notifications
    builder
      .addCase(cancelAllNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAllNotifications.fulfilled, (state) => {
        state.loading = false;
        state.scheduledNotifications = [];
      })
      .addCase(cancelAllNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Get scheduled notifications
    builder
      .addCase(getScheduledNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getScheduledNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.scheduledNotifications = action.payload;
      })
      .addCase(getScheduledNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });
  },
});

// Export actions
export const {
  addNotification,
  removeNotification,
  clearNotifications,
  markNotificationAsRead,
  clearError,
} = notificationsSlice.actions;

// Selectors
export const selectNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.notifications;
export const selectNotificationsLoading = (state: { notifications: NotificationsState }) => 
  state.notifications.loading;
export const selectNotificationsError = (state: { notifications: NotificationsState }) => 
  state.notifications.error;
export const selectPermissionGranted = (state: { notifications: NotificationsState }) => 
  state.notifications.permissionGranted;
export const selectScheduledNotifications = (state: { notifications: NotificationsState }) => 
  state.notifications.scheduledNotifications;

export default notificationsSlice.reducer;
