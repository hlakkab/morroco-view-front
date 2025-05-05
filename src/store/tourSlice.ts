import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { api } from '../service';
import { Tour, TourSavedItem } from '../types/tour';
import { mapBookmarksToTourSavedItems } from '../utils/bookmarkMapper';
import { RootState } from './store';
// Define interfaces for tour items
export interface TourItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment' | 'monument' | 'money-exchange' | 'artisan';
  title: string;
  subtitle?: string;
  images?: string[];
  city: string;
  duration?: string;
  timeSlot?: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}

// Define the state structure
export interface TourState {
  currentTour: Tour;
  savedTours: Tour[];
  availableItems: TourSavedItem[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TourState = {
  currentTour: {
    id: '',
    title: '',
    imageUrl: '',
    city: '',
    duration: 0,
    startDate: '',
    endDate: '',
    destinations: [],
    isEditable: true,
    destinationCount: 0,
    from: '',
    to: '',
  },
  savedTours: [], 
  loading: false,
  availableItems: [],
  error: null,
};

// Async thunk to fetch bookmarks and convert to available items
export const fetchBookmarksAsItems = createAsyncThunk(
  'tour/fetchBookmarksAsItems',
  async ({ startDate, endDate }: { startDate?: string, endDate?: string } = {}, { dispatch, getState }) => {
    try {
      let datesFromParams = { startDate, endDate };
      
      // If dates weren't provided as parameters, try to get them from the store
      if (!startDate || !endDate) {
        const state = getState() as RootState;
        datesFromParams = {
          startDate: state.tour.currentTour.startDate,
          endDate: state.tour.currentTour.endDate
        };
      }
      
      console.log("Raw tour dates:", datesFromParams.startDate, datesFromParams.endDate);
      
      // Check if dates exist before formatting
      let queryParams = '';
      if (datesFromParams.startDate && datesFromParams.endDate) {
        // Make sure dates are in the correct format before processing
        // First, standardize the format by replacing both / and - with /
        const normalizedStartDate = datesFromParams.startDate.replace(/\//g, '-');
        const normalizedEndDate = datesFromParams.endDate.replace(/\//g, '-');
        
        console.log("Normalized dates:", normalizedStartDate, normalizedEndDate);
        
        try {
          // Format dates as YYYY-MM-DD
          const startDateObj = new Date(normalizedStartDate);
          const endDateObj = new Date(normalizedEndDate);
          
          const formattedStartDate = startDateObj.toISOString().slice(0, 19);
          const formattedEndDate = endDateObj.toISOString().slice(0, 19);
          
          console.log("Date objects:", startDateObj, endDateObj);
          console.log("Formatted dates:", formattedStartDate, formattedEndDate);
          
          if (formattedStartDate !== "Invalid Date" && formattedEndDate !== "Invalid Date") {
            queryParams = `?startDate=${formattedStartDate}&endDate=${formattedEndDate}`;
          }
        } catch (e) {
          console.error("Error formatting dates:", e);
        }
      }
      
      console.log("Final query params:", queryParams);
      const response = await api.get(`/bookmarks${queryParams}`);
      const bookmarks = response.data;
      
      // Map bookmarks to saved items format
      const savedItems = mapBookmarksToTourSavedItems(bookmarks);
      
      // Set these items as available items without type transformation
      dispatch(setAvailableItems(savedItems));
      
      return savedItems;
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      throw error;
    }
  }
);

// Async thunk to save a tour
export const saveTourThunk = createAsyncThunk(
  'tour/saveTourThunk',
  async (tourData: { 
    title: string; 
    from: string; 
    to: string; 
    destinations: TourSavedItem[] 
  }, { dispatch, getState }) => {
    try {
      // Optional: You can send the tour data to an API endpoint
      const response = await api.post('/tours', tourData);
      
      // After successfully saving to the backend, save to the local state
      dispatch(saveTour());
      
      return response.data;
    } catch (error) {
      console.error('Error saving tour:', error);
      throw error;
    }
  }
);

// Async thunk to fetch tours
export const fetchTours = createAsyncThunk(
  'tour/fetchTours',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/tours');
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch tours');
    }
  }
);

// Async thunk to fetch tour details by ID
export const fetchTourDetails = createAsyncThunk(
  'tour/fetchTourDetails',
  async (tourId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/tours/${tourId}`);
      
      return response.data;
    } catch (error) {
      return rejectWithValue('Failed to fetch tour details');
    }
  }
);

// Async thunk to delete a tour by ID
export const deleteTourThunk = createAsyncThunk(
  'tour/deleteTourThunk',
  async (tourId: string, { rejectWithValue }) => {
    try {
      // Call the API to delete the tour
      await api.delete(`/tours/${tourId}`);
      return tourId; // Return the ID of the deleted tour
    } catch (error) {
      console.error('Error deleting tour:', error);
      return rejectWithValue('Failed to delete tour');
    }
  }
);

// Create the slice
const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    // Set tour basic information
    setTourInfo: (state, action: PayloadAction<{ title: string; startDate: string; endDate: string }>) => {
      const { title, startDate, endDate } = action.payload;
      state.currentTour.title = title;
      state.currentTour.startDate = startDate;
      state.currentTour.endDate = endDate;

    },
    
    // Update tour title
    setTourTitle: (state, action: PayloadAction<string>) => {
      state.currentTour.title = action.payload;
    },
    
    // Update tour start date
    setTourStartDate: (state, action: PayloadAction<string>) => {
      state.currentTour.startDate = action.payload;
    },
    
    // Update tour end date
    setTourEndDate: (state, action: PayloadAction<string>) => {
      state.currentTour.endDate = action.payload;
    },
    
    // Add destinations to the tour
    setTourDestinations: (state, action: PayloadAction<string[]>) => {
      state.currentTour.destinations = action.payload;
    },
    
    // Set tour items with their coordinates
    setTourItems: (state, action: PayloadAction<{
      tourItems: TourSavedItem[],
      selectedItemsByDay: Record<number, string[]>,
      cities: Record<number, string>
    }>) => {
      state.currentTour.tourItems = action.payload.tourItems;
      state.currentTour.selectedItemsByDay = action.payload.selectedItemsByDay;
      state.currentTour.cities = action.payload.cities;
    },
    
    // Add a new available item
    addAvailableItem: (state, action: PayloadAction<TourSavedItem>) => {
      state.availableItems.push(action.payload);
    },
    
    // Update an existing available item
    updateAvailableItem: (state, action: PayloadAction<TourSavedItem>) => {
      const index = state.availableItems.findIndex(item => item.id === action.payload.id);
      if (index !== -1) {
        state.availableItems[index] = action.payload;
      }
    },
    
    // Save current tour
    saveTour: (state) => {
      // Only save if the tour has required fields
      if (state.currentTour.title && state.currentTour.startDate && state.currentTour.endDate) {
        state.savedTours.push({ ...state.currentTour });
        
        // Reset current tour

        // call the resetCurrentTour action
        state.currentTour = {
          id: '',
          title: '',
          imageUrl: '',
          city: '',
          duration: 0,
          startDate: '',
          endDate: '',
          destinations: [],
          isEditable: true,
          destinationCount: 0,
          from: '',
          to: '',
        };
      }
    },
    
    // Reset the current tour
    resetCurrentTour: (state) => {
      state.currentTour = {
        id: '',
        title: '',
        imageUrl: '',
        city: '',
        duration: 0,
        startDate: '',
        endDate: '',
        destinations: [],
        isEditable: true,
        destinationCount: 0,
        from: '',
        to: '',
      };
    },
    
    // Clear any errors
    clearError: (state) => {
      state.error = null;
    },
    
    // Set all available items (replacing existing ones)
    setAvailableItems: (state, action: PayloadAction<TourSavedItem[]>) => {
      state.availableItems = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookmarksAsItems.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBookmarksAsItems.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(fetchBookmarksAsItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch bookmarks';
      })

      .addCase(saveTourThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveTourThunk.fulfilled, (state) => {
        state.loading = false;
        // The saveTour action will handle updating the state
      })
      .addCase(saveTourThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to save tour';
      })

      .addCase(fetchTours.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTours.fulfilled, (state, action) => {
        state.loading = false;
        state.savedTours = action.payload;
      })
      .addCase(fetchTours.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tours';
      })

      .addCase(fetchTourDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTourDetails.fulfilled, (state, action) => {
        state.loading = false;
        // Update the current tour with the fetched details
        state.currentTour = {
          ...state.currentTour,
          ...action.payload,
          destinations: action.payload.destinations || [],
          tourItems: action.payload.tourItems || [],
          selectedItemsByDay: action.payload.selectedItemsByDay || {},
          cities: action.payload.cities || {},
        };
      })
      .addCase(fetchTourDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tour details';
      })

      .addCase(deleteTourThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTourThunk.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted tour from the savedTours array
        state.savedTours = state.savedTours.filter(tour => tour.id !== action.payload);
      })
      .addCase(deleteTourThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete tour';
      });
  },
});

export const { 
  setTourInfo, 
  setTourTitle, 
  setTourStartDate, 
  setTourEndDate, 
  setTourDestinations,
  setTourItems,
  addAvailableItem,
  updateAvailableItem,
  setAvailableItems,
  saveTour, 
  resetCurrentTour,
  clearError 
} = tourSlice.actions;

export default tourSlice.reducer; 