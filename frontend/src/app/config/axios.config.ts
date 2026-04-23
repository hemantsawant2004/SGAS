import axios from "axios";
import { store } from "../store";
import { setAccessToken, logout } from "../../features/auth/authSlice";

const resolveApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_URL?.trim();

  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;

    if (hostname === "localhost" || hostname === "127.0.0.1") {
      return "http://localhost:4000/api";
    }
  }

  if (import.meta.env.PROD) {
    console.warn(
      "[api] VITE_API_URL is not set in production. Falling back to '/api', which only works if the backend is served from the same domain."
    );
  }

  return "/api";
};

export const api = axios.create({
  baseURL: resolveApiBaseUrl(),
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = store.getState().auth.accessToken;

  if (token) {
    config.headers = config.headers ?? {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
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

      const refreshResponse = await refreshPromise;
      const nextAccessToken = refreshResponse?.data?.accessToken;

      if (typeof nextAccessToken === "string" && nextAccessToken) {
        store.dispatch(setAccessToken(nextAccessToken));
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${nextAccessToken}`;
      }

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
