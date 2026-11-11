/**
 * MindTrace API Client
 * Lightweight fetch wrapper with credentials (HTTP-only session cookies) and automatic CSRF header handling.
 */

let cachedCsrfToken: string | null = null;

export async function fetchCsrfToken(): Promise<string | null> {
  try {
    const res = await fetch('/api/auth/csrf-token', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      cachedCsrfToken = data.csrfToken || null;
      return cachedCsrfToken;
    }
  } catch (_err) {
    // Offline or network unavailable
  }
  return null;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ ok: boolean; status: number; data?: T; error?: string; message?: string }> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  // Attach CSRF token if state-changing method
  if (['POST', 'PUT', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
    if (!cachedCsrfToken) {
      await fetchCsrfToken();
    }
    if (cachedCsrfToken) {
      headers['x-csrf-token'] = cachedCsrfToken;
    }
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers,
      credentials: 'include',
    });

    const data = await response.json().catch(() => ({}));

    return {
      ok: response.ok,
      status: response.status,
      data,
      error: data?.error,
      message: data?.message,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: 'Network Error',
      message: 'Failed to connect to MindTrace server. Running in offline mode.',
    };
  }
}
