import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'
import React from 'react'

import { Navigation } from '@/components/Navigation'
import config from '@/payload.config'
import '../../styles.css'

type Props = {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const eventsResult = await payload.find({
    collection: 'events',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const event = eventsResult.docs[0]

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
  const { slug } = await params
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })

  const eventsResult = await payload.find({
    collection: 'events',
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  })

  const event = eventsResult.docs[0]

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
            {event.image && typeof event.image === 'object' && (
              <div className="event-hero-image">
                <Image
                  alt={event.image.alt || event.title}
                  height={500}
                  src={typeof event.image.url === 'string' ? event.image.url : ''}
                  width={1200}
                  priority
                />
              </div>
            )}
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
              </div>
            </div>
          </header>

          <div className="event-body">
            <p className="event-description">{event.description}</p>
            {event.content && Array.isArray(event.content) && event.content.length > 0 && (
              <div className="event-content">
                <div className="rich-text-content">
                  <p>Treść wydarzenia dostępna w panelu administracyjnym.</p>
                </div>
              </div>
            )}
          </div>
        </article>
      </div>
    </div>
  )
}
