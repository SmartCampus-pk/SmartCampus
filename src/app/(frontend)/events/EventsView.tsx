'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { EventCard } from '@/components/EventCard'
import { EventCardSkeleton } from '@/components/EventCardSkeleton'
import { CalendarView } from '@/components/CalendarView'
import type { Event } from '@/payload-types'

const CACHE_KEY_PREFIX = 'events_cache_'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

interface CachedEvents {
  data: Event[]
  timestamp: number
  monthKey: string
}

export function EventsView({ initialEvents }: { initialEvents: Event[] }) {
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list')
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [filteredEvents, setFilteredEvents] = useState<Event[]>(initialEvents)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])

  // Extract all unique tags from events
  useEffect(() => {
    const tags = new Set<string>()
    initialEvents.forEach((event) => {
      if (event.tags && Array.isArray(event.tags)) {
        event.tags.forEach((tagItem: any) => {
          if (tagItem?.tag) {
            tags.add(tagItem.tag)
          }
        })
      }
    })
    setAvailableTags(Array.from(tags).sort())
  }, [initialEvents])

  // Filter events by selected tags
  useEffect(() => {
    if (selectedTags.length === 0) {
      setFilteredEvents(events)
    } else {
      const filtered = events.filter((event) => {
        if (!event.tags || !Array.isArray(event.tags)) return false
        const eventTags = event.tags.map((tagItem: any) => tagItem?.tag).filter(Boolean)
        return selectedTags.some((tag) => eventTags.includes(tag))
      })
      setFilteredEvents(filtered)
    }
  }, [selectedTags, events])

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearTags = () => {
    setSelectedTags([])
  }

  // Fetch events for the current month when in calendar view
  useEffect(() => {
    if (viewMode === 'calendar') {
      fetchEventsForMonth()
    } else {
      // When switching to list, use initial events
      setEvents(initialEvents)
      setError(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode, currentMonth])

  const getCacheKey = (year: number, month: number) => {
    return `${CACHE_KEY_PREFIX}${year}-${month}`
  }

  const getCachedEvents = (year: number, month: number): Event[] | null => {
    if (typeof window === 'undefined') return null

    try {
      const cacheKey = getCacheKey(year, month)
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const parsed: CachedEvents = JSON.parse(cached)
      const now = Date.now()

      // Check if cache is still valid
      if (now - parsed.timestamp < CACHE_DURATION && parsed.monthKey === `${year}-${month}`) {
        return parsed.data
      }

      // Remove expired cache
      localStorage.removeItem(cacheKey)
      return null
    } catch (err) {
      console.error('Error reading cache:', err)
      return null
    }
  }

  const setCachedEvents = (year: number, month: number, data: Event[]) => {
    if (typeof window === 'undefined') return

    try {
      const cacheKey = getCacheKey(year, month)
      const cacheData: CachedEvents = {
        data,
        timestamp: Date.now(),
        monthKey: `${year}-${month}`,
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (err) {
      console.error('Error setting cache:', err)
    }
  }

  const fetchEventsForMonth = async () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()

    // Check cache first
    const cached = getCachedEvents(year, month)
    if (cached) {
      setEvents(cached)
      setError(null)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

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
        setCachedEvents(year, month, data.docs)
      } else {
        setError('Nie udało się pobrać wydarzeń. Spróbuj ponownie później.')
      }
    } catch (err) {
      console.error('Error fetching events for month:', err)
      setError('Wystąpił błąd podczas pobierania wydarzeń. Spróbuj ponownie później.')
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

      {/* Tags Filter */}
      {availableTags.length > 0 && viewMode === 'list' && (
        <div className="events-tags-filter">
          <div className="tags-filter-header">
            <h3>Filtruj po tagach:</h3>
            {selectedTags.length > 0 && (
              <button onClick={clearTags} className="tags-clear-button">
                Wyczyść filtry
              </button>
            )}
          </div>
          <div className="tags-filter-list">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`tag-filter-button ${selectedTags.includes(tag) ? 'active' : ''}`}
              >
                {tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <p className="tags-filter-info">
              Wyświetlane wydarzenia: {filteredEvents.length} z {events.length}
            </p>
          )}
        </div>
      )}

      {viewMode === 'list' ? (
        <>
          {filteredEvents.length > 0 ? (
            <div className="events-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id}
                  id={event.id}
                  title={event.title}
                  description={event.description}
                  eventDate={event.eventDate}
                  location={event.location}
                  participantsCount={event.participantsCount}
                  tags={event.tags}
                />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📅</div>
              <h2>Brak wydarzeń</h2>
              <p>
                {selectedTags.length > 0
                  ? 'Nie znaleziono wydarzeń z wybranymi tagami'
                  : 'Nie znaleziono żadnych wydarzeń'}
              </p>
              {selectedTags.length > 0 ? (
                <button
                  onClick={clearTags}
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--spacing-4)' }}
                >
                  Wyczyść filtry
                </button>
              ) : (
                <Link
                  href="/"
                  className="btn btn-primary"
                  style={{ marginTop: 'var(--spacing-4)' }}
                >
                  Powrót do strony głównej
                </Link>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="calendar-container">
          {isLoading ? (
            <div className="calendar-loading">
              <div className="calendar-skeleton">
                <div className="skeleton skeleton-calendar-header" />
                <div className="skeleton skeleton-calendar-grid" />
              </div>
            </div>
          ) : error ? (
            <div className="calendar-error">
              <div className="empty-icon">⚠️</div>
              <h2>Błąd ładowania</h2>
              <p>{error}</p>
              <button
                onClick={fetchEventsForMonth}
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                Spróbuj ponownie
              </button>
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
