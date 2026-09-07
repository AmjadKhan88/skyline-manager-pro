/**
 * lib/api.ts — Axios Instance with Interceptors
 *
 * Configured axios instance used everywhere in the app.
 * - baseURL: reads from VITE_BACKEND_URL env (defaults to localhost:5000)
 * - credentials: true → sends httpOnly cookies with every request
 * - Response interceptor: auto-redirects to /login on 401
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL || "http://localhost:5000",
  withCredentials: true, // Send cookies (httpOnly JWT) with every request
  headers: { "Content-Type": "application/json" },
  timeout: 15000, // 15 second timeout
});

// Response interceptor — handle auth errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If the server returns 401 and we're not already on the login page, redirect
    if (
      error.response?.status === 401 &&
      !window.location.pathname.includes("/login") &&
      !window.location.pathname.includes("/")
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
