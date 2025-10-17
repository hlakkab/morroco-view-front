import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../service/ApiProxy';
import { Restaurant, RestaurantType } from '../types/Restaurant';
import { addBookmark, removeBookmark } from '../../Bookmarks/store/bookmarkSlice';
import { RootState } from '../../store/store';
import { PaginatedResponse, PaginationParams } from '../../types/pagination';

// Define the state interface
interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  selectedType: RestaurantType | 'All';
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
}

// Initial state
const initialState: RestaurantState = {
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
  selectedType: 'All',
  currentPage: 0,
  totalPages: 0,
  totalElements: 0,
  pageSize: 5,
};

// API function
const getRestaurants = async (params: PaginationParams & { type?: RestaurantType; city?: string }) => {
  const { page, size, type, city } = params;
  let url = `/spots/restaurants?page=${page}&size=${size}`;
  
  if (type) {
    url += `&type=${type}`;
  }
  
  if (city && city !== 'all') {
    url += `&city=${city}`;
  }
  
  try {
    const response = await api.get<PaginatedResponse<Restaurant>>(url);
    
    if (!response.data) {
      throw new Error('No data received from server');
    }
    
    return response.data;
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(error.message || 'Failed to fetch restaurants');
  }
};

export const setSelectedType = createAsyncThunk (
  'restaurant/setSelectedType',
  async (type: RestaurantType | 'All', { dispatch, getState }) => {
    const state = getState() as RootState;
    
    // Fetch restaurants with the new type filter, reset to page 0
    dispatch(fetchRestaurants({ 
      page: 0, 
      size: state.restaurant.pageSize,
      type: type === 'All' ? undefined : type 
    }));
    
    return type;
  },
)

// Async thunk for fetching restaurants
export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchAll',
  async (params: { page: number; size: number; type?: RestaurantType; city?: string }, { rejectWithValue }) => {
    try {
      const data = await getRestaurants(params);
      return data;
    } catch (error: any) {
      console.error('Thunk Error:', error);
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for toggling a restaurant bookmark
export const toggleRestaurantBookmark = createAsyncThunk(
  'restaurant/toggleBookmark',
  
  async (restaurant: Restaurant, { dispatch }) => {
    try {
      if (restaurant.saved) {
        dispatch(removeBookmark(restaurant.id));
      } else {
        dispatch(addBookmark({elementId: restaurant.id, type: 'RESTAURANT'}));
      }
      return restaurant.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to toggle bookmark');
    }
  }
);

// Create the slice
const restaurantSlice = createSlice({
  name: 'restaurant',
  initialState,
  reducers: {
    setSelectedRestaurant: (state, action: PayloadAction<Restaurant | null>) => {
      state.selectedRestaurant = action.payload;
    },
    
  },
  extraReducers: (builder) => {
    builder
      // Handle fetchRestaurants
      .addCase(fetchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRestaurants.fulfilled, (state, action: PayloadAction<PaginatedResponse<Restaurant>>) => {
        state.loading = false;
        state.error = null;
        state.restaurants = action.payload.content;
        state.currentPage = action.payload.number;
        state.totalPages = action.payload.totalPages;
        state.totalElements = action.payload.totalElements;
        state.pageSize = action.payload.size;
      })
      .addCase(fetchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Unknown error occurred';
        console.error('Reducer Error:', action.payload);
      })

      // Handle setSelectedType
      .addCase(setSelectedType.fulfilled, (state, action) => {
        state.selectedType = action.payload;
      })

      // Handle toggleRestaurantBookmark
      .addCase(toggleRestaurantBookmark.pending, (state, action) => {
        state.error = null;
        // Optimistic update - toggle the saved flag immediately
        const restaurantId = action.meta.arg.id;
        const restaurant = state.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
          restaurant.saved = !restaurant.saved;
        }
        // update the selected restaurant
        state.selectedRestaurant = state.selectedRestaurant
          ? { ...state.selectedRestaurant, saved: !state.selectedRestaurant.saved }
          : null;
      })
      .addCase(toggleRestaurantBookmark.fulfilled, (state) => {
        // No need to toggle again since we already did it in pending
      })
      .addCase(toggleRestaurantBookmark.rejected, (state, action) => {
        // Revert the optimistic update if the action fails
        const restaurantId = action.meta.arg.id;
        const restaurant = state.restaurants.find(r => r.id === restaurantId);
        if (restaurant) {
          restaurant.saved = !restaurant.saved;
        }
        // update the selected restaurant
        state.selectedRestaurant = state.selectedRestaurant
          ? { ...state.selectedRestaurant, saved: !state.selectedRestaurant.saved }
          : null;
      });
  },
});

// Export actions and reducer
export const { setSelectedRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer; 