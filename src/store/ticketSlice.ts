import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../service';
import { Ticket } from '../types/ticket';
import { Match } from '../types/match';
import { HotelPickup } from '../types/transport';

// Define the state structure
export interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'ticket/fetchTickets',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'ticket/fetchTicketById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch ticket');
    }
  }
);

// Create the slice
const ticketSlice = createSlice({
  name: 'ticket',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action) => {
        state.loading = false;
        state.tickets = action.payload;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch tickets';
      })
      
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loading = false;
        // Update the ticket in the tickets array if it exists, otherwise add it
        const index = state.tickets.findIndex(ticket => ticket.id === action.payload.id);
        if (index !== -1) {
          state.tickets[index] = action.payload;
        } else {
          state.tickets.push(action.payload);
        }
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch ticket';
      })
  },
});

export const { clearError } = ticketSlice.actions;
export default ticketSlice.reducer; 