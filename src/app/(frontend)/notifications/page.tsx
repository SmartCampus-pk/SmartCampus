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
  }, [user, authLoading, router, page])

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: apiError } = await api.notifications.list(page, 20)
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
        </div>

        {notifications.length === 0 ? (
          <div className="notifications-empty">
            <div className="notifications-empty-icon">🔔</div>
            <h2>Brak powiadomień</h2>
            <p>
              Nie masz jeszcze żadnych powiadomień. Powiadomienia pojawią się tutaj, gdy wydarzenia,
              na które jesteś zapisany, zostaną zaktualizowane.
            </p>
            <Link
              href="/events"
              className="btn btn-primary"
              style={{ marginTop: 'var(--spacing-4)' }}
            >
              Przeglądaj wydarzenia
            </Link>
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
