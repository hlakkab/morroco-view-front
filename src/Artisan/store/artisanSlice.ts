import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../../service';
import { Artisan, ArtisanType } from '../types/Artisan';
import { addBookmark, removeBookmark } from '../../Bookmarks/store/bookmarkSlice';
import { PaginatedResponse, PaginationParams } from '../../types/pagination';

// Define the state interface
interface ArtisanState {
  artisans: Artisan[];
  selectedArtisan: Artisan | null;
  loading: boolean;
  error: string | null;
  selectedType: ArtisanType | 'All';
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

// Initial state
const initialState: ArtisanState = {
  artisans: [],
  selectedArtisan: null,
  loading: false,
  error: null,
  selectedType: 'All',
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 5,
};

// API function
const getArtisans = async (params: PaginationParams & { type?: ArtisanType; city?: string }) => {
  const { page, size, type, city } = params;
  let url = `/spots/artisans?page=${page}&size=${size}`;
  
  if (type) {
    url += `&type=${type}`;
  }
  
  if (city && city !== 'all') {
    url += `&city=${city}`;
  }
  
  try {
    const response = await api.get<PaginatedResponse<Artisan>>(url);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch artisans');
  }
};

// Async thunk for fetching artisans
export const fetchArtisans = createAsyncThunk(
  'artisan/fetchAll',
  async (params: { page: number; size: number; type?: ArtisanType; city?: string }, { rejectWithValue }) => {
    try {
      const data = await getArtisans(params);
      return data;
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
    },
    updateArtisanImage: (state, action: PayloadAction<{ id: string; url: string }>) => {
      const artisan = state.artisans.find(a => a.id === action.payload.id);
      if (artisan) {
        if (!artisan.images) {
          artisan.images = [];
        }
        // Set first image if array is empty, otherwise update first image
        if (artisan.images.length === 0) {
          artisan.images.push(action.payload.url);
        } else {
          artisan.images[0] = action.payload.url;
        }
      }
      // Also update selected artisan if it matches
      if (state.selectedArtisan && state.selectedArtisan.id === action.payload.id) {
        if (!state.selectedArtisan.images) {
          state.selectedArtisan.images = [];
        }
        if (state.selectedArtisan.images.length === 0) {
          state.selectedArtisan.images.push(action.payload.url);
        } else {
          state.selectedArtisan.images[0] = action.payload.url;
        }
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
      .addCase(fetchArtisans.fulfilled, (state, action: PayloadAction<PaginatedResponse<Artisan>>) => {
        state.loading = false;
        state.error = null;
        state.artisans = action.payload.content;
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageSize = action.payload.size;
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
export const { setSelectedType, setSelectedArtisan, updateArtisanImage } = artisanSlice.actions;
export default artisanSlice.reducer; 