import { configureStore } from "@reduxjs/toolkit";
import authSlice from "./slices/authSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
  },
  // Enable Redux DevTools
  devTools: process.env.NODE_ENV !== "production",
});
