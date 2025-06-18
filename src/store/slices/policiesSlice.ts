/**
 * Policies Redux Slice
 * Manages policy data state and operations
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Policy, PolicyFilters, PolicyStatus, PolicyType, AppError } from '../../types';
import databaseService from '../../services/database';

interface PoliciesState {
  policies: Policy[];
  selectedPolicy: Policy | null;
  loading: boolean;
  error: AppError | null;
  filters: PolicyFilters;
  searchQuery: string;
}

const initialState: PoliciesState = {
  policies: [],
  selectedPolicy: null,
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
};

// Async thunks for policy operations
export const fetchPolicies = createAsyncThunk(
  'policies/fetchPolicies',
  async (_, { rejectWithValue }) => {
    try {
      const policies = await databaseService.getAllPolicies();
      return policies;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_POLICIES_ERROR',
        message: 'Failed to fetch policies',
        details: error,
      });
    }
  }
);

export const fetchPolicyById = createAsyncThunk(
  'policies/fetchPolicyById',
  async (policyId: string, { rejectWithValue }) => {
    try {
      const policy = await databaseService.getPolicy(policyId);
      if (!policy) {
        throw new Error('Policy not found');
      }
      return policy;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_POLICY_ERROR',
        message: 'Failed to fetch policy',
        details: error,
      });
    }
  }
);

export const fetchPoliciesByClient = createAsyncThunk(
  'policies/fetchPoliciesByClient',
  async (clientId: string, { rejectWithValue }) => {
    try {
      const policies = await databaseService.getPoliciesByClient(clientId);
      return policies;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_CLIENT_POLICIES_ERROR',
        message: 'Failed to fetch client policies',
        details: error,
      });
    }
  }
);

export const createPolicy = createAsyncThunk(
  'policies/createPolicy',
  async (policyData: Omit<Policy, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const policyId = await databaseService.createPolicy(policyData);
      const newPolicy = await databaseService.getPolicy(policyId);
      if (!newPolicy) {
        throw new Error('Failed to retrieve created policy');
      }
      return newPolicy;
    } catch (error) {
      return rejectWithValue({
        code: 'CREATE_POLICY_ERROR',
        message: 'Failed to create policy',
        details: error,
      });
    }
  }
);

export const updatePolicy = createAsyncThunk(
  'policies/updatePolicy',
  async (
    { policyId, updates }: { policyId: string; updates: Partial<Policy> },
    { rejectWithValue }
  ) => {
    try {
      await databaseService.updatePolicy(policyId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      const updatedPolicy = await databaseService.getPolicy(policyId);
      if (!updatedPolicy) {
        throw new Error('Failed to retrieve updated policy');
      }
      return updatedPolicy;
    } catch (error) {
      return rejectWithValue({
        code: 'UPDATE_POLICY_ERROR',
        message: 'Failed to update policy',
        details: error,
      });
    }
  }
);

export const deletePolicy = createAsyncThunk(
  'policies/deletePolicy',
  async (policyId: string, { rejectWithValue }) => {
    try {
      await databaseService.deletePolicy(policyId);
      return policyId;
    } catch (error) {
      return rejectWithValue({
        code: 'DELETE_POLICY_ERROR',
        message: 'Failed to delete policy',
        details: error,
      });
    }
  }
);

// Create the slice
const policiesSlice = createSlice({
  name: 'policies',
  initialState,
  reducers: {
    setSelectedPolicy: (state, action: PayloadAction<Policy | null>) => {
      state.selectedPolicy = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<PolicyFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearPolicies: (state) => {
      state.policies = [];
      state.selectedPolicy = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch policies
    builder
      .addCase(fetchPolicies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicies.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = action.payload;
      })
      .addCase(fetchPolicies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Fetch policy by ID
    builder
      .addCase(fetchPolicyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPolicyById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedPolicy = action.payload;
      })
      .addCase(fetchPolicyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Fetch policies by client
    builder
      .addCase(fetchPoliciesByClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPoliciesByClient.fulfilled, (state, action) => {
        state.loading = false;
        // Update policies for this client in the main array
        const clientPolicies = action.payload;
        const otherPolicies = state.policies.filter(
          policy => !clientPolicies.some(cp => cp.id === policy.id)
        );
        state.policies = [...otherPolicies, ...clientPolicies];
      })
      .addCase(fetchPoliciesByClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Create policy
    builder
      .addCase(createPolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies.push(action.payload);
        state.selectedPolicy = action.payload;
      })
      .addCase(createPolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Update policy
    builder
      .addCase(updatePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePolicy.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.policies.findIndex(policy => policy.id === action.payload.id);
        if (index !== -1) {
          state.policies[index] = action.payload;
        }
        if (state.selectedPolicy?.id === action.payload.id) {
          state.selectedPolicy = action.payload;
        }
      })
      .addCase(updatePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Delete policy
    builder
      .addCase(deletePolicy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deletePolicy.fulfilled, (state, action) => {
        state.loading = false;
        state.policies = state.policies.filter(policy => policy.id !== action.payload);
        if (state.selectedPolicy?.id === action.payload) {
          state.selectedPolicy = null;
        }
      })
      .addCase(deletePolicy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });
  },
});

// Export actions
export const {
  setSelectedPolicy,
  setSearchQuery,
  setFilters,
  clearError,
  clearPolicies,
} = policiesSlice.actions;

// Selectors
export const selectAllPolicies = (state: { policies: PoliciesState }) => state.policies.policies;
export const selectSelectedPolicy = (state: { policies: PoliciesState }) => state.policies.selectedPolicy;
export const selectPoliciesLoading = (state: { policies: PoliciesState }) => state.policies.loading;
export const selectPoliciesError = (state: { policies: PoliciesState }) => state.policies.error;
export const selectPoliciesSearchQuery = (state: { policies: PoliciesState }) => state.policies.searchQuery;
export const selectPoliciesFilters = (state: { policies: PoliciesState }) => state.policies.filters;

// Filtered policies selector
export const selectFilteredPolicies = (state: { policies: PoliciesState }) => {
  const { policies, searchQuery, filters } = state.policies;
  
  return policies.filter(policy => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        policy.policyNumber.toLowerCase().includes(query) ||
        policy.insuranceCompany.toLowerCase().includes(query) ||
        policy.agentNotes?.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0) {
      if (!filters.status.includes(policy.status)) return false;
    }

    // Type filter
    if (filters.type && filters.type.length > 0) {
      if (!filters.type.includes(policy.policyType)) return false;
    }

    // Client filter
    if (filters.clientId) {
      if (policy.clientId !== filters.clientId) return false;
    }

    // Date range filter
    if (filters.dateRange) {
      const policyEndDate = new Date(policy.endDate);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (policyEndDate < startDate || policyEndDate > endDate) return false;
    }

    return true;
  });
};

export default policiesSlice.reducer;
