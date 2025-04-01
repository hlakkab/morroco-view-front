import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../service';
import { Artisan, ArtisanType } from '../types/Artisan';
import { addBookmark, removeBookmark } from './bookmarkSlice';

// Define the state interface
interface ArtisanState {
  artisans: Artisan[];
  selectedArtisan: Artisan | null;
  loading: boolean;
  error: string | null;
  filteredArtisans: Artisan[];
  selectedType: ArtisanType | 'All';
}

// Initial state
const initialState: ArtisanState = {
  artisans: [],
  selectedArtisan: null,
  loading: false,
  error: null,
  filteredArtisans: [],
  selectedType: 'All',
};

// Async thunk for fetching artisans
export const fetchArtisans = createAsyncThunk(
  'artisan/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/spots/artisans');
      return response.data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message || 'An unknown error occurred');
    }
  }
);

// Async thunk for toggling an artisan bookmark
export const toggleArtisanBookmark = createAsyncThunk(
  'artisan/toggleBookmark',
  async (artisan: Artisan, { dispatch }) => {
    console.log('toggleArtisanBookmark', artisan.id);
    try {
  
      
      if (artisan.saved) {
        dispatch(removeBookmark(artisan.id));
      } else {
        dispatch(addBookmark({elementId: artisan.id, type: 'ARTISAN'}));
      }
      return artisan.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle bookmark');
    }
  }
);

// Create the slice
const artisanSlice = createSlice({
  name: 'artisan',
  initialState,
  reducers: {
    setSelectedArtisan: (state, action: PayloadAction<Artisan | null>) => {
      state.selectedArtisan = action.payload;
    },
    setSelectedType: (state, action: PayloadAction<ArtisanType | 'All'>) => {
      state.selectedType = action.payload;
      
      // Filter artisans based on type
      if (action.payload === 'All') {
        state.filteredArtisans = state.artisans;
      } else {
        state.filteredArtisans = state.artisans.filter(
          artisan => artisan.type === action.payload
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchArtisans
      .addCase(fetchArtisans.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtisans.fulfilled, (state, action: PayloadAction<Artisan[]>) => {
        state.loading = false;
        state.error = null;
        state.artisans = action.payload;
        state.filteredArtisans = action.payload;
      })
      .addCase(fetchArtisans.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
        console.error('Reducer Error:', action.payload);
      })

      // Handle toggleArtisanBookmark
      .addCase(toggleArtisanBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately
        const artisanId = action.meta.arg.id;
        const artisan = state.artisans.find(m => m.id === artisanId);
        if (artisan) {
          artisan.saved = !artisan.saved;
        }
        // update the selected artisan
        state.selectedArtisan = state.selectedArtisan
          ? { ...state.selectedArtisan, saved: !state.selectedArtisan.saved }
          : null;
      })
      .addCase(toggleArtisanBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleArtisanBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const artisanId = action.meta.arg.id;
        const artisan = state.artisans.find(m => m.id === artisanId);
        if (artisan) {
          artisan.saved = !artisan.saved;
        }
        // update the selected artisan
        state.selectedArtisan = state.selectedArtisan
          ? { ...state.selectedArtisan, saved: !state.selectedArtisan.saved }
          : null;
      });
  },
});

// Export actions and reducer
export const { setSelectedType, setSelectedArtisan } = artisanSlice.actions;
export default artisanSlice.reducer; 