'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'
import '../styles.css'

interface UserProfile {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role?: string
  organization?: string | { id: string; name: string }
  createdAt?: string
}

export default function ProfilePage() {
  const { user: authUser, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not authenticated
    if (!authLoading && !authUser) {
      router.push('/login')
      return
    }

    // Fetch user data if authenticated
    if (authUser) {
      fetchUserData()
    }
  }, [authUser, authLoading, router])

  const fetchUserData = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: apiError } = await api.auth.me()
      if (apiError || !data?.user) {
        setError(apiError || 'Nie udało się pobrać danych użytkownika')
        return
      }
      setUser(data.user)
    } catch (err) {
      setError('Wystąpił błąd podczas pobierania danych')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-loading">
            <p>Ładowanie...</p>
          </div>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="profile-page">
        <div className="container">
          <div className="profile-error">
            <p>{error}</p>
            <button onClick={fetchUserData} className="btn btn-primary">
              Spróbuj ponownie
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show profile
  if (!user) {
    return null
  }

  const roleLabels: Record<string, string> = {
    student: 'Student',
    organizer: 'Organizator',
    admin: 'Administrator',
    'org-admin': 'Administrator organizacji',
    'super-admin': 'Super administrator',
  }

  const roleLabel = user.role ? roleLabels[user.role] || user.role : 'Użytkownik'
  const organizationName =
    typeof user.organization === 'object' && user.organization !== null
      ? user.organization.name
      : user.organization

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>Mój profil</h1>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <div className="profile-avatar">
              {user.firstName?.[0] || user.email[0].toUpperCase()}
              {user.lastName?.[0] || ''}
            </div>
            <div className="profile-card-actions">
              <button className="btn btn-secondary" disabled>
                Edytuj profil
              </button>
            </div>
          </div>

          <div className="profile-card-body">
            <div className="profile-field">
              <label className="profile-field-label">Imię i nazwisko</label>
              <div className="profile-field-value">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : 'Nie podano'}
              </div>
            </div>

            <div className="profile-field">
              <label className="profile-field-label">Email</label>
              <div className="profile-field-value">{user.email}</div>
            </div>

            <div className="profile-field">
              <label className="profile-field-label">Rola</label>
              <div className="profile-field-value">
                <span className="profile-role-badge">{roleLabel}</span>
              </div>
            </div>

            {organizationName && (
              <div className="profile-field">
                <label className="profile-field-label">Organizacja</label>
                <div className="profile-field-value">{organizationName}</div>
              </div>
            )}

            {user.createdAt && (
              <div className="profile-field">
                <label className="profile-field-label">Data rejestracji</label>
                <div className="profile-field-value">
                  {new Date(user.createdAt).toLocaleDateString('pl-PL', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
