import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HotelPickup, HotelPickupState } from '../types/transport';
import { api } from '../service';

// API functions
const getAllHotelPickups = async () => {
  try {
    const response = await api.get<HotelPickup[]>('/pickup');
    
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
    throw new Error(error.message || 'Failed to fetch hotel pickups');
  }
};

const initialState: HotelPickupState = {
  hotelPickups: [],
  loading: false,
  error: null,
  selectedCity: 'Marrakech',
  searchQuery: '',
};

// Async thunks for API operations
export const fetchHotelPickups = createAsyncThunk(
  'hotelPickup/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getAllHotelPickups();
      console.log('Fetched Data:', data); // Debug log
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const hotelPickupSlice = createSlice({
  name: 'hotelPickup',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchHotelPickups
      .addCase(fetchHotelPickups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotelPickups.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        console.log('Reducer Response:', action.payload); // Debug log
        state.hotelPickups = action.payload;
      })
      .addCase(fetchHotelPickups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Reducer Error:', action.payload); // Error log
      })
  },
});

export const { setSelectedCity, setSearchQuery } = hotelPickupSlice.actions;
export default hotelPickupSlice.reducer; 