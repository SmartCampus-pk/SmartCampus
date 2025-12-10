import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

interface EventCardProps {
  slug: string
  title: string
  description: string
  image?: {
    url: string
    alt?: string
  }
  eventDate?: string
  location?: string
  className?: string
}

export function EventCard({
  slug,
  title,
  description,
  image,
  eventDate,
  location,
  className,
}: EventCardProps) {
  return (
    <Link href={`/events/${slug}`} className={`card ${className || ''}`}>
      {image && (
        <div className="card-image">
          <Image alt={image.alt || title} height={240} src={image.url} width={400} />
        </div>
      )}
      <div className="card-content">
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
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
