'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { api } from '@/lib/api'
import { useAuth } from '@/contexts/AuthContext'
import './styles.css'

interface EventStats {
  id: string
  title: string
  eventDate: string
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
        <div className="dashboard-loading">
          <div className="loading-spinner" />
          <p>Ładowanie danych...</p>
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
            </div>

            {data.upcoming.length === 0 ? (
              <div className="dashboard-empty">
                <div className="empty-icon">📅</div>
                <h3>Brak nadchodzących wydarzeń</h3>
                <p>Twoja organizacja nie ma jeszcze zaplanowanych wydarzeń.</p>
              </div>
            ) : (
              <div className="events-table">
                <table>
                  <thead>
                    <tr>
                      <th>Tytuł</th>
                      <th>Data</th>
                      <th>Zapisy</th>
                      <th>Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.upcoming.map((event) => (
                      <tr key={event.id}>
                        <td className="event-title">
                          <Link href={`/events/${event.id}`}>{event.title}</Link>
                        </td>
                        <td className="event-date">{formatDate(event.eventDate)}</td>
                        <td className="event-stats">
                          <div className="registrations-badge">
                            <span className="registration-total">{event.registrations.total}</span>
                            <span className="registration-detail">
                              ({event.registrations.going} idzie)
                            </span>
                          </div>
                        </td>
                        <td className="event-actions">
                          <Link href={`/events/${event.id}`} className="btn-link">
                            Szczegóły →
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
