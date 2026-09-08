/**
 * lib/api.ts — Axios Instance with Interceptors
 *
 * baseURL includes /api/v1 — every call site elsewhere in the app should
 * use SHORT paths only: api.get('/staff'), api.post('/auth/login'), etc.
 * Never write '/api/v1/...' at a call site — it's already in baseURL.
 */

import axios from "axios";

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND_URL || "http://localhost:5000"}/api/v1`,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login") &&
      window.location.pathname !== "/"
    ) {
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default api;