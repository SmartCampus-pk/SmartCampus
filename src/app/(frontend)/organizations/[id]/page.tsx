'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import '../../styles.css'

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

interface Event {
  id: string
  title: string
  slug: string
  description: string
  eventDate: string
  location?: string
}

export default function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const [orgId, setOrgId] = useState<string | null>(null)
  const { user } = useAuth()
  const router = useRouter()
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Resolve params
  useEffect(() => {
    params.then((p) => setOrgId(p.id))
  }, [params])

  useEffect(() => {
    if (orgId) {
      fetchOrganization()
      fetchEvents()
    }
  }, [orgId])

  const fetchOrganization = async () => {
    if (!orgId) return
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: apiError } = await api.organizations.get(orgId)
      if (apiError || !data?.organization) {
        setError(apiError || 'Nie udało się pobrać organizacji')
        return
      }
      setOrganization(data.organization)
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania organizacji')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchEvents = async () => {
    if (!orgId) return
    try {
      // Fetch events for this organization using Payload API
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const now = new Date().toISOString()
      const response = await fetch(
        `/api/events?where[organization][equals]=${orgId}&where[eventDate][greater_than]=${now}&sort=eventDate&limit=10`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        },
      )
      const data = await response.json()
      if (response.ok && data?.docs) {
        setEvents(data.docs)
      }
    } catch (err) {
      console.error('Error fetching events:', err)
    }
  }

  const handleSave = async (formData: {
    description: string
    contactEmail: string
    contactPhone: string
    website: string
  }) => {
    if (!orgId) return
    try {
      setIsSaving(true)
      const { error: apiError } = await api.organizations.update(orgId, formData)
      if (apiError) {
        alert('Nie udało się zapisać zmian: ' + apiError)
        return
      }
      setIsEditModalOpen(false)
      fetchOrganization() // Refresh data
    } catch (err) {
      alert('Wystąpił błąd podczas zapisywania')
    } finally {
      setIsSaving(false)
    }
  }

  // Check if user can edit
  const canEdit =
    user &&
    (user.role === 'super-admin' ||
      (user.role === 'org-admin' &&
        typeof user.organization === 'string' &&
        user.organization === orgId))

  const typeLabels: Record<string, string> = {
    company: 'Firma',
    'scientific-circle': 'Koło naukowe',
    'student-organization': 'Organizacja studencka',
    faculty: 'Wydział',
    department: 'Katedra',
    'student-government': 'Samorząd studencki',
    other: 'Inne',
  }

  if (isLoading) {
    return (
      <div className="organization-single">
        <div className="container">
          <div className="organization-loading">
            <p>Ładowanie...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !organization) {
    return (
      <div className="organization-single">
        <div className="container">
          <div className="organization-error">
            <p>{error || 'Organizacja nie została znaleziona'}</p>
            <Link href="/organizations" className="btn btn-primary">
              Powrót do listy
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const logoUrl =
    typeof organization.logo === 'object' && organization.logo !== null
      ? organization.logo.url
      : organization.logo

  return (
    <div className="organization-single">
      <div className="container">
        <Link href="/organizations" className="back-link">
          ← Powrót do listy organizacji
        </Link>

        <div className="organization-single-header">
          {logoUrl && (
            <div className="organization-single-logo">
              <img src={logoUrl} alt={organization.name} />
            </div>
          )}
          <div className="organization-single-header-content">
            <div className="organization-single-header-top">
              <h1>{organization.name}</h1>
              {canEdit && (
                <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary">
                  Edytuj organizację
                </button>
              )}
            </div>
            {organization.type && (
              <span className="organization-single-type">
                {typeLabels[organization.type] || organization.type}
              </span>
            )}
          </div>
        </div>

        <div className="organization-single-content">
          <div className="organization-single-main">
            <section className="organization-section">
              <h2>O organizacji</h2>
              <p className="organization-description-full">{organization.description}</p>
            </section>

            <section className="organization-section">
              <h2>Kontakt</h2>
              <div className="organization-contact-details">
                {organization.contactEmail && (
                  <div className="organization-contact-detail">
                    <span className="organization-contact-label">Email:</span>
                    <a
                      href={`mailto:${organization.contactEmail}`}
                      className="organization-contact-link"
                    >
                      {organization.contactEmail}
                    </a>
                  </div>
                )}
                {organization.contactPhone && (
                  <div className="organization-contact-detail">
                    <span className="organization-contact-label">Telefon:</span>
                    <a
                      href={`tel:${organization.contactPhone}`}
                      className="organization-contact-link"
                    >
                      {organization.contactPhone}
                    </a>
                  </div>
                )}
                {organization.website && (
                  <div className="organization-contact-detail">
                    <span className="organization-contact-label">Strona internetowa:</span>
                    <a
                      href={organization.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="organization-contact-link"
                    >
                      {organization.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            </section>

            {events.length > 0 && (
              <section className="organization-section">
                <h2>Nadchodzące wydarzenia</h2>
                <div className="organization-events-list">
                  {events.map((event) => (
                    <Link
                      key={event.id}
                      href={`/events/${event.id}`}
                      className="organization-event-item"
                    >
                      <h3 className="organization-event-title">{event.title}</h3>
                      <div className="organization-event-meta">
                        {event.eventDate && (
                          <span className="organization-event-date">
                            📅{' '}
                            {new Date(event.eventDate).toLocaleDateString('pl-PL', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        )}
                        {event.location && (
                          <span className="organization-event-location">📍 {event.location}</span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && organization && (
        <EditOrganizationModal
          organization={organization}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}
    </div>
  )
}

// Edit Modal Component
function EditOrganizationModal({
  organization,
  onClose,
  onSave,
  isSaving,
}: {
  organization: Organization
  onClose: () => void
  onSave: (data: {
    description: string
    contactEmail: string
    contactPhone: string
    website: string
  }) => void
  isSaving: boolean
}) {
  const [formData, setFormData] = useState({
    description: organization.description || '',
    contactEmail: organization.contactEmail || '',
    contactPhone: organization.contactPhone || '',
    website: organization.website || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edytuj organizację</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label htmlFor="description" className="form-label">
              Opis
            </label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-input"
              rows={5}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactEmail" className="form-label">
              Email kontaktowy
            </label>
            <input
              id="contactEmail"
              type="email"
              value={formData.contactEmail}
              onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="contactPhone" className="form-label">
              Telefon kontaktowy
            </label>
            <input
              id="contactPhone"
              type="tel"
              value={formData.contactPhone}
              onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              className="form-input"
            />
          </div>

          <div className="form-field">
            <label htmlFor="website" className="form-label">
              Strona internetowa
            </label>
            <input
              id="website"
              type="url"
              value={formData.website}
              onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              className="form-input"
              placeholder="https://example.com"
            />
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Anuluj
            </button>
            <button type="submit" className="btn btn-primary" disabled={isSaving}>
              {isSaving ? 'Zapisywanie...' : 'Zapisz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
