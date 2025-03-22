import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../service/ApiProxy';
import { Restaurant, RestaurantType } from '../types/Restaurant';
import { addBookmark, removeBookmark } from './bookmarkSlice';
import { RootState } from './store';

// Define the state interface
interface RestaurantState {
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  loading: boolean;
  error: string | null;
  selectedType: RestaurantType | 'All';
}

// Initial state
const initialState: RestaurantState = {
  restaurants: [],
  selectedRestaurant: null,
  loading: false,
  error: null,
  selectedType: 'All',
};

// API function
const getRestaurants = async (type?: RestaurantType) => {
  const url = '/spots/restaurants' + (type ? `?type=${type}` : '');
  try {
    const response = await api.get<Restaurant[]>(url);
    
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
    throw new Error(error.message || 'Failed to fetch restaurants');
  }
};

export const setSelectedType = createAsyncThunk (
  'restaurant/setSelectedType',
  async (type: RestaurantType | 'All', { dispatch, getState }) => {

    const state = getState() as RootState;
    
      // Filter restaurants based on type
      if (type === 'All') {
        dispatch(fetchRestaurants());
      } else {
        dispatch(fetchRestaurants(type));
      }
      
      return type;
    },
)

// Async thunk for fetching restaurants
export const fetchRestaurants = createAsyncThunk(
  'restaurant/fetchAll',
  async (type: RestaurantType | undefined, { rejectWithValue }) => {
    try {
      const data = await getRestaurants(type);
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
    console.log('toggleRestaurantBookmark', restaurant.id);
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
      .addCase(fetchRestaurants.fulfilled, (state, action: PayloadAction<Restaurant[]>) => {
        state.loading = false;
        state.error = null;
        state.restaurants = action.payload;
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