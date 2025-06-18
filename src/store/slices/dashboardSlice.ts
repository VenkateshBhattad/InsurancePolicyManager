/**
 * Dashboard Redux Slice
 * Manages dashboard statistics and overview data
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DashboardStats, Policy, PolicyStatus, AppError } from '../../types';
import databaseService from '../../services/database';
import { addDays, isAfter, isBefore, parseISO } from 'date-fns';

interface DashboardState {
  stats: DashboardStats;
  upcomingRenewals: Policy[];
  recentPolicies: Policy[];
  loading: boolean;
  error: AppError | null;
  lastUpdated: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalPolicies: 0,
    activePolicies: 0,
    expiredPolicies: 0,
    upcomingRenewals: 0,
    totalClients: 0,
    totalPremiumValue: 0,
  },
  upcomingRenewals: [],
  recentPolicies: [],
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk to fetch dashboard data
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchDashboardData',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch all data needed for dashboard
      const [policies, clients] = await Promise.all([
        databaseService.getAllPolicies(),
        databaseService.getAllClients(),
      ]);

      // Calculate statistics
      const now = new Date();
      const thirtyDaysFromNow = addDays(now, 30);

      const activePolicies = policies.filter(p => p.status === PolicyStatus.ACTIVE);
      const expiredPolicies = policies.filter(p => p.status === PolicyStatus.EXPIRED);
      
      // Find upcoming renewals (policies expiring in next 30 days)
      const upcomingRenewals = activePolicies.filter(policy => {
        const endDate = parseISO(policy.endDate);
        return isAfter(endDate, now) && isBefore(endDate, thirtyDaysFromNow);
      });

      // Get recent policies (last 10 created)
      const recentPolicies = [...policies]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

      // Calculate total premium value
      const totalPremiumValue = activePolicies.reduce(
        (sum, policy) => sum + policy.premiumAmount,
        0
      );

      const stats: DashboardStats = {
        totalPolicies: policies.length,
        activePolicies: activePolicies.length,
        expiredPolicies: expiredPolicies.length,
        upcomingRenewals: upcomingRenewals.length,
        totalClients: clients.length,
        totalPremiumValue,
      };

      return {
        stats,
        upcomingRenewals,
        recentPolicies,
      };
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_DASHBOARD_ERROR',
        message: 'Failed to fetch dashboard data',
        details: error,
      });
    }
  }
);

// Async thunk to fetch upcoming renewals with custom date range
export const fetchUpcomingRenewals = createAsyncThunk(
  'dashboard/fetchUpcomingRenewals',
  async (daysAhead: number = 30, { rejectWithValue }) => {
    try {
      const policies = await databaseService.getAllPolicies();
      const now = new Date();
      const targetDate = addDays(now, daysAhead);

      const upcomingRenewals = policies
        .filter(policy => {
          if (policy.status !== PolicyStatus.ACTIVE) return false;
          const endDate = parseISO(policy.endDate);
          return isAfter(endDate, now) && isBefore(endDate, targetDate);
        })
        .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime());

      return upcomingRenewals;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_RENEWALS_ERROR',
        message: 'Failed to fetch upcoming renewals',
        details: error,
      });
    }
  }
);

// Create the slice
const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateStats: (state, action: PayloadAction<Partial<DashboardStats>>) => {
      state.stats = { ...state.stats, ...action.payload };
    },
    setLastUpdated: (state) => {
      state.lastUpdated = new Date().toISOString();
    },
  },
  extraReducers: (builder) => {
    // Fetch dashboard data
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload.stats;
        state.upcomingRenewals = action.payload.upcomingRenewals;
        state.recentPolicies = action.payload.recentPolicies;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Fetch upcoming renewals
    builder
      .addCase(fetchUpcomingRenewals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUpcomingRenewals.fulfilled, (state, action) => {
        state.loading = false;
        state.upcomingRenewals = action.payload;
        state.stats.upcomingRenewals = action.payload.length;
      })
      .addCase(fetchUpcomingRenewals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });
  },
});

// Export actions
export const { clearError, updateStats, setLastUpdated } = dashboardSlice.actions;

// Selectors
export const selectDashboardStats = (state: { dashboard: DashboardState }) => state.dashboard.stats;
export const selectUpcomingRenewals = (state: { dashboard: DashboardState }) => state.dashboard.upcomingRenewals;
export const selectRecentPolicies = (state: { dashboard: DashboardState }) => state.dashboard.recentPolicies;
export const selectDashboardLoading = (state: { dashboard: DashboardState }) => state.dashboard.loading;
export const selectDashboardError = (state: { dashboard: DashboardState }) => state.dashboard.error;
export const selectLastUpdated = (state: { dashboard: DashboardState }) => state.dashboard.lastUpdated;

// Computed selectors
export const selectRenewalsByPeriod = (state: { dashboard: DashboardState }) => {
  const renewals = state.dashboard.upcomingRenewals;
  const now = new Date();
  
  return {
    next7Days: renewals.filter(policy => {
      const endDate = parseISO(policy.endDate);
      return isBefore(endDate, addDays(now, 7));
    }),
    next15Days: renewals.filter(policy => {
      const endDate = parseISO(policy.endDate);
      return isBefore(endDate, addDays(now, 15));
    }),
    next30Days: renewals.filter(policy => {
      const endDate = parseISO(policy.endDate);
      return isBefore(endDate, addDays(now, 30));
    }),
  };
};

export const selectPolicyTypeDistribution = (state: { dashboard: DashboardState }) => {
  const policies = state.dashboard.recentPolicies;
  const distribution: Record<string, number> = {};
  
  policies.forEach(policy => {
    distribution[policy.policyType] = (distribution[policy.policyType] || 0) + 1;
  });
  
  return distribution;
};

export default dashboardSlice.reducer;
