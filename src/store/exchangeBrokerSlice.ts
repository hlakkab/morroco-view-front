import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import api from '../service/ApiProxy';
import { Broker, ExchangeBrokerState } from '../types/exchange-broker';
import { removeBookmark } from './bookmarkSlice';

// API functions
const getAllExchangeBrokers = async (city?: string) => {
  try {
    const endpoint = city ? `/exchanges?city=${city}` : '/exchanges';
    const response = await api.get<Broker[]>(endpoint);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    // Ensure the response is an array
    if (!Array.isArray(response.data)) {
      console.error('Invalid response format:', response.data);
      throw new Error('Invalid response format from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch exchange brokers');
  }
};

// Define the state interface


// Initial state
const initialState: ExchangeBrokerState = {
  brokers: [],
  loading: false,
  error: null,
  locations: ['All Locations'],
  selectedLocation: 'All Locations',
};

// Async thunk for fetching brokers
export const fetchBrokers = createAsyncThunk(
  'exchangeBroker/fetchAll',
  async (city: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const data = await getAllExchangeBrokers(city);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleBrokerBookmark = createAsyncThunk(
  'exchangeBroker/toggleBookmark',
  async (broker: Broker, { dispatch }) => {
    if (broker.saved) {
      await dispatch(removeBookmark(broker.id)).unwrap();
    } else {
      await api.post(`/exchanges/${broker.id}/add-bookmark`);
    }
    return broker.id;
  }
);

// Create the slice
const exchangeBrokerSlice = createSlice({
  name: 'exchangeBroker',
  initialState,
  reducers: {
    setSelectedLocation: (state, action: PayloadAction<string>) => {
      state.selectedLocation = action.payload;
    },
    toggleSaveBroker: (state, action: PayloadAction<string>) => {
      const broker = state.brokers.find(b => b.id === action.payload);
      if (broker) {
        broker.saved = !broker.saved;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchBrokers
      .addCase(fetchBrokers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBrokers.fulfilled, (state, action: PayloadAction<Broker[]>) => {
        state.loading = false;
        state.error = null;
        state.brokers = action.payload;
      })
      .addCase(fetchBrokers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
        console.error('Reducer Error:', action.payload); // Error log
      })
      
      // Handle toggleBrokerBookmark
      .addCase(toggleBrokerBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately
        const broker = state.brokers.find(b => b.id === action.meta.arg.id)!;
        broker.saved = !broker.saved;
      })
      .addCase(toggleBrokerBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleBrokerBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const brokerId = action.meta.arg.id;
        const broker = state.brokers.find(b => b.id === brokerId)!;
        broker.saved = !broker.saved;
        state.error = action.error.message || 'Failed to toggle bookmark';
      });
  },
});

// Export actions and reducer
export const { setSelectedLocation, toggleSaveBroker } = exchangeBrokerSlice.actions;
export default exchangeBrokerSlice.reducer; 