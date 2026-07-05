// Centralized API helper with credentials for Laravel Sanctum SPA

export const API_BASE = 'http://localhost:8000/api';
export const BACKEND_URL = 'http://localhost:8000'; // Base URL for Sanctum CSRF

export interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

export function isApiErrorResponse(error: unknown): error is ApiErrorResponse {
  return typeof error === 'object' && error !== null && 'message' in error;
}

// 1. Fonction pour initialiser le CSRF Cookie avant le login/register
export async function initCsrfCookie() {
  return fetch(`${BACKEND_URL}/sanctum/csrf-cookie`, {
    method: 'GET',
    headers: { 'Accept': 'application/json' },
    credentials: 'include', // Indispensable pour Sanctum SPA
  });
}

function getXsrfToken() {
  if (typeof document === 'undefined') return '';
  const match = document.cookie.match(new RegExp('(^|;\\s*)(XSRF-TOKEN)=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : '';
}

// 2. apiFetch n'a plus besoin d'injecter Authorization: Bearer, mais doit injecter X-XSRF-TOKEN
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const xsrfToken = getXsrfToken();
  
  const headers: HeadersInit = {
    'Accept': 'application/json',
    ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
    ...(xsrfToken ? { 'X-XSRF-TOKEN': xsrfToken } : {}),
    ...(options.headers || {}),
  };

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    credentials: 'include', // <--- LA MAGIE SANCTUM EST ICI (Envoie le cookie HttpOnly)
    headers,
  });

  if (res.status === 401 || res.status === 419) {
    if (typeof window !== 'undefined') {
      // Nettoyer les cookies frontend pour éviter les boucles du middleware
      document.cookie = 'userRole=; Max-Age=0; path=/';
      document.cookie = 'userName=; Max-Age=0; path=/';
      // Rediriger vers la page de connexion
      window.location.href = '/login';
    }
  }

  return res;
}

export function extractArray(data: any): any[] {
  // Laravel pagination: data.data.data | data.data | data
  if (Array.isArray(data?.data?.data)) return data.data.data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data)) return data;
  return [];
}

export function getAvatarUrl(name: string, photoUrl?: string | null): string {
  if (photoUrl) {
    return photoUrl.startsWith('http') ? photoUrl : `${API_BASE.replace('/api', '')}${photoUrl}`;
  }
  const encoded = encodeURIComponent(name || 'User');
  return `https://ui-avatars.com/api/?name=${encoded}&background=a53b22&color=fff&size=128`;
}

// 4. Fonctions de rétrocompatibilité pour éviter les erreurs de build
// Ces fonctions ne sont plus vraiment utiles avec Sanctum, 
// mais elles évitent de casser le reste du projet.
export function getToken(): string | null {
  if (typeof document === 'undefined') return null;
  return document.cookie.includes('userRole=') ? 'sanctum_session_active' : null;
}

export function authHeaders(): Record<string, string> {
  return { 'Accept': 'application/json' };
}
