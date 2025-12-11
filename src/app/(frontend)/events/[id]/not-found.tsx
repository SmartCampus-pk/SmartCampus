import Link from 'next/link'
import React from 'react'

import { Navigation } from '@/components/Navigation'
import '../../styles.css'

export default function NotFound() {
  return (
    <div className="event-single">
      <Navigation />
      <div className="container">
        <div className="not-found-page">
          <div className="not-found-icon">🔍</div>
          <h1>Wydarzenie nie znalezione</h1>
          <p className="not-found-description">
            Przepraszamy, nie znaleźliśmy wydarzenia o podanym adresie.
          </p>
          <div className="not-found-actions">
            <Link href="/events" className="cta-button">
              ← Powrót do listy wydarzeń
            </Link>
            <Link href="/" className="back-link-alt">
              Strona główna
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
