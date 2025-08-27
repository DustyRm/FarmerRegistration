import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
});

export async function apiGet<T = unknown>(url: string): Promise<T> {
  const r = await api.get<T>(url);
  return r.data;
}

export async function apiSend<T = unknown>(url: string, method: 'POST'|'PATCH'|'DELETE', data?: any): Promise<T> {
  const r = await api.request<T>({ url, method, data });
  return r.data;
}
