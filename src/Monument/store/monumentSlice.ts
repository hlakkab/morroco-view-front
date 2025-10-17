import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../service/ApiProxy';
import { Monument, MonumentType } from '../types/Monument';
import { addBookmark, removeBookmark } from '../../Bookmarks/store/bookmarkSlice';
import { PaginatedResponse, PaginationParams } from '../../types/pagination';

// Define the state interface
interface MonumentState {
  monuments: Monument[];
  selectedMonument: Monument | null;
  loading: boolean;
  error: string | null;
  selectedType: MonumentType | 'All';
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

// Initial state
const initialState: MonumentState = {
  monuments: [],
  selectedMonument: null,
  loading: false,
  error: null,
  selectedType: 'All',
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 6,
};

// API function
const getMonuments = async (params: PaginationParams & { type?: MonumentType; city?: string }) => {
  const { page, size, type, city } = params;
  let url = `/spots/monuments?page=${page}&size=${size}`;
  
  if (type) {
    url += `&type=${type}`;
  }
  
  if (city && city !== 'all') {
    url += `&city=${city}`;
  }
  
  try {
    const response = await api.get<PaginatedResponse<Monument>>(url);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch monuments');
  }
};

// Async thunk for fetching monuments
export const fetchMonuments = createAsyncThunk(
  'monument/fetchAll',
  async (params: { page: number; size: number; type?: MonumentType; city?: string }, { rejectWithValue }) => {
    try {
      const data = await getMonuments(params);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for toggling a monument bookmark
export const toggleMonumentBookmark = createAsyncThunk(
  'monument/toggleBookmark',
  
  async (monument: Monument, { dispatch }) => {
    try {
      if (monument.saved) {
        dispatch(removeBookmark(monument.id));
      } else {
        dispatch(addBookmark({elementId: monument.id, type: 'MONUMENT'}));
      }
      return monument.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle bookmark');
    }
  }
);

// Create the slice
const monumentSlice = createSlice({
  name: 'monument',
  initialState,
  reducers: {
    setSelectedMonument: (state, action: PayloadAction<Monument | null>) => {
      state.selectedMonument = action.payload;
    },
    setSelectedType: (state, action: PayloadAction<MonumentType | 'All'>) => {
      state.selectedType = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchMonuments
      .addCase(fetchMonuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonuments.fulfilled, (state, action: PayloadAction<PaginatedResponse<Monument>>) => {
        state.loading = false;
        state.error = null;
        state.monuments = action.payload.content;
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageSize = action.payload.size;
      })
      .addCase(fetchMonuments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
        console.error('Reducer Error:', action.payload);
      })

      // Handle toggleMonumentBookmark
      .addCase(toggleMonumentBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately
        const monumentId = action.meta.arg.id;
        const monument = state.monuments.find(m => m.id === monumentId);
        if (monument) {
          monument.saved = !monument.saved;
        }
        // update the selected monument
        state.selectedMonument = state.selectedMonument
          ? { ...state.selectedMonument, saved: !state.selectedMonument.saved }
          : null;
      })
      .addCase(toggleMonumentBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleMonumentBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const monumentId = action.meta.arg.id;
        const monument = state.monuments.find(m => m.id === monumentId);
        if (monument) {
          monument.saved = !monument.saved;
        }
        // update the selected monument
        state.selectedMonument = state.selectedMonument
          ? { ...state.selectedMonument, saved: !state.selectedMonument.saved }
          : null;
      });
  },
});

// Export actions and reducer
export const { setSelectedType, setSelectedMonument } = monumentSlice.actions;
export default monumentSlice.reducer; 