'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import { EventCardSkeleton } from '@/components/EventCardSkeleton'
import './styles.css'

interface EventStats {
  id: string
  title: string
  slug: string
  description: string
  eventDate: string
  category: string
  location: string
  capacity: number
  registrations: {
    total: number
    going: number
  }
  attendanceRate: number | null
}

interface DashboardData {
  upcoming: EventStats[]
  stats: {
    upcomingEventsCount: number
    registrationsLast7Days: number
  }
}

export default function OrganizerDashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboard()
  }, [])

  const fetchDashboard = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data: dashboardData, error: apiError } = await api.organizer.dashboard()
      if (apiError || !dashboardData) {
        setError(apiError || 'Nie udało się pobrać danych dashboardu')
        return
      }
      setData(dashboardData)
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania danych')
    } finally {
      setIsLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pl-PL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Zaloguj się</h2>
          <p>Musisz być zalogowany, aby zobaczyć dashboard organizatora.</p>
          <Link href="/login" className="btn btn-primary">
            Zaloguj się
          </Link>
        </div>
      </div>
    )
  }

  if (user.role !== 'org-admin' && user.role !== 'super-admin') {
    return (
      <div className="dashboard-container">
        <div className="dashboard-error">
          <h2>Brak dostępu</h2>
          <p>Dashboard organizatora jest dostępny tylko dla administratorów organizacji.</p>
          <Link href="/events" className="btn btn-primary">
            Wróć do wydarzeń
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Dashboard Organizatora</h1>
        <p className="dashboard-subtitle">Zarządzaj wydarzeniami i monitoruj statystyki</p>
      </div>

      {isLoading && (
        <div className="dashboard-content">
          <div className="dashboard-stats">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="stat-card">
                <div className="skeleton skeleton-icon" style={{ width: '40px', height: '40px' }} />
                <div className="stat-content">
                  <div
                    className="skeleton skeleton-text"
                    style={{ height: '16px', width: '80px', marginBottom: '8px' }}
                  />
                  <div
                    className="skeleton skeleton-text"
                    style={{ height: '32px', width: '40px' }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2>Nadchodzące wydarzenia</h2>
              <Link href="/admin/collections/events/create" className="btn btn-secondary">
                + Nowe wydarzenie
              </Link>
            </div>

            <div className="events-list">
              {[...Array(3)].map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="dashboard-error">
          <div className="error-icon">⚠️</div>
          <h2>Błąd ładowania</h2>
          <p>{error}</p>
          <button onClick={fetchDashboard} className="btn btn-primary">
            Spróbuj ponownie
          </button>
        </div>
      )}

      {!isLoading && !error && data && (
        <>
          {/* Stats Section */}
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-content">
                <h3>Nadchodzące wydarzenia</h3>
                <div className="stat-value">{data.stats.upcomingEventsCount}</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>Zapisy (ostatnie 7 dni)</h3>
                <div className="stat-value">{data.stats.registrationsLast7Days}</div>
              </div>
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Nadchodzące wydarzenia</h2>
              <Link href="/events" className="btn btn-secondary">
                + Nowe wydarzenie
              </Link>
            </div>

            {data.upcoming.length === 0 ? (
              <div className="dashboard-empty">
                <div className="empty-icon">📅</div>
                <h3>Brak nadchodzących wydarzeń</h3>
                <p>Twoja organizacja nie ma jeszcze zaplanowanych wydarzeń.</p>
                <Link href="/events" className="btn btn-primary">
                  Utwórz nowe wydarzenie
                </Link>
              </div>
            ) : (
              <div className="events-list">
                {data.upcoming.map((event) => (
                  <div key={event.id} className="event-card">
                    <div className="event-card-header">
                      <div>
                        <h3 className="event-card-title">{event.title}</h3>
                        <p className="event-card-category">{event.category}</p>
                      </div>
                      <div className="event-card-date">{formatDate(event.eventDate)}</div>
                    </div>

                    <p className="event-card-description">{event.description}</p>

                    <div className="event-card-meta">
                      <div className="meta-item">
                        <span className="meta-label">Lokalizacja:</span>
                        <span className="meta-value">{event.location}</span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Pojemność:</span>
                        <span className="meta-value">
                          {event.registrations.total} / {event.capacity}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Potwierdzeni:</span>
                        <span className="meta-value">{event.registrations.going}</span>
                      </div>
                    </div>

                    <div className="event-card-actions">
                      <Link href={`/events/${event.id}`} className="btn btn-primary btn-small">
                        Szczegóły
                      </Link>
                      <a
                        href={`/admin/collections/events/${event.id}`}
                        className="btn btn-secondary btn-small"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Edytuj w CMS
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
