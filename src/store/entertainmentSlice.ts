import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Entertainment } from '../types/Entertainment';
import ViatorService from '../service/ViatorService';

// Structure de l'état
export interface EntertainmentState {
  entertainments: Entertainment[];
  selectedEntertainment: Entertainment | null;
  loading: boolean;
  error: string | null;
}

// État initial
const initialState: EntertainmentState = {
  entertainments: [],
  selectedEntertainment: null,
  loading: false,
  error: null,
};

// Fonction pour adapter les données de l'API au format Entertainment
const adaptApiData = (apiData: any): Entertainment => {
  // S'assurer que tous les champs nécessaires existent
  return {
    id: apiData.productCode,
    productCode: apiData.productCode,
    title: apiData.title || 'Unknown Title',
    description: apiData.description || '',
    location: apiData.location?.name || 'Morocco', // Si non fourni, valeur par défaut
    images: apiData.images || [],
    city: apiData.city ,
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

// Thunk asynchrone pour récupérer la liste
export const fetchEntertainments = createAsyncThunk(
  'entertainment/fetchEntertainments',
  async (_, { rejectWithValue }) => {
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
      });
  },
});

export const { setSelectedEntertainment, clearError } = entertainmentSlice.actions;
export default entertainmentSlice.reducer;