/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Base API URL for all requests
 * Change this if API endpoint changes
 */
export const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.famechase.com/api"
    : "http://localhost:3000/api"; // Change localhost port if different

/**
 * Helper function to build full API URLs
 */
export function getApiUrl(endpoint: string): string {
  return `${API_BASE_URL}${endpoint}`;
}
