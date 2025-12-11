'use client'

import Link from 'next/link'
import { useState } from 'react'
import '../../styles.css'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    // TODO: Implement password reset endpoint
    // For now, just show success message
    setTimeout(() => {
      setSuccess(true)
      setIsLoading(false)
    }, 1000)
  }

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <h1>Sprawdź swoją skrzynkę</h1>
              <p>
                Jeśli konto o podanym adresie email istnieje, wysłaliśmy na nie link do resetowania
                hasła.
              </p>
            </div>

            <div className="auth-footer">
              <Link href="/login" className="link">
                ← Powrót do logowania
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Zresetuj hasło</h1>
            <p>Podaj adres email przypisany do Twojego konta</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {error && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <p>{error}</p>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="twoj@email.com"
                required
                disabled={isLoading}
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Wysyłanie...
                </>
              ) : (
                'Wyślij link resetujący'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <Link href="/login" className="link-secondary">
              ← Powrót do logowania
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
