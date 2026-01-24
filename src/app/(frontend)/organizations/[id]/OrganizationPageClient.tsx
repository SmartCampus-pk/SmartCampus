'use client'

import Link from 'next/link'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import { ErrorAlert } from '@/components/AlertDialog'

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

interface OrganizationPageClientProps {
  organization: Organization
  events: Event[]
}

export function OrganizationPageClient({
  organization,
  events: initialEvents,
}: OrganizationPageClientProps) {
  const { user } = useAuth()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [events] = useState<Event[]>(initialEvents)
  const [org, setOrg] = useState<Organization>(organization)
  const [isFollowing, setIsFollowing] = useState(false)
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null)
  const [isLoadingFollow, setIsLoadingFollow] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')
  const [showError, setShowError] = useState(false)

  // Check if user is following this organization
  useEffect(() => {
    if (user) {
      checkFollowStatus()
    } else {
      setIsLoadingFollow(false)
    }
  }, [user, org.id])

  const checkFollowStatus = async () => {
    try {
      setIsLoadingFollow(true)
      const { data } = await api.subscriptions.check('organization', org.id)
      if (data?.subscribed) {
        setIsFollowing(true)
        setSubscriptionId(data.subscription?.id || null)
      } else {
        setIsFollowing(false)
        setSubscriptionId(null)
      }
    } catch (err) {
      console.error('Failed to check follow status:', err)
    } finally {
      setIsLoadingFollow(false)
    }
  }

  const handleFollow = async () => {
    if (!user) return

    try {
      setIsLoadingFollow(true)
      if (isFollowing && subscriptionId) {
        await api.subscriptions.unsubscribe(subscriptionId)
        setIsFollowing(false)
        setSubscriptionId(null)
      } else {
        const { data } = await api.subscriptions.subscribe('organization', org.id)
        if (data?.subscription) {
          setIsFollowing(true)
          setSubscriptionId(data.subscription.id)
        }
      }
    } catch (err) {
      console.error('Failed to toggle follow:', err)
    } finally {
      setIsLoadingFollow(false)
    }
  }

  const handleSave = async (formData: {
    description: string
    contactEmail: string
    contactPhone: string
    website: string
  }) => {
    try {
      setIsSaving(true)
      const { error: apiError } = await api.organizations.update(org.id, formData)
      if (apiError) {
        setErrorMessage('Nie udało się zapisać zmian: ' + apiError)
        setShowError(true)
        return
      }
      setOrg({ ...org, ...formData })
      setIsEditModalOpen(false)
    } catch (err) {
      setErrorMessage('Wystąpił błąd podczas zapisywania')
      setShowError(true)
    } finally {
      setIsSaving(false)
    }
  }

  const canEdit =
    user &&
    (user.role === 'super-admin' ||
      (user.role === 'org-admin' &&
        typeof user.organization === 'string' &&
        user.organization === org.id))

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
    <div className="organization-single">
      <div className="container">
        <Link href="/organizations" className="back-link">
          ← Powrót do organizacji
        </Link>

        <div className="organization-single-header">
          <div>
            <div className="organization-single-title">
              <h1>{org.name}</h1>
              <div className="organization-single-actions">
                {user && (
                  <button
                    onClick={handleFollow}
                    disabled={isLoadingFollow}
                    className={`btn ${isFollowing ? 'btn-secondary' : 'btn-primary'} follow-button`}
                  >
                    {isLoadingFollow ? (
                      <span className="button-spinner" />
                    ) : isFollowing ? (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M13.854 3.646a.5.5 0 010 .708l-7 7a.5.5 0 01-.708 0l-3.5-3.5a.5.5 0 11.708-.708L6.5 10.293l6.646-6.647a.5.5 0 01.708 0z" />
                        </svg>
                        Obserwujesz
                      </>
                    ) : (
                      <>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                          <path d="M8 16a2 2 0 002-2H6a2 2 0 002 2zM8 1.918l-.797.161A4.002 4.002 0 004 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 00-3.203-3.92L8 1.917z" />
                        </svg>
                        Obserwuj
                      </>
                    )}
                  </button>
                )}
                {canEdit && (
                  <button onClick={() => setIsEditModalOpen(true)} className="btn btn-primary">
                    Edytuj organizację
                  </button>
                )}
              </div>
            </div>
            {org.type && (
              <span className="organization-single-type">{typeLabels[org.type] || org.type}</span>
            )}
          </div>
        </div>

        <div className="organization-single-content">
          <div className="organization-single-main">
            <section className="organization-section">
              <h2>O organizacji</h2>
              <p className="organization-description-full">{org.description}</p>
            </section>

            <section className="organization-section">
              <h2>Kontakt</h2>
              <div className="organization-contact-details">
                {org.contactEmail && (
                  <div className="organization-contact-detail">
                    <span className="organization-contact-label">Email:</span>
                    <a href={`mailto:${org.contactEmail}`} className="organization-contact-link">
                      {org.contactEmail}
                    </a>
                  </div>
                )}
                {org.contactPhone && (
                  <div className="organization-contact-detail">
                    <span className="organization-contact-label">Telefon:</span>
                    <a href={`tel:${org.contactPhone}`} className="organization-contact-link">
                      {org.contactPhone}
                    </a>
                  </div>
                )}
                {org.website && (
                  <div className="organization-contact-detail">
                    <span className="organization-contact-label">Strona internetowa:</span>
                    <a
                      href={org.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="organization-contact-link"
                    >
                      {org.website.replace(/^https?:\/\//, '')}
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
      {isEditModalOpen && (
        <EditOrganizationModal
          organization={org}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      <ErrorAlert open={showError} onOpenChange={setShowError} message={errorMessage} />
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
