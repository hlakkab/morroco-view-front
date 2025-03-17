import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../service';
import ViatorService from '../service/ViatorService';

// Define the Entertainment type

interface Images {
  isCover: boolean;
  variants: {
    url: string;
    width: number;
    height: number;
  }[]
}

interface Reviews {
  totalReviews: number;
  combinedAverageRating: number;
}


export interface Entertainment {
  id?: string;
  productCode: string;
  title: string;
  description: string;
  images: Images[];
  reviews: Reviews;
  pricing: {
    summary: {
      fromPrice: number,
      fromPriceBeforeDiscount: number
    }
  }
}

// Define the state structure
export interface EntertainmentState {
  entertainments: Entertainment[];
  selectedEntertainment: Entertainment | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: EntertainmentState = {
  entertainments: [],
  selectedEntertainment: null,
  loading: false,
  error: null,
};

// Async thunks
export const fetchEntertainments = createAsyncThunk(
  'entertainment/fetchEntertainments',
  async () => {
    const response = await ViatorService.listEntertainments();
    return response;
  }
);



// Create the slice
const entertainmentSlice = createSlice({
  name: 'entertainment',
  initialState,
  reducers: {
    setSelectedEntertainment: (state, action: PayloadAction<Entertainment | null>) => {
      state.selectedEntertainment = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all entertainments
      .addCase(fetchEntertainments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntertainments.fulfilled, (state, action) => {
        state.loading = false;
        state.entertainments = action.payload;
      })
      .addCase(fetchEntertainments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch entertainments';
      })
      
      
      
  },
});

export const { setSelectedEntertainment, clearError } = entertainmentSlice.actions;
export default entertainmentSlice.reducer; 