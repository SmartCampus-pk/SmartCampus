import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { FeatureCard } from '@/components/FeatureCard'
import { Navigation } from '@/components/Navigation'
import { Separator } from '@/components/Separator'
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
      <Navigation />
      <div className="content">
        <section className="hero-section">
          <h1>Smart Campus</h1>
          <p>Twoja centralna platforma do odkrywania i zarządzania wydarzeniami kampusowymi</p>
          <Link href="/events" className="cta-button">
            Przeglądaj wydarzenia →
          </Link>
        </section>

        <section className="features-section">
          <h2>Wszystko czego potrzebujesz</h2>
          <p className="section-subtitle">
            Kompleksowe rozwiązanie do zarządzania życiem kampusowym
          </p>
          <div className="features-grid">
            <FeatureCard
              icon="📅"
              title="Kalendarz wydarzeń"
              description="Śledź wszystkie nadchodzące wydarzenia w jednym miejscu. Nigdy nie przegap ważnego spotkania czy konferencji."
            />
            <FeatureCard
              icon="🔔"
              title="Powiadomienia"
              description="Otrzymuj powiadomienia o nowych wydarzeniach i zmianach w harmonogramie w czasie rzeczywistym."
            />
            <FeatureCard
              icon="🎯"
              title="Łatwe zarządzanie"
              description="Intuicyjny panel administracyjny umożliwia szybkie dodawanie i edycję wydarzeń."
            />
          </div>
        </section>

        <Separator />

        {eventsResult.docs.length > 0 && (
          <section className="events-section">
            <h2>Nadchodzące wydarzenia</h2>
            <p className="section-subtitle">
              Nie przegap najciekawszych wydarzeń w naszym kampusie
            </p>
            <div className="events-grid">
              {eventsResult.docs.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`} className="event-card">
                  <div className="event-content">
                    <h3>{event.title}</h3>
                    <p className="event-description">{event.description}</p>
                    {event.participantsCount !== undefined && event.participantsCount !== null && (
                      <p className="event-participants">
                        👥 {event.participantsCount}{' '}
                        {event.participantsCount === 1 ? 'uczestnik' : 'uczestników'}
                      </p>
                    )}
                    <div className="event-meta">
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
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ textAlign: 'center' }}>
              <Link href="/events" className="view-all-link">
                Zobacz wszystkie wydarzenia →
              </Link>
            </div>
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
