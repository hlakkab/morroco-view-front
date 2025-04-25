import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Entertainment } from '../types/Entertainment';
import ViatorService from '../service/ViatorService';
import { addBookmark, removeBookmark } from './bookmarkSlice';

// Structure de l'état
export interface EntertainmentState {
  entertainments: Entertainment[];
  selectedEntertainment: Entertainment | null;
  loading: boolean;
  error: string | null;
  currentCityCode: string | null;
}

// État initial
const initialState: EntertainmentState = {
  entertainments: [],
  selectedEntertainment: null,
  loading: false,
  error: null,
  currentCityCode: null
};

// Fonction pour adapter les données de l'API au format Entertainment
const adaptApiData = (apiData: any): Entertainment => {
  // S'assurer que tous les champs nécessaires existent
  return {
    saved: apiData.saved,
    id: apiData.productCode,
    productCode: apiData.productCode,
    title: apiData.title || 'Unknown Title',
    description: apiData.description || '',
    location: apiData.location?.name || 'Morocco', // Si non fourni, valeur par défaut
    images: apiData.images || [],
    city: apiData.city,
    pricing: apiData.pricing || { 
      summary: { 
        fromPrice: 0, 
        fromPriceBeforeDiscount: 0 
      } 
    },
    reviews: apiData.reviews || { 
      totalReviews: 0, 
      combinedAverageRating: 0 
    },
    fullStars: Math.floor(apiData.reviews?.combinedAverageRating || 0),
    hasHalfStar: ((apiData.reviews?.combinedAverageRating || 0) % 1) >= 0.5,
    mapUrl: apiData.productUrl || '', // ou tout autre champ pertinent
  };
};

export const fetchEntertainments = createAsyncThunk(
  'entertainment/fetchEntertainments',
  async (cityCode: string, { rejectWithValue }) => {
    try {
      const response = await ViatorService.listEntertainments();
      return response.map(adaptApiData);
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to fetch entertainments');
    }
  }
);

// Thunk asynchrone pour récupérer un détail
export const fetchEntertainmentDetail = createAsyncThunk(
  'entertainment/fetchEntertainmentDetail',
  async (productCode: string, { rejectWithValue }) => {
    try {
      const response = await ViatorService.getProductDetail(productCode);
      return adaptApiData(response);
    } catch (error: any) {
      return rejectWithValue(error.message || `Failed to fetch entertainment detail for ${productCode}`);
    }
  }
);

// Async thunk for toggling an entertainment bookmark
export const toggleEntertainmentBookmark = createAsyncThunk(
  'entertainment/toggleBookmark',
  async (entertainment: Entertainment, { dispatch }) => {
    try {
      if (entertainment.saved) {
        await dispatch(removeBookmark(entertainment.id!)).unwrap();
      } else {
        await dispatch(addBookmark({ elementId: entertainment.id! , type: 'ENTERTAINMENT' })).unwrap();
      }
      return entertainment.productCode;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle bookmark');
    }
  }
);

// Async thunk for deleting an entertainment
export const deleteEntertainment = createAsyncThunk(
  'entertainment/deleteEntertainment',
  async (productCode: string, { dispatch }) => {
    try {
      // First remove the bookmark if it exists
      await dispatch(removeBookmark(productCode)).unwrap();
      return productCode;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete entertainment');
    }
  }
);

// Slice Redux
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
    removeEntertainment: (state, action: PayloadAction<string>) => {
      state.entertainments = state.entertainments.filter(
        ent => ent.productCode !== action.payload
      );
      if (state.selectedEntertainment?.productCode === action.payload) {
        state.selectedEntertainment = null;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Cas pour fetchEntertainments
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
        state.error = action.payload as string || 'Failed to fetch entertainments';
      })
      
      // Cas pour fetchEntertainmentDetail
      .addCase(fetchEntertainmentDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEntertainmentDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedEntertainment = action.payload;
      })
      .addCase(fetchEntertainmentDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch entertainment detail';
      })
      
      // Toggle entertainment bookmark
      .addCase(toggleEntertainmentBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately
        const entertainmentId = action.meta.arg.productCode;
        const entertainment = state.entertainments.find(e => e.productCode === entertainmentId);
        if (entertainment) {
          entertainment.saved = !entertainment.saved;
        }
        
        // Also update selected entertainment if it exists
        if (state.selectedEntertainment?.productCode === entertainmentId) {
          state.selectedEntertainment.saved = !state.selectedEntertainment.saved;
        }
      })
      .addCase(toggleEntertainmentBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleEntertainmentBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const entertainmentId = action.meta.arg.productCode;
        const entertainment = state.entertainments.find(e => e.productCode === entertainmentId);
        if (entertainment) {
          entertainment.saved = !entertainment.saved;
        }
        
        // Also revert selected entertainment if it exists
        if (state.selectedEntertainment?.productCode === entertainmentId) {
          state.selectedEntertainment.saved = !state.selectedEntertainment.saved;
        }
        state.error = action.error.message || 'Failed to toggle bookmark';
      })
      .addCase(deleteEntertainment.fulfilled, (state, action) => {
        state.entertainments = state.entertainments.filter(
          ent => ent.productCode !== action.payload
        );
        if (state.selectedEntertainment?.productCode === action.payload) {
          state.selectedEntertainment = null;
        }
      });
  },
});

export const { setSelectedEntertainment, clearError, removeEntertainment } = entertainmentSlice.actions;
export default entertainmentSlice.reducer;