const API = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const authHeader = async (): Promise<Record<string, string>> => {
  const { supabase } = await import("./supabaseClient");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const api = {
  async get<T>(path: string): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    const res = await fetch(`${API}${path}`, { headers });
    if (!res.ok) throw new Error(`GET ${path} ${res.status}`);
    return res.json();
  },
  async post<T>(path: string, body: unknown): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(await authHeader()),
    };
    const res = await fetch(`${API}${path}`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`POST ${path} ${res.status}`);
    return res.json();
  },
};




