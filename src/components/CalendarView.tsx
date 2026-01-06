'use client'

import Link from 'next/link'
import React, { useMemo } from 'react'
import type { Event } from '@/payload-types'

export function CalendarView({
  events,
  currentMonth,
  onMonthChange,
}: {
  events: Event[]
  currentMonth: Date
  onMonthChange: (date: Date) => void
}) {
  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startingDayOfWeek = firstDay.getDay() // 0 = Sunday, 1 = Monday, etc.

  // Adjust for Monday as first day (0 = Monday, 6 = Sunday)
  const adjustedStartingDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped: Record<string, Event[]> = {}
    events.forEach((event) => {
      const eventDate = new Date(event.eventDate)
      const dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const days: Array<{ date: number; dateKey: string; isCurrentMonth: boolean }> = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < adjustedStartingDay; i++) {
      days.push({ date: 0, dateKey: '', isCurrentMonth: false })
    }

    // Add days of the current month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      days.push({ date: day, dateKey, isCurrentMonth: true })
    }

    // Fill remaining cells to complete the grid (6 rows × 7 days = 42 cells)
    const totalCells = 42
    const remainingCells = totalCells - days.length
    for (let i = 0; i < remainingCells; i++) {
      days.push({ date: 0, dateKey: '', isCurrentMonth: false })
    }

    return days
  }, [year, month, daysInMonth, adjustedStartingDay])

  const monthNames = [
    'Styczeń',
    'Luty',
    'Marzec',
    'Kwiecień',
    'Maj',
    'Czerwiec',
    'Lipiec',
    'Sierpień',
    'Wrzesień',
    'Październik',
    'Listopad',
    'Grudzień',
  ]

  const dayNames = ['Pon', 'Wt', 'Śr', 'Czw', 'Pt', 'Sob', 'Nie']

  const handlePrevMonth = () => {
    const newDate = new Date(year, month - 1, 1)
    onMonthChange(newDate)
  }

  const handleNextMonth = () => {
    const newDate = new Date(year, month + 1, 1)
    onMonthChange(newDate)
  }

  const handleToday = () => {
    onMonthChange(new Date())
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <button onClick={handlePrevMonth} className="calendar-nav-button">
          ←
        </button>
        <div className="calendar-month-year">
          <h2>
            {monthNames[month]} {year}
          </h2>
          <button onClick={handleToday} className="calendar-today-button">
            Dzisiaj
          </button>
        </div>
        <button onClick={handleNextMonth} className="calendar-nav-button">
          →
        </button>
      </div>

      <div className="calendar-grid">
        {/* Day names header */}
        <div className="calendar-weekdays">
          {dayNames.map((day) => (
            <div key={day} className="calendar-weekday">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="calendar-days">
          {calendarDays.map((day, index) => {
            const dayEvents = day.dateKey ? eventsByDate[day.dateKey] || [] : []
            const isToday =
              day.isCurrentMonth &&
              day.date === new Date().getDate() &&
              month === new Date().getMonth() &&
              year === new Date().getFullYear()

            return (
              <div
                key={index}
                className={`calendar-day ${!day.isCurrentMonth ? 'calendar-day-other-month' : ''} ${isToday ? 'calendar-day-today' : ''}`}
              >
                {day.isCurrentMonth && (
                  <>
                    <div className="calendar-day-number">{day.date}</div>
                    {dayEvents.length > 0 && (
                      <div className="calendar-day-events">
                        {dayEvents.slice(0, 3).map((event) => (
                          <Link
                            key={event.id}
                            href={`/events/${event.id}`}
                            className="calendar-event"
                            title={event.title}
                          >
                            {event.title}
                          </Link>
                        ))}
                        {dayEvents.length > 3 && (
                          <div className="calendar-event-more">+{dayEvents.length - 3} więcej</div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
