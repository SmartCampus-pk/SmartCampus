'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { NotificationItemSkeleton } from '@/components/NotificationItemSkeleton'
import '../styles.css'

interface Notification {
  id: string
  title: string
  message: string
  type: 'event_update' | 'announcement'
  relatedEvent?: string | { id: string; title: string; slug: string }
  isRead: boolean
  createdAt: string
}

export default function NotificationsPage() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterType, setFilterType] = useState<string>('')
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [isMarkingAll, setIsMarkingAll] = useState(false)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !user) {
      router.push('/login')
      return
    }

    // Fetch notifications if authenticated
    if (user) {
      fetchNotifications()
    }
  }, [user, authLoading, router, page, filterType, unreadOnly])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const filters: { type?: string; unreadOnly?: boolean } = {}
      if (filterType) filters.type = filterType
      if (unreadOnly) filters.unreadOnly = true
      const { data, error: apiError } = await api.notifications.list(page, 20, filters)
      if (apiError || !data) {
        setError(apiError || 'Nie udało się pobrać powiadomień')
        return
      }
      setNotifications(data.notifications || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania powiadomień')
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      const { error: apiError } = await api.notifications.markAsRead(id)
      if (apiError) {
        console.error('Failed to mark notification as read:', apiError)
        return
      }
      // Update local state
      setNotifications((prev) =>
        prev.map((notif) => (notif.id === id ? { ...notif, isRead: true } : notif)),
      )
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      setIsMarkingAll(true)
      const { error: apiError } = await api.notifications.markAllAsRead()
      if (apiError) {
        console.error('Failed to mark all as read:', apiError)
        return
      }
      // Update local state
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })))
    } catch (err) {
      console.error('Error marking all as read:', err)
    } finally {
      setIsMarkingAll(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error: apiError } = await api.notifications.delete(id)
      if (apiError) {
        console.error('Failed to delete notification:', apiError)
        return
      }
      // Remove from local state
      setNotifications((prev) => prev.filter((notif) => notif.id !== id))
    } catch (err) {
      console.error('Error deleting notification:', err)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="notifications-page">
        <div className="container">
          <div className="notifications-header">
            <h1>Powiadomienia</h1>
          </div>
          <div className="notifications-list">
            {[...Array(5)].map((_, i) => (
              <NotificationItemSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="notifications-page">
        <div className="container">
          <div className="notifications-header">
            <h1>Powiadomienia</h1>
          </div>
          <div className="notifications-error">
            <div className="empty-icon">⚠️</div>
            <h2>Błąd ładowania</h2>
            <p>{error}</p>
            <button
              onClick={fetchNotifications}
              className="btn btn-primary"
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    )
  }

  const typeLabels: Record<string, string> = {
    event_update: 'Aktualizacja wydarzenia',
    announcement: 'Ogłoszenie',
  }

  return (
    <div className="notifications-page">
      <div className="container">
        <div className="notifications-header">
          <h1>Powiadomienia</h1>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={isMarkingAll}
              className="btn btn-secondary mark-all-read-btn"
            >
              {isMarkingAll ? 'Oznaczanie...' : `Oznacz wszystkie (${unreadCount})`}
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="notifications-filters">
          <div className="filter-group">
            <label htmlFor="filterType" className="filter-label">
              Typ:
            </label>
            <select
              id="filterType"
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value)
                setPage(1)
              }}
              className="filter-select"
            >
              <option value="">Wszystkie</option>
              <option value="event_update">Aktualizacje wydarzeń</option>
              <option value="announcement">Ogłoszenia</option>
            </select>
          </div>
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={unreadOnly}
              onChange={(e) => {
                setUnreadOnly(e.target.checked)
                setPage(1)
              }}
            />
            Tylko nieprzeczytane
          </label>
        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">🔔</div>
            <h2>Brak powiadomień</h2>
            <p>
              {filterType || unreadOnly
                ? 'Brak powiadomień spełniających kryteria filtrowania.'
                : 'Nie masz jeszcze żadnych powiadomień. Powiadomienia pojawią się tutaj, gdy wydarzenia, na które jesteś zapisany, zostaną zaktualizowane.'}
            </p>
            {filterType || unreadOnly ? (
              <button
                onClick={() => {
                  setFilterType('')
                  setUnreadOnly(false)
                }}
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                Wyczyść filtry
              </button>
            ) : (
              <Link
                href="/events"
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                Przeglądaj wydarzenia
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="notifications-list">
              {notifications.map((notification) => {
                const relatedEvent =
                  typeof notification.relatedEvent === 'object' &&
                  notification.relatedEvent !== null
                    ? notification.relatedEvent
                    : null

                return (
                  <div
                    key={notification.id}
                    className={`notification-item ${notification.isRead ? 'notification-read' : 'notification-unread'}`}
                  >
                    <div className="notification-content">
                      <div className="notification-header">
                        <h3 className="notification-title">{notification.title}</h3>
                        {!notification.isRead && <span className="notification-badge">Nowe</span>}
                      </div>
                      <p className="notification-message">{notification.message}</p>
                      <div className="notification-meta">
                        <span className="notification-type">
                          {typeLabels[notification.type] || notification.type}
                        </span>
                        <span className="notification-date">
                          {new Date(notification.createdAt).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {relatedEvent && (
                        <Link
                          href={`/events/${relatedEvent.id}`}
                          className="notification-event-link"
                        >
                          Zobacz wydarzenie: {relatedEvent.title} →
                        </Link>
                      )}
                    </div>
                    <div className="notification-actions">
                      {!notification.isRead && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="notification-mark-read"
                          title="Oznacz jako przeczytane"
                        >
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" />
                          </svg>
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="notification-delete"
                        title="Usuń powiadomienie"
                      >
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M5.5 5.5A.5.5 0 016 6v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm2.5 0a.5.5 0 01.5.5v6a.5.5 0 01-1 0V6a.5.5 0 01.5-.5zm3 .5a.5.5 0 00-1 0v6a.5.5 0 001 0V6z" />
                          <path
                            fillRule="evenodd"
                            d="M14.5 3a1 1 0 01-1 1H13v9a2 2 0 01-2 2H5a2 2 0 01-2-2V4h-.5a1 1 0 01-1-1V2a1 1 0 011-1H6a1 1 0 011-1h2a1 1 0 011 1h3.5a1 1 0 011 1v1zM4.118 4L4 4.059V13a1 1 0 001 1h6a1 1 0 001-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="notifications-pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="btn btn-secondary"
                >
                  Poprzednia
                </button>
                <span className="notifications-pagination-info">
                  Strona {page} z {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="btn btn-secondary"
                >
                  Następna
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
