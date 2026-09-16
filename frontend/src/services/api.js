import axios from 'axios';

/**
 * API Service Configuration
 * Uses Vercel/env vars first so your backend URL is always from Environment Variables.
 *
 * Priority:
 * 1. VITE_API_BASE_URL (set in Vercel → Settings → Environment Variables)
 * 2. VITE_BACKEND_URL + /api
 * 3. Local dev: localhost:8080
 */
const getAPIBaseURL = () => {
  const fromEnv = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL;
  if (fromEnv && typeof fromEnv === 'string' && fromEnv.trim()) {
    const u = fromEnv.trim().replace(/\/+$/, '');
    return u.endsWith('/api') ? u : u + '/api';
  }
  const base = import.meta.env.VITE_BACKEND_URL;
  if (base && typeof base === 'string' && base.trim()) {
    return base.trim().replace(/\/$/, '') + '/api';
  }
  if (typeof window !== 'undefined' && (window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1'))) {
    return 'http://localhost:8080/api';
  }
  return 'https://rit-backend-0zvm.onrender.com/api';
};

/** Backend root URL (no /api) for health checks etc. */
const getBackendRootURL = () => {
  const base = getAPIBaseURL();
  return base.replace(/\/api\/?$/, '') || 'http://localhost:8080';
};

const API_URL = getAPIBaseURL();

const api = axios.create({
  baseURL: API_URL,
  timeout: 30000, // 30s timeout — Render free-tier cold-starts take 10-30s
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
    'Bypass-Tunnel-Reminder': 'true'
  }
});

const inflight = new Map();
const referenceCache = new Map();
const httpAdapter = axios.getAdapter(axios.defaults.adapter);

const STATIC_CACHE_ROUTES = [
  '/academic/departments',
  '/academic/courses',
  '/transport/routes',
  '/transport/stops',
  '/twin/catalog',
  '/assets/categories'
];

function isStaticRoute(url) {
  if (!url) return false;
  return STATIC_CACHE_ROUTES.some((route) => url.includes(route));
}

function inflightKey(config) {
  const method = (config.method || 'get').toLowerCase();
  const params = method === 'get' ? JSON.stringify(config.params || {}) : JSON.stringify(config.data || {});
  return `${method}:${config.baseURL || ''}${config.url}:${params}`;
}

api.defaults.adapter = (config) => {
  const method = (config.method || 'get').toLowerCase();

  // Check TTL cache for static GET requests
  if (method === 'get' && (isStaticRoute(config.url) || config.cacheTTL)) {
    const key = inflightKey(config);
    const cached = referenceCache.get(key);
    const ttl = config.cacheTTL || 300000; // 5 min default TTL
    if (cached && (Date.now() - cached.timestamp < ttl)) {
      return Promise.resolve({ ...cached.response, config });
    }
  }

  const shareable = method === 'get' || method === 'post' || method === 'put' || method === 'delete';
  if (!shareable) return httpAdapter(config);

  const key = inflightKey(config);
  const existing = inflight.get(key);
  if (existing) return existing;

  const pending = httpAdapter(config).then((response) => {
    if (method === 'get' && (isStaticRoute(config.url) || config.cacheTTL)) {
      referenceCache.set(key, { timestamp: Date.now(), response });
    }
    return response;
  }).finally(() => {
    if (inflight.get(key) === pending) inflight.delete(key);
  });
  inflight.set(key, pending);
  return pending;
};

api.interceptors.request.use(
  (config) => {
    // Auth Interceptor logic
    if (config.headers['X-Skip-Interceptor']) {
      delete config.headers['X-Skip-Interceptor'];
      if (config.url && config.url.startsWith('/actuator')) {
        const baseURLRoot = config.baseURL.replace('/api', '');
        config.url = baseURLRoot + config.url;
        config.baseURL = '';
      }
      return config;
    }

    const token = localStorage.getItem('token') || localStorage.getItem('rit_dt_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Simple delay helper for retry backoff
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let refreshInFlight = null;

function persistRefreshedSession(data) {
  const nextToken = data?.token || data?.accessToken;
  if (!nextToken) return null;
  localStorage.setItem('token', nextToken);
  localStorage.setItem('rit_dt_token', nextToken);
  localStorage.setItem('accessToken', nextToken);
  if (data.refreshToken) localStorage.setItem('refreshToken', data.refreshToken);
  window.dispatchEvent(new CustomEvent('rit-token-refreshed', { detail: { token: nextToken } }));
  return nextToken;
}

function refreshSession() {
  if (!refreshInFlight) {
    const refreshToken = localStorage.getItem('refreshToken');
    refreshInFlight = refreshToken
      ? axios.post(`${API_URL}/auth/refresh-token`, { refreshToken }, { headers: { 'Content-Type': 'application/json' } })
        .then((response) => persistRefreshedSession(response.data))
        .finally(() => { refreshInFlight = null; })
      : Promise.resolve(null);
  }
  return refreshInFlight;
}

function clearSession() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('role');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('rit_dt_token');
  localStorage.removeItem('rit_dt_user');
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const url = error.config?.url || '';
    const isAuthRequest = url.includes('/auth/login') || url.includes('/auth/refresh') || url.includes('/auth/register');
    if (error.response?.status === 401 && !isAuthRequest && !error.config?._retry) {
      error.config._retry = true;
      try {
        const nextToken = await refreshSession();
        if (nextToken) {
          error.config.headers = error.config.headers || {};
          error.config.headers.Authorization = `Bearer ${nextToken}`;
          return api(error.config);
        }
      } catch {
        // Fall through to sign-in.
      }
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    const status = error.response?.status;
    const shouldRetry = !status || (status >= 500 && status < 600);
    const config = error.config || {};

    if (shouldRetry && !isAuthRequest) {
      config.__retryCount = config.__retryCount || 0;
      if (config.__retryCount < 2) {
        config.__retryCount += 1;
        await sleep(250 * config.__retryCount);
        return api(config);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
export { getAPIBaseURL, getBackendRootURL };
