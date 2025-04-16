import { configureStore } from '@reduxjs/toolkit';
import { useAppDispatch, useAppSelector } from './hooks';
import { AppDispatch, RootState } from './store';

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
  AppDispatch, clearError,
  // Artisan exports
  fetchArtisans, fetchMatches,
  // Monument exports
  fetchMonuments,
  // Restaurant exports
  fetchRestaurants, fetchTicketById, fetchTickets,
  // Match exports
  MatchState, RootState, saveMatchBookmark, setSelectedArtisanType, setSelectedMonument, setSelectedMonumentType, setSelectedRestaurant, setSelectedRestaurantType,
  // Ticket exports
  TicketState, toggleMatchBookmark, useAppDispatch,
  useAppSelector
};

