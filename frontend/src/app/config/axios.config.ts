import axios from "axios";
import { store } from "../store";
import { logout } from "../../features/auth/authSlice";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:4000",
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<any> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;

    const status = error?.response?.status;

    // If no config or not 401 -> just reject
    if (!original || status !== 401) {
      return Promise.reject(error);
    }

    // ⛔ Do NOT try to refresh if the failing request is the refresh endpoint itself
    if (original.url?.includes("/auth/refresh")) {
      // refresh itself failed -> logout and stop
      store.dispatch(logout());
      return Promise.reject(error);
    }

    // prevent retrying same request twice
    if ((original as any)._retry) {
      store.dispatch(logout());
      return Promise.reject(error);
    }
    (original as any)._retry = true;

    try {
      // Only one refresh request at a time
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = api.post("/auth/refresh"); // backend sets new cookies
      }

      await refreshPromise;

      isRefreshing = false;
      refreshPromise = null;

      // Now retry original request (cookies already updated)
      return api(original);
    } catch (refreshError) {
      isRefreshing = false;
      refreshPromise = null;

      // refresh failed -> force logout
      store.dispatch(logout());
      return Promise.reject(refreshError);
    }
  }
);
