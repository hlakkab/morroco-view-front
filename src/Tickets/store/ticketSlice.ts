import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../service';
import { Ticket } from '../types/ticket';
import { Match } from '../../Match/types/match';
import { HotelPickup } from '../../Pickup/types/transport';
import { PaginatedResponse, PaginationParams } from '../../types/pagination';

// Define the state structure
export interface TicketState {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  selectedTicket: Ticket | null;
  loadingDetail: boolean;
  errorDetail: string | null;
  // Pagination fields
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

// Initial state
const initialState: TicketState = {
  tickets: [],
  loading: false,
  error: null,
  selectedTicket: null,
  loadingDetail: false,
  errorDetail: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
};

// Async thunks
export const fetchTickets = createAsyncThunk(
  'ticket/fetchTickets',
  async (params: PaginationParams | undefined, { rejectWithValue }) => {
    try {
      const { page = 0, size = 10, sort } = params || {};
      let url = `/tickets?page=${page}&size=${size}`;
      
      if (sort) {
        url += `&sort=${sort}`;
      }
      
      const response = await api.get<PaginatedResponse<Ticket>>(url);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tickets');
    }
  }
);

export const fetchTicketById = createAsyncThunk(
  'ticket/fetchTicketById',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Ticket>(`/tickets/${id}`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return response.data;
    } catch (error: any) {
      console.error('API Error:', error);
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
    clearDetailError: (state) => {
      state.errorDetail = null;
    },
    clearSelectedTicket: (state) => {
      state.selectedTicket = null;
      state.errorDetail = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all tickets
      .addCase(fetchTickets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTickets.fulfilled, (state, action: PayloadAction<PaginatedResponse<Ticket>>) => {
        state.loading = false;
        state.error = null;
        // Extract content array from paginated response
        state.tickets = action.payload.content || [];
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageSize = action.payload.size;
      })
      .addCase(fetchTickets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch tickets';
        console.error('Reducer Error:', action.payload);
      })
      
      // Fetch ticket by ID
      .addCase(fetchTicketById.pending, (state) => {
        state.loadingDetail = true;
        state.errorDetail = null;
      })
      .addCase(fetchTicketById.fulfilled, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = null;
        state.selectedTicket = action.payload;
        // Don't update the ticket in the tickets array - keep the original list structure
        // The card should use the original ticket from the list, not the detailed one
      })
      .addCase(fetchTicketById.rejected, (state, action) => {
        state.loadingDetail = false;
        state.errorDetail = action.payload as string || 'Failed to fetch ticket';
        console.error('Reducer Error:', action.payload);
      })
  },
});

export const { clearError, clearDetailError, clearSelectedTicket } = ticketSlice.actions;
export default ticketSlice.reducer; 