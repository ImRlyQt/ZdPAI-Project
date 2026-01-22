const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function apiGet(path, token, params) {
  const url = new URL(API_URL + path);
  if (params) Object.entries(params).forEach(([k,v]) => v!==undefined && url.searchParams.append(k, v));
  return fetch(url.toString(), { headers: token ? { Authorization: `Bearer ${token}` } : {} });
}
export function apiPost(path, token, body) {
  return fetch(API_URL + path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: body ? JSON.stringify(body) : "",
  });
}
