'use client'

import Link from 'next/link'
import React, { useState } from 'react'

interface Organization {
  id: string
  name: string
  slug: string
  description: string
  type: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  logo?: string | { url?: string }
}

interface OrganizationsPageClientProps {
  initialOrganizations: Organization[]
}

export function OrganizationsPageClient({ initialOrganizations }: OrganizationsPageClientProps) {
  const [organizations, setOrganizations] = useState<Organization[]>(initialOrganizations)
  const [searchQuery, setSearchQuery] = useState('')

  const performSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setOrganizations(initialOrganizations)
      return
    }

    const filtered = initialOrganizations.filter(
      (org) =>
        org.name.toLowerCase().includes(query.toLowerCase()) ||
        org.description.toLowerCase().includes(query.toLowerCase()),
    )
    setOrganizations(filtered)
  }

  const typeLabels: Record<string, string> = {
    company: 'Firma',
    'scientific-circle': 'Koło naukowe',
    'student-organization': 'Organizacja studencka',
    faculty: 'Wydział',
    department: 'Katedra',
    'student-government': 'Samorząd studencki',
    other: 'Inne',
  }

  return (
    <div className="organizations-page">
      <div className="container">
        <Link href="/" className="back-link">
          ← Powrót
        </Link>
        <div className="organizations-header">
          <h1>Organizacje</h1>
          <p className="organizations-subtitle">
            Przeglądaj organizacje, koła naukowe i samorządy na kampusie
          </p>
        </div>

        {/* Search */}
        <div className="organizations-search">
          <input
            type="text"
            placeholder="Szukaj po nazwie..."
            value={searchQuery}
            onChange={(e) => performSearch(e.target.value)}
            className="organizations-search-input"
          />
        </div>

        {/* Organizations list */}
        {organizations.length === 0 ? (
          <div className="organizations-empty">
            <div className="organizations-empty-icon">🏢</div>
            <h2>Brak organizacji</h2>
            <p>
              {searchQuery
                ? 'Nie znaleziono organizacji pasujących do wyszukiwania.'
                : 'Nie znaleziono żadnych organizacji.'}
            </p>
            {!searchQuery && (
              <Link
                href="/events"
                className="btn btn-primary"
                style={{ marginTop: 'var(--spacing-4)' }}
              >
                Przeglądaj wydarzenia
              </Link>
            )}
          </div>
        ) : (
          <div className="organizations-grid">
            {organizations.map((org) => {
              const logoUrl =
                typeof org.logo === 'object' && org.logo !== null ? org.logo.url : org.logo

              return (
                <div key={org.id} className="organization-card">
                  {logoUrl && (
                    <div className="organization-logo">
                      <img src={logoUrl} alt={org.name} />
                    </div>
                  )}
                  <div className="organization-content">
                    <div className="organization-header">
                      <h3 className="organization-name">{org.name}</h3>
                      {org.type && (
                        <span className="organization-type">
                          {typeLabels[org.type] || org.type}
                        </span>
                      )}
                    </div>
                    <p className="organization-description">{org.description}</p>
                    <div className="organization-contact">
                      {org.contactEmail && (
                        <div className="organization-contact-item">
                          <span className="organization-contact-label">Email:</span>
                          <a
                            href={`mailto:${org.contactEmail}`}
                            className="organization-contact-value"
                          >
                            {org.contactEmail}
                          </a>
                        </div>
                      )}
                      {org.contactPhone && (
                        <div className="organization-contact-item">
                          <span className="organization-contact-label">Telefon:</span>
                          <a
                            href={`tel:${org.contactPhone}`}
                            className="organization-contact-value"
                          >
                            {org.contactPhone}
                          </a>
                        </div>
                      )}
                      {org.website && (
                        <div className="organization-contact-item">
                          <span className="organization-contact-label">Strona:</span>
                          <a
                            href={org.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="organization-contact-value"
                          >
                            {org.website.replace(/^https?:\/\//, '')}
                          </a>
                        </div>
                      )}
                    </div>
                    <Link href={`/organizations/${org.id}`} className="organization-link">
                      Zobacz szczegóły →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
