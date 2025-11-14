import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../service/ApiProxy';
import { Entertainment, EntertainmentFilters, EntertainmentListResponse } from '../types/Entertainment';
import { addBookmark, removeBookmark } from '../../Bookmarks/store/bookmarkSlice';
import { PaginatedResponse } from '../../types/pagination';

// Structure de l'état
export interface EntertainmentState {
  entertainments: Entertainment[];
  selectedEntertainment: Entertainment | null;
  loading: boolean;
  error: string | null;
  currentCityCode: string | null;
  // Pagination fields
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  // Filter fields
  filters: EntertainmentFilters;
}

// État initial
const initialState: EntertainmentState = {
  entertainments: [],
  selectedEntertainment: null,
  loading: false,
  error: null,
  currentCityCode: null,
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 10,
  filters: {
    page: 0,
    size: 10,
    sort: 'rating,desc'
  }
};

// API function to fetch entertainments
const getEntertainments = async (filters: EntertainmentFilters) => {
  const { page = 0, size = 10, city, type, minRating, maxRating, sort } = filters;
  let url = `/entertainments?page=${page}&size=${size}`;
  
  if (city) {
    url += `&city=${city}`;
  }
  
  if (type) {
    url += `&type=${type}`;
  }
  
  if (minRating !== undefined) {
    url += `&minRating=${minRating}`;
  }
  
  if (maxRating !== undefined) {
    url += `&maxRating=${maxRating}`;
  }
  
  if (sort) {
    url += `&sort=${sort}`;
  }
  
  try {
    const response = await api.get<PaginatedResponse<Entertainment>>(url);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch entertainments');
  }
};

// Fonction pour adapter les données de l'API au format Entertainment
const adaptApiData = (apiData: any): Entertainment => {
  // Check if it's the new API format
  if (apiData.code && apiData.spotType) {
    return {
      ...apiData,
      // Ensure pricings is an array (default to empty array if not present)
      pricings: apiData.pricings || [],
      // Add legacy fields for backward compatibility
      productCode: apiData.code,
      title: apiData.name,
      fullStars: Math.floor(apiData.rating || 0),
      hasHalfStar: ((apiData.rating || 0) % 1) >= 0.5,
    };
  }

  // Legacy format adapter
  return {
    saved: apiData.saved,
    id: apiData.productCode,
    code: apiData.productCode,
    name: apiData.title || 'Unknown Title',
    productCode: apiData.productCode,
    title: apiData.title || 'Unknown Title',
    description: apiData.description || '',
    location: apiData.location?.name || 'Morocco',
    images: apiData.images || [],
    city: apiData.city,
    type: 'OTHER',
    spotType: 'ACTIVITY',
    address: '',
    mapId: '',
    coordinates: '',
    startTime: '09:00',
    endTime: '18:00',
    phoneNumber: '',
    email: '',
    website: '',
    rating: apiData.reviews?.combinedAverageRating || 0,
    bookingRequired: 'RECOMMENDED',
    pricings: [], // New API format - empty array for legacy
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
    mapUrl: apiData.productUrl || '',
  };
};

export const fetchEntertainments = createAsyncThunk(
  'entertainment/fetchEntertainments',
  async (filters: EntertainmentFilters, { rejectWithValue }) => {
    try {
      const data = await getEntertainments(filters);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message || 'Failed to fetch entertainments');
    }
  }
);

// Thunk asynchrone pour récupérer un détail
export const fetchEntertainmentDetail = createAsyncThunk(
  'entertainment/fetchEntertainmentDetail',
  async (productCode: string, { rejectWithValue }) => {
    try {
      const response = await api.get<Entertainment>(`/products/${productCode}`);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      return adaptApiData(response.data);
    } catch (error: any) {
      console.error('API Error:', error);
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
        ent => ent.productCode !== action.payload && ent.code !== action.payload
      );
      const selectedCode = state.selectedEntertainment?.productCode || state.selectedEntertainment?.code;
      if (selectedCode === action.payload) {
        state.selectedEntertainment = null;
      }
    },
    setFilters: (state, action: PayloadAction<EntertainmentFilters>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
      state.filters.page = action.payload;
    },
    resetFilters: (state) => {
      state.filters = {
        page: 0,
        size: 10,
        sort: 'rating,desc'
      };
      state.currentPage = 0;
    },
    updateEntertainmentImage: (state, action: PayloadAction<{ id: string; url: string }>) => {
      // Find by id (same pattern as Monument - uses id from Redux)
      const entertainment = state.entertainments.find(e => e.id === action.payload.id);
      if (entertainment) {
        if (!entertainment.images) {
          entertainment.images = [];
        }
        // Set first image if array is empty, otherwise update first image (same as Monument)
        if (entertainment.images.length === 0) {
          entertainment.images.push(action.payload.url);
        } else {
          entertainment.images[0] = action.payload.url;
        }
      }
      // Also update selected entertainment if it matches (same pattern as Monument)
      if (state.selectedEntertainment && state.selectedEntertainment.id === action.payload.id) {
        if (!state.selectedEntertainment.images) {
          state.selectedEntertainment.images = [];
        }
        if (state.selectedEntertainment.images.length === 0) {
          state.selectedEntertainment.images.push(action.payload.url);
        } else {
          state.selectedEntertainment.images[0] = action.payload.url;
        }
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
      .addCase(fetchEntertainments.fulfilled, (state, action: PayloadAction<PaginatedResponse<Entertainment>>) => {
        state.loading = false;
        state.error = null;
        // Adapt each entertainment item
        state.entertainments = action.payload.content.map(item => adaptApiData(item));
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageSize = action.payload.size;
      })
      .addCase(fetchEntertainments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch entertainments';
        console.error('Reducer Error:', action.payload);
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
        const entertainmentCode = action.meta.arg.productCode || action.meta.arg.code;
        const entertainment = state.entertainments.find(
          e => e.productCode === entertainmentCode || e.code === entertainmentCode
        );
        if (entertainment) {
          entertainment.saved = !entertainment.saved;
        }
        
        // Also update selected entertainment if it exists
        const selectedCode = state.selectedEntertainment?.productCode || state.selectedEntertainment?.code;
        if (selectedCode === entertainmentCode) {
          state.selectedEntertainment!.saved = !state.selectedEntertainment!.saved;
        }
      })
      .addCase(toggleEntertainmentBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleEntertainmentBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const entertainmentCode = action.meta.arg.productCode || action.meta.arg.code;
        const entertainment = state.entertainments.find(
          e => e.productCode === entertainmentCode || e.code === entertainmentCode
        );
        if (entertainment) {
          entertainment.saved = !entertainment.saved;
        }
        
        // Also revert selected entertainment if it exists
        const selectedCode = state.selectedEntertainment?.productCode || state.selectedEntertainment?.code;
        if (selectedCode === entertainmentCode) {
          state.selectedEntertainment!.saved = !state.selectedEntertainment!.saved;
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

export const { 
  setSelectedEntertainment, 
  clearError, 
  removeEntertainment,
  setFilters,
  setPage,
  resetFilters,
  updateEntertainmentImage
} = entertainmentSlice.actions;
export default entertainmentSlice.reducer;