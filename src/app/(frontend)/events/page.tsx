import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { EventCard } from '@/components/EventCard'
import payloadConfig from '@/payload.config'
import '../styles.css'

export const metadata = {
  title: 'Wydarzenia - Smart Campus',
  description: 'Przeglądaj wszystkie wydarzenia kampusowe',
}

export default async function EventsArchivePage() {
  const payload = await getPayload({ config: payloadConfig })

  const eventsResult = await payload.find({
    collection: 'events',
    sort: '-eventDate',
  })

  return (
    <div className="events-archive">
      <div className="container archive-container">
        <Link href="/" className="back-link">
          ← Powrót
        </Link>
        <header className="archive-header">
          <h1>Wydarzenia</h1>
          <p className="archive-subtitle">Wszystkie wydarzenia kampusowe w jednym miejscu</p>
        </header>

        {eventsResult.docs.length > 0 ? (
          <div className="events-grid">
            {eventsResult.docs.map((event) => (
              <EventCard
                key={event.id}
                id={event.id}
                title={event.title}
                description={event.description}
                eventDate={event.eventDate}
                location={event.location || undefined}
                participantsCount={event.participantsCount ?? undefined}
              />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>Brak wydarzeń</h2>
            <p>Nie znaleziono żadnych wydarzeń</p>
            <Link href="/" className="btn btn-primary" style={{ marginTop: 'var(--spacing-6)' }}>
              Powrót do strony głównej
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
