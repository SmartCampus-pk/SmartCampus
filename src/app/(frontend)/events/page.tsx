import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import payloadConfig from '@/payload.config'
import { EventsView } from './EventsView'
import '../styles.css'

export const metadata = {
  title: 'Wydarzenia - Smart Campus',
  description: 'Przeglądaj wszystkie wydarzenia kampusowe',
}

interface Event {
  id: string
  title: string
  description: string
  eventDate: string
  location?: string
}

export default async function EventsArchivePage() {
  const payload = await getPayload({ config: payloadConfig })

  const eventsResult = await payload.find({
    collection: 'events',
    sort: '-eventDate',
    limit: 100,
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

        {eventsResult.docs && eventsResult.docs.length > 0 ? (
          <EventsView initialEvents={eventsResult.docs} />
        ) : (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h2>Brak wydarzeń</h2>
            <p>Nie znaleziono żadnych wydarzeń</p>
          </div>
        )}
      </div>
    </div>
  )
}
