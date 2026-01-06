'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { EventCard } from '@/components/EventCard'
import { CalendarView } from '@/components/CalendarView'
import type { Event } from '@/payload-types'

export function EventsView({ initialEvents }: { initialEvents: Event[] }) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)

  // Fetch events for the current month when in calendar view
  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchEventsForMonth()
    }
  }, [viewMode, currentMonth])

  const fetchEventsForMonth = async () => {
    try {
      setIsLoading(true)
      const year = currentMonth.getFullYear()
      const month = currentMonth.getMonth()

      // Get first and last day of the month
      const firstDay = new Date(year, month, 1)
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59)

      // Fetch events for the month range
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const response = await fetch(
        `/api/events?where[eventDate][greater_than_equal]=${firstDay.toISOString()}&where[eventDate][less_than_equal]=${lastDay.toISOString()}&sort=eventDate&limit=100`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      )

      const data = await response.json()
      if (response.ok && data?.docs) {
        setEvents(data.docs)
      }
    } catch (err) {
      console.error('Error fetching events for month:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="events-view-container">
      <div className="events-view-controls">
        <div className="view-toggle">
          <button
            onClick={() => setViewMode('list')}
            className={`view-toggle-button ${viewMode === 'list' ? 'active' : ''}`}
          >
            📋 Lista
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`view-toggle-button ${viewMode === 'calendar' ? 'active' : ''}`}
          >
            📅 Kalendarz
          </button>
        </div>
      </div>

      {viewMode === 'list' ? (
        <>
          {events.length > 0 ? (
            <div className="events-grid">
              {events.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  eventDate={event.eventDate}
                  location={event.location}
                  participantsCount={event.participantsCount}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h2>Brak wydarzeń</h2>
              <p>Nie znaleziono żadnych wydarzeń</p>
            </div>
          )}
        </>
      ) : (
        <div className="calendar-container">
          {isLoading ? (
            <div className="calendar-loading">
              <p>Ładowanie wydarzeń...</p>
            </div>
          ) : (
            <CalendarView
              events={events}
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
            />
          )}
        </div>
      )}
    </div>
  )
}
