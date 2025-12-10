import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const eventsResult = await payload.find({
    collection: 'events',
    limit: 6,
    sort: '-eventDate',
  })

  return (
    <div className="home">
      <div className="content">
        <h1>Smart Campus</h1>
        <p>Witamy na platformie wydarzeń kampusowych</p>

        {eventsResult.docs.length > 0 && (
          <section className="events-section">
            <h2>Najbliższe wydarzenia</h2>
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
                  </div>
                </Link>
              ))}
            </div>
            <Link href="/events" className="view-all-link">
              Zobacz wszystkie wydarzenia →
            </Link>
          </section>
        )}

        {eventsResult.docs.length === 0 && (
          <div className="no-events">
            <p>Brak dostępnych wydarzeń.</p>
            <Link href={payloadConfig.routes.admin} className="admin">
              Dodaj wydarzenie w panelu administracyjnym
            </Link>
          </div>
        )}

        <div className="links">
          <Link
            className="admin"
            href={payloadConfig.routes.admin}
            rel="noopener noreferrer"
            target="_blank"
          >
            Panel administracyjny
          </Link>
        </div>
      </div>
    </div>
  )
}
