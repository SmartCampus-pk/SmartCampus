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

    participation: (eventId: string, userId: string) =>
      apiRequest(
        `/api/event-participations?where[event][equals]=${encodeURIComponent(
          eventId,
        )}&where[user][equals]=${encodeURIComponent(userId)}&where[status][equals]=going&limit=1`,
      ),

    participants: (eventId: string) => apiRequest(`/api/events/${eventId}/participants`),
  },

  me: {
    events: () => apiRequest('/api/me/events'),
  },

  notifications: {
    list: (page?: number, limit?: number) => {
      const params = new URLSearchParams()
      if (page) params.set('page', page.toString())
      if (limit) params.set('limit', limit.toString())
      const query = params.toString()
      return apiRequest(`/api/notifications/me${query ? `?${query}` : ''}`)
    },
    markAsRead: (id: string) =>
      apiRequest(`/api/notifications/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isRead: true }),
      }),
  },

  organizations: {
    list: (search?: string) => {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      const query = params.toString()
      return apiRequest(`/api/organizations${query ? `?${query}` : ''}`)
    },
    get: (id: string) => apiRequest(`/api/organizations/${id}`),
    update: (
      id: string,
      data: {
        description?: string
        contactEmail?: string
        contactPhone?: string
        website?: string
      },
    ) =>
      apiRequest(`/api/organizations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
}
