import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../service';
import { Match, Team } from '../types/match';
import { removeBookmark } from './bookmarkSlice';

// Define the state structure
export interface MatchState {
  matches: Match[];
  selectedMatch: Match | null;
  currentMatch: Match | null;
  loading: boolean;
  error: string | null;
  ticketPurchaseStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
  ticketPurchaseError: string | null;
}

// Initial state
const initialState: MatchState = {
  matches: [],
  selectedMatch: null,
  currentMatch: null,
  loading: false,
  error: null,
  ticketPurchaseStatus: 'idle',
  ticketPurchaseError: null,
};

// Async thunks
export const fetchMatches = createAsyncThunk(
  'match/fetchMatches',
  async () => {
    const response = await api.get('/events/206dc661-ff98-4934-b396-1a873cea2ad7/matches');
    return response.data;
  }
);

export const fetchMatchById = createAsyncThunk(
  'match/fetchMatchById',
  async (id: string) => {
    const response = await api.get(`/matches/${id}`);
    return response.data;
  }
);

// New async thunk for buying tickets
export const buyTicket = createAsyncThunk(
  'match/buyTicket',
  async (matchId: string, { rejectWithValue }) => {
    try {
      const response = await api.post(`/matches/${matchId}/buy`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to purchase ticket');
    }
  }
);

// New async thunk for saving a match as a bookmark
export const saveMatchBookmark = createAsyncThunk(
  'match/saveBookmark',
  async (matchId: string) => {
    const response = await api.post(`/matches/${matchId}/add-bookmark`);
    return response.data;
  }
);

// New async thunk for toggling a match bookmark (save or remove)
export const toggleMatchBookmark = createAsyncThunk(
  'match/toggleBookmark',
  async (match: Match, { dispatch, getState }) => {

    if (match.saved) {
      await dispatch(removeBookmark(match.id)).unwrap();
    } else {
      await dispatch(saveMatchBookmark(match.id)).unwrap();
    }

    return match.id;
  }
);

// Create the slice
const matchSlice = createSlice({
  name: 'match',
  initialState,
  reducers: {
    setSelectedMatch: (state, action: PayloadAction<Match | null>) => {
      state.selectedMatch = action.payload;
    },
    setCurrentMatch: (state, action: PayloadAction<Match | null>) => {
      state.currentMatch = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetTicketPurchaseStatus: (state) => {
      state.ticketPurchaseStatus = 'idle';
      state.ticketPurchaseError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all matches
      .addCase(fetchMatches.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatches.fulfilled, (state, action) => {
        state.loading = false;
        state.matches = action.payload;
      })
      .addCase(fetchMatches.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch matches';
      })
      
      // Fetch match by ID
      .addCase(fetchMatchById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMatchById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedMatch = action.payload;
      })
      .addCase(fetchMatchById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch match';
      })
      
      // Buy ticket
      .addCase(buyTicket.pending, (state) => {
        state.ticketPurchaseStatus = 'loading';
        state.ticketPurchaseError = null;
      })
      .addCase(buyTicket.fulfilled, (state) => {
        state.ticketPurchaseStatus = 'succeeded';
      })
      .addCase(buyTicket.rejected, (state, action) => {
        state.ticketPurchaseStatus = 'failed';
        state.ticketPurchaseError = action.payload as string || 'Failed to purchase ticket';
      })
      
      // Toggle match bookmark
      .addCase(toggleMatchBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately

        const currentMatch = state.currentMatch; 
        if (currentMatch) {
          currentMatch.saved = !currentMatch.saved;
        }
        
        const matchId = action.meta.arg.id;
        const match = state.matches.find(m => m.id === matchId)!;

        match.saved = !match.saved;
      })
      .addCase(toggleMatchBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleMatchBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const matchId = action.meta.arg.id;
        const matches = state.matches.find(m => m.id === matchId)!;
        matches.saved = !matches.saved;
        state.error = action.error.message || 'Failed to toggle bookmark';

        const currentMatch = state.currentMatch; 
        if (currentMatch) {
          currentMatch.saved = !currentMatch.saved;
        }
      })
  },
});

export const { setSelectedMatch, setCurrentMatch, clearError, resetTicketPurchaseStatus } = matchSlice.actions;
export default matchSlice.reducer; 