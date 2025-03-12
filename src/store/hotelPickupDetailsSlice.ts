import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HotelPickupDetails, HotelPickupDetailsState } from '../types/transport';
import { api } from '../service';

// API functions
const getPickupDetails = async (id: string) => {
  try {
    const response = await api.get<HotelPickupDetails>(`/pickup/${id}`);
    console.log('API Response:', response);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch pickup details');
  }
};

interface BookPickupPayload {
  pickupId: string;
  pickupDate: string;
  pickupTime: string;
  hotelLocation: string;
}

const bookPickup = async (payload: BookPickupPayload) => {
  try {
    const response = await api.post(`/pickup/${payload.pickupId}/book`, {
      date: payload.pickupDate + ' ' + payload.pickupTime,
    });
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to book pickup');
  }
};

const initialState: HotelPickupDetailsState = {
  currentPickup: null,
  loading: false,
  error: null,
  bookingStatus: 'idle',
  bookingError: null,
};

// Async thunks
export const fetchPickupDetails = createAsyncThunk(
  'hotelPickup/fetchDetails',
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await getPickupDetails(id);
      console.log('Fetched Details:', data);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const bookPickupReservation = createAsyncThunk(
  'hotelPickup/bookReservation',
  async (payload: BookPickupPayload, { rejectWithValue }) => {
    try {
      const data = await bookPickup(payload);
      return data;
    } catch (error: any) {
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
    resetBookingStatus: (state) => {
      state.bookingStatus = 'idle';
      state.bookingError = null;
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
        console.error('Reducer Error:', action.payload);
      })

      .addCase(bookPickupReservation.pending, (state) => {
        state.bookingStatus = 'loading';
        state.bookingError = null;
      })
      .addCase(bookPickupReservation.fulfilled, (state) => {
        state.bookingStatus = 'succeeded';
        state.bookingError = null;
      })
      .addCase(bookPickupReservation.rejected, (state, action) => {
        state.bookingStatus = 'failed';
        state.bookingError = action.payload as string;
      });
  },
});

export const { clearPickupDetails, resetBookingStatus } = hotelPickupDetailsSlice.actions;
export default hotelPickupDetailsSlice.reducer; 