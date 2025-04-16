import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { mapBookmarksToTourSavedItems } from '../utils/bookmarkMapper';
import { api } from '../service';
import { TourSavedItem, Tour } from '../types/tour';
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
  // availableItems: [
  //   {
  //     id: '1',
  //     type: 'hotel',
  //     title: 'Four Seasons Hotel',
  //     subtitle: 'Anfa Place Living Resort, Boulevard de la...',
  //     images: ['https://cf.bstatic.com/xdata/images/hotel/max1024x768/223648290.jpg?k=d7042c5905373d5f217992f67cfb1a1a5a5559a0a2ad4b3ce7536e2848a1bc37&o=&hp=1'],
  //     city: 'Casablanca',
  //     coordinate: { latitude: 33.594910, longitude: -7.634450 }
  //   },
  //   {
  //     id: '2',
  //     type: 'restaurant',
  //     title: 'Kōya Restaurant Lounge',
  //     subtitle: '408 Bd Driss Slaoui, Casablanca',
  //     images: ['https://media-cdn.tripadvisor.com/media/photo-p/1c/cc/51/db/koya.jpg'],
  //     city: 'Casablanca',
  //     coordinate: { latitude: 33.591850, longitude: -7.631180 }
  //   },
  //   {
  //     id: '3',
  //     type: 'match',
  //     title: 'Morocco Vs. Comoros',
  //     subtitle: 'Stade Moulay Abdallah',
  //     images: ['https://images.pexels.com/photos/46798/the-ball-stadion-football-the-pitch-46798.jpeg'],
  //     city: 'Rabat',
  //     coordinate: { latitude: 33.960390, longitude: -6.844232 }
  //   },
  //   {
  //     id: '4',
  //     type: 'entertainment',
  //     title: 'Chellah Jazz Festival',
  //     subtitle: 'Chellah Necropolis',
  //     images: ['https://images.pexels.com/photos/4062561/pexels-photo-4062561.jpeg'],
  //     city: 'Rabat',
  //     coordinate: { latitude: 33.954750, longitude: -6.814180 }
  //   },
  //   {
  //     id: '5',
  //     type: 'hotel',
  //     title: 'Sofitel Agadir Royal Bay',
  //     subtitle: 'Baie des Palmiers, Agadir',
  //     images: ['https://images.pexels.com/photos/189296/pexels-photo-189296.jpeg'],
  //     city: 'Agadir',
  //     coordinate: { latitude: 30.3924542, longitude: -9.6000566 }
  //   },
  //   {
  //     id: '6',
  //     type: 'restaurant',
  //     title: 'Le Jardin d\'Eau',
  //     subtitle: 'Marina, Agadir',
  //     images: ['https://images.pexels.com/photos/941861/pexels-photo-941861.jpeg'],
  //     city: 'Agadir',
  //     coordinate: { latitude: 30.415830, longitude: -9.600680 }
  //   },
  //   {
  //     id: '7',
  //     type: 'match',
  //     title: 'Egypt Vs. Ghana',
  //     subtitle: 'Stade Adrar',
  //     images: ['https://images.pexels.com/photos/3621104/pexels-photo-3621104.jpeg'],
  //     city: 'Agadir',
  //     coordinate: { latitude: 30.372240, longitude: -9.532750 }
  //   }
  // ],
  loading: false,
  availableItems: [],
  error: null,
};

// Async thunk to fetch bookmarks and convert to available items
export const fetchBookmarksAsItems = createAsyncThunk(
  'tour/fetchBookmarksAsItems',
  async (_, { dispatch }) => {
    try {
      const response = await api.get('/bookmarks');
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
      tourItems: TourItem[],
      selectedItemsByDay: Record<number, string[]>,
      cities: Record<number, string>
    }>) => {
      state.currentTour.tourItems = action.payload.tourItems;
      state.currentTour.selectedItemsByDay = action.payload.selectedItemsByDay;
      state.currentTour.cities = action.payload.cities;
    },
    
    // Add a new available item
    addAvailableItem: (state, action: PayloadAction<TourItem>) => {
      state.availableItems.push(action.payload);
    },
    
    // Update an existing available item
    updateAvailableItem: (state, action: PayloadAction<TourItem>) => {
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