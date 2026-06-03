import { API_URL } from "@/constants/api";
import { getAuthHeaders, setAuthToken } from "@/helpers/helpers";
import * as SecureStore from "expo-secure-store";

let _onUnauthorized: (() => void) | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) },
  });

  if (res.status !== 401) return res;

  try {
    const storedRefresh = await SecureStore.getItemAsync("refresh_token");
    if (!storedRefresh) {
      _onUnauthorized?.();
      return res;
    }

    const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: storedRefresh }),
    });

    if (!refreshRes.ok) {
      await SecureStore.deleteItemAsync("refresh_token");
      _onUnauthorized?.();
      return res;
    }

    const { data } = await refreshRes.json();
    await SecureStore.setItemAsync("refresh_token", data.refresh_token);
    setAuthToken(data.token);

    // Retry original request with new token
    return fetch(input, {
      ...init,
      headers: { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) },
    });
  } catch {
    _onUnauthorized?.();
    return res;
  }
}
