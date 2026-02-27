// Zentraler API-Client — liest im Production-Build die Backend-URL aus der Env-Variable
const BASE = import.meta.env.VITE_API_URL ?? "";

export async function apiFetch(path, options) {
  const res = await fetch(`${BASE}${path}`, options);
  const json = await res.json();
  if (!res.ok) throw new Error(json.detail ?? `Fehler ${res.status}`);
  return json;
}
