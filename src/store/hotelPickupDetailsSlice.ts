import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HotelPickupDetails, HotelPickupDetailsState } from '../types/transport';
import { api } from '../service';

// API function
const getPickupDetails = async (id: string) => {
  try {
    const response = await api.get<HotelPickupDetails>(`/pickup/${id}`);
    console.log('API Response:', response); // Debug log
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch pickup details');
  }
};

const initialState: HotelPickupDetailsState = {
  currentPickup: null,
  loading: false,
  error: null,
};

// Async thunk for fetching pickup details
export const fetchPickupDetails = createAsyncThunk(
  'hotelPickup/fetchDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await getPickupDetails(id);
      console.log('Fetched Details:', data); // Debug log
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

const hotelPickupDetailsSlice = createSlice({
  name: 'hotelPickupDetails',
  initialState,
  reducers: {
    clearPickupDetails: (state) => {
      state.currentPickup = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPickupDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPickupDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.error = null;
        state.currentPickup = action.payload;
      })
      .addCase(fetchPickupDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Reducer Error:', action.payload); // Error log
      });
  },
});

export const { clearPickupDetails } = hotelPickupDetailsSlice.actions;
export default hotelPickupDetailsSlice.reducer; 