import { configureStore } from "@reduxjs/toolkit";

// Import reducers directly from store files
import artisanReducer from '../Artisan/store/artisanSlice';
import bookmarkReducer from '../Bookmarks/store/bookmarkSlice';
import entertainmentReducer from '../Entertainment/store/entertainmentSlice';
import exchangeBrokerReducer from '../MoneyExchange/store/exchangeBrokerSlice';
import hotelPickupReducer from '../Pickup/store/hotelPickupSlice';
import hotelPickupDetailsReducer from '../Pickup/store/hotelPickupDetailsSlice';
import matchReducer from '../Match/store/matchSlice';
import monumentReducer from '../Monument/store/monumentSlice';
import qrCodeReducer from '../QRCode/store/qrCodeSlice';
import restaurantReducer from '../Restaurant/store/restaurantSlice';
import ticketReducer from '../Tickets/store/ticketSlice';
import tourReducer from '../Tours/store/tourSlice';
import esimReducer from '../ESIM/store/esimSlice';

const store = configureStore({
  reducer: {
    qrCodes: qrCodeReducer,
    hotelPickup: hotelPickupReducer,
    hotelPickupDetails: hotelPickupDetailsReducer,
    bookmark: bookmarkReducer,
    exchangeBroker: exchangeBrokerReducer,
    entertainment: entertainmentReducer,
    match: matchReducer,
    ticket: ticketReducer,
    restaurant: restaurantReducer,
    monument: monumentReducer,
    artisan: artisanReducer,
    tour: tourReducer,
    esim: esimReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: false
    })
});

// Define RootState and AppDispatch types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
