// API helper that automatically adds JWT token to requests

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {},
): Promise<{ data?: T; error?: string }> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || 'Request failed' }
    }

    return { data }
  } catch (error) {
    return { error: 'Network error' }
  }
}

// Specific API methods
export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (email: string, password: string, firstName: string, lastName: string) =>
      apiRequest('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, firstName, lastName }),
      }),

    me: () => apiRequest('/api/auth/me'),

    logout: () =>
      apiRequest('/api/auth/logout', {
        method: 'POST',
      }),
  },

  events: {
    join: (eventId: string) =>
      apiRequest(`/api/events/${eventId}/join`, {
        method: 'POST',
      }),

    leave: (eventId: string) =>
      apiRequest(`/api/events/${eventId}/leave`, {
        method: 'POST',
      }),

    participants: (eventId: string) => apiRequest(`/api/events/${eventId}/participants`),
  },
}
