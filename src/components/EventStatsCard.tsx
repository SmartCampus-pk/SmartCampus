'use client'

import React, { useEffect, useState } from 'react'
import './EventStatsCard.css'

interface EventStatsCardProps {
  eventId: string
}

interface Stats {
  total: number
  going: number
  interested: number
  attended: number
}

export function EventStatsCard({ eventId }: EventStatsCardProps) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchStats()
  }, [eventId])

  const fetchStats = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/events/${eventId}/stats`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch stats')
      }

      const data = await response.json()
      setStats(data.stats)
    } catch (err) {
      setError('Nie udało się pobrać statystyk')
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="event-stats-card">
        <div className="stats-header">
          <h3>Statystyki wydarzenia</h3>
        </div>
        <div className="stats-loading">Ładowanie...</div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="event-stats-card">
        <div className="stats-header">
          <h3>Statystyki wydarzenia</h3>
        </div>
        <div className="stats-error">{error || 'Brak danych'}</div>
      </div>
    )
  }

  const hasData = stats.total > 0

  return (
    <div className="event-stats-card">
      <div className="stats-header">
        <h3>Statystyki wydarzenia</h3>
      </div>

      {!hasData ? (
        <div className="stats-empty">
          <div className="empty-icon">📊</div>
          <p>Brak zapisów</p>
          <span className="empty-hint">To wydarzenie nie ma jeszcze żadnych zapisów</span>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-label">Łącznie</div>
            <div className="stat-value">{stats.total}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Idzie</div>
            <div className="stat-value stat-value-going">{stats.going}</div>
          </div>

          <div className="stat-item">
            <div className="stat-label">Zainteresowanych</div>
            <div className="stat-value stat-value-interested">{stats.interested}</div>
          </div>

          {stats.attended > 0 && (
            <div className="stat-item">
              <div className="stat-label">Uczestniczyło</div>
              <div className="stat-value stat-value-attended">{stats.attended}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
