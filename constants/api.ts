// Set EXPO_PUBLIC_API_URL in a .env file at the project root, e.g.:
// EXPO_PUBLIC_API_URL=http://192.168.1.100:9000/api
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:9000/api";
