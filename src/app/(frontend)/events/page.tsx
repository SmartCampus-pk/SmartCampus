import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import '../styles.css'

export const metadata = {
  title: 'Wydarzenia - Smart Campus',
  description: 'Przeglądaj wszystkie wydarzenia kampusowe',
}

export default async function EventsArchivePage() {
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const eventsResult = await payload.find({
    collection: 'events',
    sort: '-eventDate',
  })

  return (
    <div className="events-archive">
      <div className="container">
        <header className="archive-header">
          <h1>Wszystkie wydarzenia</h1>
          <Link href="/" className="back-link">
            ← Powrót do strony głównej
          </Link>
        </header>

        {eventsResult.docs.length > 0 ? (
          <div className="events-grid">
            {eventsResult.docs.map((event) => (
              <Link key={event.id} href={`/events/${event.slug}`} className="event-card">
                {event.image && typeof event.image === 'object' && (
                  <div className="event-image">
                    <Image
                      alt={event.image.alt || event.title}
                      height={200}
                      src={typeof event.image.url === 'string' ? event.image.url : ''}
                      width={300}
                    />
                  </div>
                )}
                <div className="event-content">
                  <h3>{event.title}</h3>
                  <p className="event-description">{event.description}</p>
                  {event.eventDate && (
                    <time className="event-date">
                      {new Date(event.eventDate).toLocaleDateString('pl-PL', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  )}
                  {event.location && <p className="event-location">📍 {event.location}</p>}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="no-events">
            <p>Brak dostępnych wydarzeń.</p>
          </div>
        )}
      </div>
    </div>
  )
}
