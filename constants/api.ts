import { Platform } from "react-native";

// .env override takes priority (use for physical devices or custom setups)
// iOS simulator uses localhost, Android emulator uses 10.0.2.2 (host machine alias)
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL ??
  (Platform.OS === "android" ? "http://10.0.2.2:9000/api" : "http://localhost:9000/api");
