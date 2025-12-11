import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { Navigation } from '@/components/Navigation'
import config from '@/payload.config'
import '../../styles.css'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { id } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const event = await payload.findByID({
    collection: 'events',
    id,
  })

  if (!event) {
    return {
      title: 'Wydarzenie nie znalezione - Smart Campus',
    }
  }

  return {
    title: `${event.title} - Smart Campus`,
    description: event.description,
  }
}

export default async function EventSinglePage({ params }: Props) {
  const { id } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  let event
  try {
    event = await payload.findByID({
      collection: 'events',
      id,
    })
  } catch (error) {
    notFound()
  }

  if (!event) {
    notFound()
  }

  return (
    <div className="event-single">
      <Navigation />
      <div className="container">
        <Link href="/events" className="back-link">
          ← Powrót do listy wydarzeń
        </Link>

        <article className="event-article">
          <header className="event-header">
            <div className="event-header-content">
              <h1>{event.title}</h1>
              <div className="event-meta">
                {event.eventDate && (
                  <time className="event-date">
                    {new Date(event.eventDate).toLocaleDateString('pl-PL', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </time>
                )}
                {event.location && <p className="event-location">📍 {event.location}</p>}
                {event.participantsCount !== undefined && event.participantsCount !== null && (
                  <p className="event-participants">
                    👥 {event.participantsCount}{' '}
                    {event.participantsCount === 1 ? 'uczestnik' : 'uczestników'}
                  </p>
                )}
              </div>
            </div>
          </header>

          <div className="event-body">
            <p className="event-description">{event.description}</p>
          </div>
        </article>
      </div>
    </div>
  )
}
