import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../service/ApiProxy';
import { Monument, MonumentType } from '../types/Monument';
import { addBookmark, removeBookmark } from './bookmarkSlice';

// Define the state interface
interface MonumentState {
  monuments: Monument[];
  selectedMonument: Monument | null;
  loading: boolean;
  error: string | null;
  filteredMonuments: Monument[];
  selectedType: MonumentType | 'All';
}

// Initial state
const initialState: MonumentState = {
  monuments: [],
  selectedMonument: null,
  loading: false,
  error: null,
  filteredMonuments: [],
  selectedType: 'All',
};

// API function
const getMonuments = async () => {
  try {
    const response = await api.get<Monument[]>('/spots/monuments');
    
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
    throw new Error(error.message || 'Failed to fetch monuments');
  }
};

// Async thunk for fetching monuments
export const fetchMonuments = createAsyncThunk(
  'monument/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const data = await getMonuments();
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
      
      // Filter monuments based on type
      if (action.payload === 'All') {
        state.filteredMonuments = state.monuments;
      } else {
        state.filteredMonuments = state.monuments.filter(
          monument => monument.type === action.payload
        );
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchMonuments
      .addCase(fetchMonuments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMonuments.fulfilled, (state, action: PayloadAction<Monument[]>) => {
        state.loading = false;
        state.error = null;
        state.monuments = action.payload;
        state.filteredMonuments = action.payload;
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