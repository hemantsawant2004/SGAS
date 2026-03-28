import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SessionUser } from "./dto/auth.dto";

type AuthStatus = "idle" | "checking" | "authenticated" | "unauthenticated";
export type Role = 'junior Editor' | 'senior Editor' | 'SUPERADMIN' | 'Team Lead';

type State = { 
  user: SessionUser | null; 
  accessToken: string | null;
  status: AuthStatus;
};
const initial: State = { 
  user: null, 
  accessToken: null,
  status: "idle" 
};


const authSlice = createSlice({
  name: 'auth',
  initialState: initial,
  reducers: {
    setUser:(s, a: PayloadAction<SessionUser | null>) => void (s.user = a.payload),
    setAccessToken:(s, a: PayloadAction<string | null>) => void (s.accessToken = a.payload),
     setAuthChecking(state) {
      state.status = "checking";
    },
      setAuthenticated(state, action: PayloadAction<{ user: SessionUser; accessToken?: string | null }>) {
      state.user = action.payload.user;
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.status = "authenticated";
    },
    setUnauthenticated(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
    },
    logout(state) {
      state.user = null;
      state.accessToken = null;
      state.status = "unauthenticated";
    },
    //setBootstrapped:(s, a: PayloadAction<boolean>) => void (s.bootstrapped = a.payload),
  },
});
export const { setAuthChecking, setAuthenticated, setUnauthenticated, logout,setUser, setAccessToken } =
  authSlice.actions;
//export const { setAccessToken, setUser, setBootstrapped } = slice.actions;
export default authSlice.reducer;
