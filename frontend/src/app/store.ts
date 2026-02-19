import { combineReducers, configureStore } from '@reduxjs/toolkit';
// import auth from '../features/auth/authSlice';
// import theme from '../features/theme/themeSlice';
// import vendorSlice from '../features/admin/Master/VendorMaster/vendorSlice';
// import franchise from '../features/admin/Master/FranchiseMaster/franchiseSlice';
import auth from '../features/auth/authSlice';
import theme from '../features/theme/themeSlice';
import {
  persistReducer,
  persistStore,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage"; // localStorage

const rootReducer = combineReducers({
  auth,
  theme,


});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "theme"], // slices you want to persist
};
const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // required by redux-persist to avoid warnings
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
