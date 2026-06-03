import { API_URL } from "@/constants/api";
import { getAuthHeaders, setAuthToken } from "@/helpers/helpers";
import * as SecureStore from "expo-secure-store";

let _onUnauthorized: (() => void) | null = null;
let _refreshPromise: Promise<boolean> | null = null;

export function registerUnauthorizedHandler(handler: () => void) {
  _onUnauthorized = handler;
}

async function refreshOnce(): Promise<boolean> {
  if (_refreshPromise) return _refreshPromise;
  _refreshPromise = (async () => {
    try {
      const storedRefresh = await SecureStore.getItemAsync("refresh_token");
      if (!storedRefresh) return false;

      const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: storedRefresh }),
      });

      if (!refreshRes.ok) {
        await SecureStore.deleteItemAsync("refresh_token");
        return false;
      }

      const { data } = await refreshRes.json();
      await SecureStore.setItemAsync("refresh_token", data.refresh_token);
      setAuthToken(data.token);
      return true;
    } finally {
      _refreshPromise = null;
    }
  })();
  return _refreshPromise;
}

export async function apiFetch(input: RequestInfo, init?: RequestInit): Promise<Response> {
  const res = await fetch(input, {
    ...init,
    headers: { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) },
  });

  if (res.status !== 401) return res;

  try {
    const refreshed = await refreshOnce();
    if (!refreshed) {
      _onUnauthorized?.();
      return res;
    }

    return fetch(input, {
      ...init,
      headers: { ...getAuthHeaders(), ...(init?.headers as Record<string, string>) },
    });
  } catch {
    _onUnauthorized?.();
    return res;
  }
}
