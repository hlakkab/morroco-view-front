import { useAppDispatch, useAppSelector } from './hooks';
import store, { AppDispatch, RootState } from './store';

// Import directly from store files
import esimReducer from '../ESIM/store/esimSlice';

import {
  fetchMatches,
  saveMatchBookmark,
  toggleMatchBookmark,
  MatchState
} from '../Match/store/matchSlice';

import {
  clearError,
  fetchTicketById,
  fetchTickets,
  TicketState
} from '../Tickets/store/ticketSlice';

import {
  fetchRestaurants,
  setSelectedRestaurant,
  setSelectedType as setSelectedRestaurantType
} from '../Restaurant/store/restaurantSlice';

import {
  fetchMonuments,
  setSelectedMonument,
  setSelectedType as setSelectedMonumentType
} from '../Monument/store/monumentSlice';

import {
  fetchArtisans,
  setSelectedType as setSelectedArtisanType
} from '../Artisan/store/artisanSlice';

export {
  AppDispatch,
  clearError,
  fetchArtisans,
  fetchMatches,
  fetchMonuments,
  fetchRestaurants,
  fetchTicketById,
  fetchTickets,
  MatchState,
  RootState,
  saveMatchBookmark,
  setSelectedArtisanType,
  setSelectedMonument,
  setSelectedMonumentType,
  setSelectedRestaurant,
  setSelectedRestaurantType,
  TicketState,
  toggleMatchBookmark,
  useAppDispatch,
  useAppSelector
};

