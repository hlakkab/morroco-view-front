import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { HotelPickup, HotelPickupState } from '../types/transport';
import { api } from '../service';
import { BookmarkState } from '../types/bookmark';
import { removeBookmark } from './bookmarkSlice';
import { RootState } from './store';

// API functions
const getAllHotelPickups = async (city?: string) => {
  try {
    const endpoint = city ? `/pickups?city=${city}` : '/pickups';
    const response = await api.get<HotelPickup[]>(endpoint);
    
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
  pickupDirection: 'a2h', // Default to airport to hotel
};

// Async thunks for API operations
export const fetchHotelPickups = createAsyncThunk(
  'hotelPickup/fetchAll',
  async (city: string, { rejectWithValue }) => {
    try {
      const data = await getAllHotelPickups(city);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleHotelPickupBookmark = createAsyncThunk(
  'hotelPickup/toggleBookmark',
  async (pickup: HotelPickup, { dispatch, getState }) => {
    if (pickup.saved) {
      await dispatch(removeBookmark(pickup.id)).unwrap();
    } else {
      await dispatch(bookmarkPickup(pickup.id)).unwrap();
    }

    return pickup.id;
  }
);

export const bookmarkPickup = createAsyncThunk(
  'hotelPickup/addBookmark',
  async (id: string) => {
    const response = await api.post(`/pickups/${id}/add-bookmark`);
    return response.data;
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
    togglePickupDirection: (state) => {
      console.log('Toggling pickup direction from:', state.pickupDirection);
      state.pickupDirection = state.pickupDirection === 'a2h' ? 'h2a' : 'a2h';
      console.log('New pickup direction:', state.pickupDirection);
      // Swap cities when direction changes
      const temp = state.selectedCity;
      state.selectedCity = state.selectedCity;
      state.selectedCity = temp;
      console.log('Cities swapped - From:', state.selectedCity, 'To:', state.selectedCity);
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
        state.hotelPickups = action.payload;
      })
      .addCase(fetchHotelPickups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        console.error('Reducer Error:', action.payload); // Error log
      })

      // Handle toggleHotelPickupBookmark
      .addCase(toggleHotelPickupBookmark.pending, (state, action) => {
        
        state.error = null;
        
        // Optimistic update - toggle the saved flag immediately
        const pickup = state.hotelPickups.find(p => p.id === action.meta.arg.id)!;
        pickup.saved = !pickup.saved;
        
      })
      .addCase(toggleHotelPickupBookmark.fulfilled, (state, action) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleHotelPickupBookmark.rejected, (state, action) => {
        // Optimistic update - toggle the saved flag immediately
        const pickup = state.hotelPickups.find(p => p.id === action.meta.arg.id)!;
        pickup.saved = !pickup.saved;
        state.loading = false;
        state.error = action.payload as string;
        console.error('Reducer Error:', action.payload); // Error log
      });
  },
});

export const { 
  setSelectedCity, 
  setSearchQuery,
  togglePickupDirection 
} = hotelPickupSlice.actions;
export default hotelPickupSlice.reducer; 