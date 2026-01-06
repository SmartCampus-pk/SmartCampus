'use client'

import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface Notification {
  id: string
  title: string
  message: string
  type: 'event_update' | 'announcement'
  createdAt: string
}

interface EventAnnouncementsProps {
  eventId: string
}

export function EventAnnouncements({ eventId }: EventAnnouncementsProps) {
  const [announcements, setAnnouncements] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [eventId])

  const fetchAnnouncements = async () => {
    try {
      setIsLoading(true)
      const { data, error } = await api.notifications.list(1, 50)
      if (error || !data) {
        console.error('Failed to fetch announcements:', error)
        return
      }

      // Filter announcements related to this event
      const eventAnnouncements = (data.notifications || []).filter((notif: Notification) => {
        // Check if notification is related to this event
        // relatedEvent can be string (ID) or object with id property
        if (typeof (notif as any).relatedEvent === 'string') {
          return (notif as any).relatedEvent === eventId
        }
        if (
          typeof (notif as any).relatedEvent === 'object' &&
          (notif as any).relatedEvent !== null
        ) {
          return (notif as any).relatedEvent.id === eventId
        }
        return false
      })

      // Filter only announcements (not event updates)
      const filtered = eventAnnouncements.filter(
        (notif: Notification) => notif.type === 'announcement',
      )

      setAnnouncements(filtered)
    } catch (err) {
      console.error('Error fetching announcements:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="event-announcements">
        <div className="event-announcements-loading">
          <p>Ładowanie ogłoszeń...</p>
        </div>
      </div>
    )
  }

  if (announcements.length === 0) {
    return null
  }

  return (
    <div className="event-announcements">
      <h2 className="event-announcements-title">Ogłoszenia organizatora</h2>
      <div className="event-announcements-list">
        {announcements.map((announcement) => (
          <div key={announcement.id} className="event-announcement-item">
            <div className="event-announcement-header">
              <h3 className="event-announcement-title">{announcement.title}</h3>
              <span className="event-announcement-date">
                {new Date(announcement.createdAt).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <p className="event-announcement-message">{announcement.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
