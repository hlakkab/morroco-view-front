import { configureStore } from "@reduxjs/toolkit";
import qrCodeReducer from "./qrCodeSlice";
import hotelPickupReducer from "./hotelPickupSlice";
import hotelPickupDetailsReducer from "./hotelPickupDetailsSlice";
import bookmarkReducer from './bookmarkSlice';

const store = configureStore({
  reducer: {
    qrCodes: qrCodeReducer,
    hotelPickup: hotelPickupReducer,
    hotelPickupDetails: hotelPickupDetailsReducer,
    bookmark: bookmarkReducer
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
