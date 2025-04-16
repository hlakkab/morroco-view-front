import { configureStore } from "@reduxjs/toolkit";
import artisanReducer from './artisanSlice';
import bookmarkReducer from './bookmarkSlice';
import entertainmentReducer from './entertainmentSlice';
import exchangeBrokerReducer from './exchangeBrokerSlice';
import hotelPickupDetailsReducer from "./hotelPickupDetailsSlice";
import hotelPickupReducer from "./hotelPickupSlice";
import matchReducer from './matchSlice';
import monumentReducer from './monumentSlice';
import qrCodeReducer from "./qrCodeSlice";
import restaurantReducer from './restaurantSlice';
import ticketReducer from './ticketSlice';
import tourReducer from './tourSlice';

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
    tour: tourReducer
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
