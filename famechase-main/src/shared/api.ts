// src/shared/api.ts
// Central place for all API endpoint URLs

export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://famechase.com/.netlify/functions/api" // production site
    : "http://localhost:8888/.netlify/functions/api"; // local Netlify dev

export const API_ENDPOINTS = {
  health: `${API_BASE_URL}/health`,
  products: `${API_BASE_URL}/products`,
  orders: `${API_BASE_URL}/orders`,
};




