import { useAppDispatch, useAppSelector } from './hooks';
import store, { AppDispatch, RootState } from './store';
import esimReducer from './slices/esimSlice';

import MatchState, {
  fetchMatches,
  saveMatchBookmark,
  toggleMatchBookmark
} from './matchSlice';

import TicketState, {
  clearError,
  fetchTicketById,
  fetchTickets
} from './ticketSlice';

import {
  fetchRestaurants,
  setSelectedRestaurant,
  setSelectedType as setSelectedRestaurantType
} from './restaurantSlice';

import {
  fetchMonuments,
  setSelectedMonument,
  setSelectedType as setSelectedMonumentType
} from './monumentSlice';

import {
  fetchArtisans,
  setSelectedType as setSelectedArtisanType
} from './artisanSlice';

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

