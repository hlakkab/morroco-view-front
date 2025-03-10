import { configureStore } from "@reduxjs/toolkit";
import qrCodeReducer from "./qrCodeSlice";

const store = configureStore({
  reducer: {
    qrCodes: qrCodeReducer
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
