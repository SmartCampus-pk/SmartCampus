'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { api } from '@/lib/api'
import '../styles.css'

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

export default function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    fetchOrganizations()
  }, [debouncedSearch])

  const fetchOrganizations = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: apiError } = await api.organizations.list(debouncedSearch || undefined)
      if (apiError || !data) {
        setError(apiError || 'Nie udało się pobrać organizacji')
        return
      }
      setOrganizations(data.organizations || [])
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania organizacji')
    } finally {
      setIsLoading(false)
    }
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
            onChange={(e) => setSearchQuery(e.target.value)}
            className="organizations-search-input"
          />
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="organizations-loading">
            <p>Ładowanie...</p>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div className="organizations-error">
            <p>{error}</p>
            <button onClick={fetchOrganizations} className="btn btn-primary">
              Spróbuj ponownie
            </button>
          </div>
        )}

        {/* Organizations list */}
        {!isLoading && !error && (
          <>
            {organizations.length === 0 ? (
              <div className="organizations-empty">
                <div className="organizations-empty-icon">🏢</div>
                <h2>Brak organizacji</h2>
                <p>
                  {debouncedSearch
                    ? 'Nie znaleziono organizacji pasujących do wyszukiwania.'
                    : 'Nie znaleziono żadnych organizacji.'}
                </p>
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
          </>
        )}
      </div>
    </div>
  )
}
