import Link from 'next/link'
import React from 'react'

import '../../styles.css'

export default function NotFound() {
  return (
    <div className="event-single">
      <div className="container">
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <h1>Wydarzenie nie znalezione</h1>
          <p>Przepraszamy, nie znaleźliśmy wydarzenia o podanym adresie.</p>
          <Link
            href="/events"
            className="back-link"
            style={{ marginTop: '24px', display: 'inline-block' }}
          >
            ← Powrót do listy wydarzeń
          </Link>
        </div>
      </div>
    </div>
  )
}
