/**
 * Clients Redux Slice
 * Manages client data state and operations
 */

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Client, ClientFilters, AppError } from '../../types';
import databaseService from '../../services/database';

interface ClientsState {
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: AppError | null;
  filters: ClientFilters;
  searchQuery: string;
}

const initialState: ClientsState = {
  clients: [],
  selectedClient: null,
  loading: false,
  error: null,
  filters: {},
  searchQuery: '',
};

// Async thunks for client operations
export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const clients = await databaseService.getAllClients();
      return clients;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_CLIENTS_ERROR',
        message: 'Failed to fetch clients',
        details: error,
      });
    }
  }
);

export const fetchClientById = createAsyncThunk(
  'clients/fetchClientById',
  async (clientId: string, { rejectWithValue }) => {
    try {
      const client = await databaseService.getClient(clientId);
      if (!client) {
        throw new Error('Client not found');
      }
      return client;
    } catch (error) {
      return rejectWithValue({
        code: 'FETCH_CLIENT_ERROR',
        message: 'Failed to fetch client',
        details: error,
      });
    }
  }
);

export const createClient = createAsyncThunk(
  'clients/createClient',
  async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const clientId = await databaseService.createClient(clientData);
      const newClient = await databaseService.getClient(clientId);
      if (!newClient) {
        throw new Error('Failed to retrieve created client');
      }
      return newClient;
    } catch (error) {
      return rejectWithValue({
        code: 'CREATE_CLIENT_ERROR',
        message: 'Failed to create client',
        details: error,
      });
    }
  }
);

export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async (
    { clientId, updates }: { clientId: string; updates: Partial<Client> },
    { rejectWithValue }
  ) => {
    try {
      await databaseService.updateClient(clientId, {
        ...updates,
        updatedAt: new Date().toISOString(),
      });
      const updatedClient = await databaseService.getClient(clientId);
      if (!updatedClient) {
        throw new Error('Failed to retrieve updated client');
      }
      return updatedClient;
    } catch (error) {
      return rejectWithValue({
        code: 'UPDATE_CLIENT_ERROR',
        message: 'Failed to update client',
        details: error,
      });
    }
  }
);

export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (clientId: string, { rejectWithValue }) => {
    try {
      await databaseService.deleteClient(clientId);
      return clientId;
    } catch (error) {
      return rejectWithValue({
        code: 'DELETE_CLIENT_ERROR',
        message: 'Failed to delete client',
        details: error,
      });
    }
  }
);

// Create the slice
const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setSelectedClient: (state, action: PayloadAction<Client | null>) => {
      state.selectedClient = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<ClientFilters>) => {
      state.filters = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearClients: (state) => {
      state.clients = [];
      state.selectedClient = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch clients
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Fetch client by ID
    builder
      .addCase(fetchClientById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClient = action.payload;
      })
      .addCase(fetchClientById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Create client
    builder
      .addCase(createClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients.push(action.payload);
        state.selectedClient = action.payload;
      })
      .addCase(createClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Update client
    builder
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clients.findIndex(client => client.id === action.payload.id);
        if (index !== -1) {
          state.clients[index] = action.payload;
        }
        if (state.selectedClient?.id === action.payload.id) {
          state.selectedClient = action.payload;
        }
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });

    // Delete client
    builder
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.clients = state.clients.filter(client => client.id !== action.payload);
        if (state.selectedClient?.id === action.payload) {
          state.selectedClient = null;
        }
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as AppError;
      });
  },
});

// Export actions
export const {
  setSelectedClient,
  setSearchQuery,
  setFilters,
  clearError,
  clearClients,
} = clientsSlice.actions;

// Selectors
export const selectAllClients = (state: { clients: ClientsState }) => state.clients.clients;
export const selectSelectedClient = (state: { clients: ClientsState }) => state.clients.selectedClient;
export const selectClientsLoading = (state: { clients: ClientsState }) => state.clients.loading;
export const selectClientsError = (state: { clients: ClientsState }) => state.clients.error;
export const selectClientsSearchQuery = (state: { clients: ClientsState }) => state.clients.searchQuery;
export const selectClientsFilters = (state: { clients: ClientsState }) => state.clients.filters;

// Filtered clients selector
export const selectFilteredClients = (state: { clients: ClientsState }) => {
  const { clients, searchQuery, filters } = state.clients;
  
  return clients.filter(client => {
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
      const matchesSearch = 
        fullName.includes(query) ||
        client.email.toLowerCase().includes(query) ||
        client.phone.includes(query);
      
      if (!matchesSearch) return false;
    }

    // Additional filters can be added here
    // For example: filters.hasActivePolicies

    return true;
  });
};

export default clientsSlice.reducer;
