import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// Define interfaces for tour items
export interface TourItem {
  id: string;
  type: 'hotel' | 'restaurant' | 'match' | 'entertainment';
  title: string;
  subtitle?: string;
  imageUrl?: string;
  city: string;
  duration?: string;
  timeSlot?: string;
  coordinate?: {
    latitude: number;
    longitude: number;
  };
}

// Define the Tour interface
export interface Tour {
  title: string;
  startDate: string;
  endDate: string;
  destinations?: string[];
  tourItems?: TourItem[];
  selectedItemsByDay?: Record<number, string[]>;
  cities?: Record<number, string>;
}

// Define the state structure
export interface TourState {
  currentTour: Tour;
  savedTours: Tour[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: TourState = {
  currentTour: {
    title: '',
    startDate: '',
    endDate: '',
    destinations: [],
    tourItems: [],
    selectedItemsByDay: {},
    cities: {},
  },
  savedTours: [],
  loading: false,
  error: null,
};

// Create the slice
const tourSlice = createSlice({
  name: 'tour',
  initialState,
  reducers: {
    // Set tour basic information
    setTourInfo: (state, action: PayloadAction<{ title: string; startDate: string; endDate: string }>) => {
      console.log('setTourInfo =======', action.payload);
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
    
    // Save current tour
    saveTour: (state) => {
      // Only save if the tour has required fields
      if (state.currentTour.title && state.currentTour.startDate && state.currentTour.endDate) {
        state.savedTours.push({ ...state.currentTour });
        
        // Reset current tour
        state.currentTour = {
          title: '',
          startDate: '',
          endDate: '',
          destinations: [],
          tourItems: [],
          selectedItemsByDay: {},
          cities: {},
        };
      }
    },
    
    // Reset the current tour
    resetCurrentTour: (state) => {
      state.currentTour = {
        title: '',
        startDate: '',
        endDate: '',
        destinations: [],
        tourItems: [],
        selectedItemsByDay: {},
        cities: {},
      };
    },
    
    // Clear any errors
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const { 
  setTourInfo, 
  setTourTitle, 
  setTourStartDate, 
  setTourEndDate, 
  setTourDestinations,
  setTourItems,
  saveTour, 
  resetCurrentTour,
  clearError 
} = tourSlice.actions;

export default tourSlice.reducer; 