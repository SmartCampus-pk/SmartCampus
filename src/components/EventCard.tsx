import Link from 'next/link'
import React from 'react'
import type { Event } from '@/payload-types'

type EventCardProps = Pick<
  Event,
  'id' | 'title' | 'description' | 'eventDate' | 'location' | 'participantsCount'
> & {
  className?: string
}

export function EventCard({
  id,
  title,
  description,
  eventDate,
  location,
  participantsCount,
  className,
}: EventCardProps) {
  return (
    <Link href={`/events/${id}`} className={`event-card ${className || ''}`}>
      <div className="event-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
        {participantsCount !== undefined && participantsCount !== null && (
          <div className="card-participants">
            👥 {participantsCount} {participantsCount === 1 ? 'uczestnik' : 'uczestników'}
          </div>
        )}
        {(eventDate || location) && (
          <div className="card-footer">
            {eventDate && (
              <span className="card-meta">
                📅{' '}
                {new Date(eventDate).toLocaleDateString('pl-PL', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
            )}
            {location && <span className="card-meta">📍 {location}</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
