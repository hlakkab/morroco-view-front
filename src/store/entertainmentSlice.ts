import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Entertainment } from '../types/Entertainment';
import ViatorService from '../service/ViatorService';

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

// Fonction pour adapter les données de l'API au format Entertainment
const adaptApiData = (apiData: any): Entertainment => ({
  id: apiData.productCode,
  productCode: apiData.productCode,
  title: apiData.title,
  description: apiData.description || '',
  location: 'Morocco', // Valeur par défaut
  images: apiData.images || [],
  pricing: apiData.pricing,
  reviews: apiData.reviews,
  fullStars: Math.floor(apiData.reviews.combinedAverageRating),
  hasHalfStar: (apiData.reviews.combinedAverageRating % 1) >= 0.5,
  mapUrl: undefined
});

// Async thunks
export const fetchEntertainments = createAsyncThunk(
  'entertainment/fetchEntertainments',
  async () => {
    const response = await ViatorService.listEntertainments();
    return response.map(adaptApiData);
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
      });
  },
});

export const { setSelectedEntertainment, clearError } = entertainmentSlice.actions;
export default entertainmentSlice.reducer; 