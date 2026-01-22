import { headers as getHeaders } from 'next/headers.js'
import Link from 'next/link'
import { getPayload } from 'payload'
import React from 'react'

import { FeatureCard } from '@/components/FeatureCard'
import { Separator } from '@/components/Separator'
import payloadConfig from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const eventsResult = await payload.find({
    collection: 'events',
    limit: 6,
    sort: '-eventDate',
  })

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>Odkryj wydarzenia kampusowe</h1>
          <p>Twoja centralna platforma do odkrywania, organizacji i udziału w życiu akademickim</p>
          <Link
            href="/events"
            className="btn btn-primary"
            style={{ marginTop: 'var(--spacing-6)' }}
          >
            Przeglądaj wydarzenia →
          </Link>
        </div>
      </section>

      <div className="container">
        <section style={{ marginBlock: 'var(--spacing-12)' }}>
          <h2 style={{ textAlign: 'center' }}>Wszystko czego potrzebujesz</h2>
          <p className="section-subtitle">
            Kompleksowe rozwiązanie do zarządzania życiem kampusowym
          </p>
          <div className="cards-grid">
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
                    <h3 className="card-title">{event.title}</h3>
                    <p className="card-description">{event.description}</p>
                    {event.participantsCount !== undefined && event.participantsCount !== null && (
                      <div className="card-participants">
                        👥 {event.participantsCount}{' '}
                        {event.participantsCount === 1 ? 'uczestnik' : 'uczestników'}
                      </div>
                    )}
                    <div className="card-footer">
                      {event.eventDate && (
                        <time className="card-meta">
                          📅{' '}
                          {new Date(event.eventDate).toLocaleDateString('pl-PL', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </time>
                      )}
                      {event.location && <span className="card-meta">📍 {event.location}</span>}
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
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <h3>Brak wydarzeń</h3>
            <p>Nie ma jeszcze żadnych wydarzeń do wyświetlenia.</p>
            <Link
              href="/admin"
              className="btn btn-primary"
              style={{ marginTop: 'var(--spacing-6)' }}
            >
              Dodaj wydarzenie
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
