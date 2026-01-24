'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { ProfileEventItemSkeleton } from '@/components/ProfileEventItemSkeleton'
import '../styles.css'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  organization?: string | { id: string; name: string }
  createdAt?: string
}

interface UserEvent {
  id: string
  title: string
  slug: string
  description: string
  eventDate: string
  location?: string
  eventStatus: 'upcoming' | 'ongoing' | 'past'
  participationStatus: string
}

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [events, setEvents] = useState<{ upcoming: UserEvent[]; past: UserEvent[] }>({
    upcoming: [],
    past: [],
  })
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !authUser) {
      router.push('/login')
      return
    }

    // Fetch user data if authenticated
    if (authUser) {
      fetchUserData()
      fetchUserEvents()
    }
  }, [authUser, authLoading, router])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: apiError } = await api.auth.me()
      if (apiError || !data?.user) {
        setError(apiError || 'Nie udało się pobrać danych użytkownika')
        return
      }
      setUser(data.user)
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania danych')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchUserEvents = async () => {
    try {
      setEventsLoading(true)
      const { data, error: apiError } = await api.me.events()
      if (apiError || !data) {
        console.error('Failed to fetch user events:', apiError)
        return
      }
      setEvents({
        upcoming: data.upcoming || [],
        past: data.past || [],
      })
    } catch (err) {
      console.error('Error fetching user events:', err)
    } finally {
      setEventsLoading(false)
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-header">
            <h1>Mój profil</h1>
          </div>

          <div className="profile-card">
            <div className="profile-card-header">
              <div className="profile-avatar skeleton" />
              <div className="profile-card-actions">
                <button className="btn btn-secondary" disabled>
                  Edytuj profil
                </button>
              </div>
            </div>

            <div className="profile-card-body">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="profile-field">
                  <div
                    className="skeleton skeleton-text"
                    style={{ height: '20px', width: '80px', marginBottom: '8px' }}
                  />
                  <div
                    className="skeleton skeleton-text"
                    style={{ height: '24px', width: '100%' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="profile-events-section">
            <h2>Moje wydarzenia</h2>
            <div className="profile-events-list">
              {[...Array(3)].map((_, i) => (
                <ProfileEventItemSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-error">
            <p>{error}</p>
            <button onClick={fetchUserData} className="btn btn-primary">
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show profile
  if (!user) {
    return null
  }

  const roleLabels: Record<string, string> = {
    student: 'Student',
    organizer: 'Organizator',
    admin: 'Administrator',
    'org-admin': 'Administrator organizacji',
    'super-admin': 'Super administrator',
  }

  const roleLabel = user.role ? roleLabels[user.role] || user.role : 'Użytkownik'
  const organizationName =
    typeof user.organization === 'object' && user.organization !== null
      ? user.organization.name
      : user.organization

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Mój profil</h1>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              {user.firstName?.[0] || user.email[0].toUpperCase()}
              {user.lastName?.[0] || ''}
            </div>
            <div className="profile-card-actions">
              <button className="btn btn-secondary" disabled>
                Edytuj profil
              </button>
            </div>
          </div>

          <div className="profile-card-body">
            <div className="profile-field">
              <label className="profile-field-label">Imię i nazwisko</label>
              <div className="profile-field-value">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'Nie podano'}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-field-label">Email</label>
              <div className="profile-field-value">{user.email}</div>
            </div>

            <div className="profile-field">
              <label className="profile-field-label">Rola</label>
              <div className="profile-field-value">
                <span className="profile-role-badge">{roleLabel}</span>
              </div>
            </div>

            {organizationName && (
              <div className="profile-field">
                <label className="profile-field-label">Organizacja</label>
                <div className="profile-field-value">{organizationName}</div>
              </div>
            )}

            {user.createdAt && (
              <div className="profile-field">
                <label className="profile-field-label">Data rejestracji</label>
                <div className="profile-field-value">
                  {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* My Events Section */}
        <div className="profile-events-section">
          <h2>Moje wydarzenia</h2>

          {eventsLoading ? (
            <div className="profile-events-list">
              {[...Array(3)].map((_, i) => (
                <ProfileEventItemSkeleton key={i} />
              ))}
            </div>
          ) : (
            <>
              {/* Upcoming Events */}
              {events.upcoming.length > 0 && (
                <div className="profile-events-group">
                  <h3 className="profile-events-group-title">Nadchodzące</h3>
                  <div className="profile-events-list">
                    {events.upcoming.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="profile-event-item"
                      >
                        <div className="profile-event-content">
                          <h4 className="profile-event-title">{event.title}</h4>
                          <div className="profile-event-meta">
                            {event.eventDate && (
                              <span className="profile-event-date">
                                📅{' '}
                                {new Date(event.eventDate).toLocaleDateString('pl-PL', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                            {event.location && (
                              <span className="profile-event-location">📍 {event.location}</span>
                            )}
                          </div>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="profile-event-arrow"
                        >
                          <path
                            d="M6 12l4-4-4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Past Events */}
              {events.past.length > 0 && (
                <div className="profile-events-group">
                  <h3 className="profile-events-group-title">Przeszłe</h3>
                  <div className="profile-events-list">
                    {events.past.map((event) => (
                      <Link
                        key={event.id}
                        href={`/events/${event.id}`}
                        className="profile-event-item"
                      >
                        <div className="profile-event-content">
                          <h4 className="profile-event-title">{event.title}</h4>
                          <div className="profile-event-meta">
                            {event.eventDate && (
                              <span className="profile-event-date">
                                📅{' '}
                                {new Date(event.eventDate).toLocaleDateString('pl-PL', {
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            )}
                            {event.location && (
                              <span className="profile-event-location">📍 {event.location}</span>
                            )}
                          </div>
                        </div>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="currentColor"
                          className="profile-event-arrow"
                        >
                          <path
                            d="M6 12l4-4-4-4"
                            stroke="currentColor"
                            strokeWidth="2"
                            fill="none"
                          />
                        </svg>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {events.upcoming.length === 0 && events.past.length === 0 && (
                <div className="profile-events-empty">
                  <div className="empty-icon">📅</div>
                  <h3>Brak wydarzeń</h3>
                  <p>
                    Nie bierzesz udziału w żadnych wydarzeniach. Dołącz do wydarzeń, aby zobaczyć je
                    tutaj.
                  </p>
                  <Link
                    href="/events"
                    className="btn btn-primary"
                    style={{ marginTop: 'var(--spacing-4)' }}
                  >
                    Przeglądaj wydarzenia
                  </Link>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
