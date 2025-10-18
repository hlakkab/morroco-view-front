import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getGuidesByCity } from '../data/mockGuides';
import api from '../service/ApiProxy';
import { Guide, GuideState } from '../types/guide';
import { removeBookmark } from './bookmarkSlice';

/**
 * MOCK DATA TOGGLE
 * 
 * Set to true: Uses sample data from src/data/mockGuides.ts
 * Set to false: Makes real API calls to /guides endpoint
 * 
 * Change this when your backend API is ready!
 */
const USE_MOCK_DATA = true;

// API functions
const getAllGuides = async (city?: string) => {
  // Use mock data for testing until backend is ready
  if (USE_MOCK_DATA) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return getGuidesByCity(city || '');
  }
  
  try {
    const endpoint = city ? `/guides?city=${city}` : '/guides';
    const response = await api.get<Guide[]>(endpoint);
    
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
    throw new Error(error.message || 'Failed to fetch guides');
  }
};

// Initial state
const initialState: GuideState = {
  guides: [],
  loading: false,
  error: null,
  selectedCity: 'Marrakech',
  searchQuery: '',
  reviews: {},
  availability: {},
};

// Async thunk for fetching guides
export const fetchGuides = createAsyncThunk(
  'guide/fetchAll',
  async (city: string | undefined = undefined, { rejectWithValue }) => {
    try {
      const data = await getAllGuides(city);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

export const toggleGuideBookmark = createAsyncThunk(
  'guide/toggleBookmark',
  async (guide: Guide, { dispatch }) => {
    // Use mock implementation for testing
    if (USE_MOCK_DATA) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      console.log(`${guide.saved ? 'Removing' : 'Adding'} bookmark for guide:`, guide.name);
      return guide.id;
    }
    
    if (guide.saved) {
      await dispatch(removeBookmark(guide.id)).unwrap();
    } else {
      await api.post(`/guides/${guide.id}/add-bookmark`);
    }
    return guide.id;
  }
);

// Create the slice
const guideSlice = createSlice({
  name: 'guide',
  initialState,
  reducers: {
    setSelectedCity: (state, action: PayloadAction<string>) => {
      state.selectedCity = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    toggleSaveGuide: (state, action: PayloadAction<string>) => {
      const guide = state.guides.find(g => g.id === action.payload);
      if (guide) {
        guide.saved = !guide.saved;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchGuides
      .addCase(fetchGuides.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGuides.fulfilled, (state, action: PayloadAction<Guide[]>) => {
        state.loading = false;
        state.error = null;
        state.guides = action.payload;
      })
      .addCase(fetchGuides.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
        console.error('Reducer Error:', action.payload);
      })
      
      // Handle toggleGuideBookmark
      .addCase(toggleGuideBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately
        const guide = state.guides.find(g => g.id === action.meta.arg.id);
        if (guide) {
          guide.saved = !guide.saved;
        }
      })
      .addCase(toggleGuideBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleGuideBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const guideId = action.meta.arg.id;
        const guide = state.guides.find(g => g.id === guideId);
        if (guide) {
          guide.saved = !guide.saved;
        }
        state.error = action.error.message || 'Failed to toggle bookmark';
      });
  },
});

// Export actions and reducer
export const { setSelectedCity, setSearchQuery, toggleSaveGuide } = guideSlice.actions;
export default guideSlice.reducer;

