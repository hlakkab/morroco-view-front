import { RootState, AppDispatch } from './store'
import { useAppDispatch, useAppSelector } from './hooks'
import { 
  MatchState, 
  fetchMatches, 
  fetchMatchById, 
  setSelectedMatch, 
  toggleMatchBookmark,
  saveMatchBookmark
} from './matchSlice'
import { TicketState, fetchTickets, fetchTicketById, clearError } from './ticketSlice'
import { fetchRestaurants, setSelectedType as setSelectedRestaurantType, setSelectedRestaurant } from './restaurantSlice'
import { fetchMonuments, setSelectedType as setSelectedMonumentType, setSelectedMonument } from './monumentSlice'

export {
  RootState, 
  AppDispatch, 
  useAppDispatch, 
  useAppSelector,
  // Match exports
  MatchState,
  fetchMatches,
  fetchMatchById,
  setSelectedMatch,
  toggleMatchBookmark,
  saveMatchBookmark,
  // Ticket exports
  TicketState,
  fetchTickets,
  fetchTicketById,
  clearError,
  // Restaurant exports
  fetchRestaurants,
  setSelectedRestaurantType,
  setSelectedRestaurant,
  // Monument exports
  fetchMonuments,
  setSelectedMonumentType,
  setSelectedMonument
}