import axios from 'axios';
import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api' || "https://portfolio-backend-wilson.onrender.com";
const TOKEN_KEY = 'accessToken';

/**
 * Short-lived access token (15 min) lives in sessionStorage:
 * it survives the full-page reload Login does (`window.location.href = '/admin'`)
 * and is scoped to the tab. The refresh token stays in the httpOnly cookie
 * and is never readable by JS.
 */
export function getAccessToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string | null): void {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  } else {
    sessionStorage.removeItem(TOKEN_KEY);
  }
}

interface RetriableConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

// Auth endpoints must never trigger the refresh-and-retry path, otherwise a
// failed login/refresh would recurse into itself.
function isAuthEndpoint(url?: string): boolean {
  if (!url) return false;
  return ['/auth/login', '/auth/refresh', '/auth/logout'].some((path) => url.includes(path));
}

// Backend envelope: { success, data: { accessToken }, message }
function saveAccessToken(payload: unknown): void {
  const token = (payload as { data?: { accessToken?: string } } | null | undefined)?.data
    ?.accessToken;
  if (token) setAccessToken(token);
}

// Single-flight refresh: concurrent 401s share one in-flight refresh call.
let refreshInFlight: Promise<string | null> | null = null;

function refreshAccessToken(): Promise<string | null> {
  if (!refreshInFlight) {
    // Plain axios (not `api`) so this call cannot re-enter the interceptor.
    refreshInFlight = axios
      .post<{ data?: { accessToken?: string } }>(`${API_BASE}/auth/refresh`, {}, {
        withCredentials: true,
      })
      .then((res) => {
        const token = res.data?.data?.accessToken ?? null;
        setAccessToken(token);
        return token;
      })
      .catch(() => {
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshInFlight = null;
      });
  }
  return refreshInFlight;
}

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // Important for cookies/refresh tokens
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the current access token to every request.
api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    if (isAuthEndpoint(response.config.url)) {
      saveAccessToken(response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const config = error.config as RetriableConfig | undefined;

    // Retry each request at most once, only on 401, never for auth endpoints.
    if (error.response?.status === 401 && config && !config._retry && !isAuthEndpoint(config.url)) {
      const token = await refreshAccessToken();
      if (token) {
        config._retry = true;
        // Request interceptor re-attaches Authorization with the new token.
        return api(config);
      }
      // Refresh failed: drop the dead token and surface the original error.
      setAccessToken(null);
    }

    return Promise.reject(error);
  }
);

export default api;
