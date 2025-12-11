'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import '../../styles.css'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const { login, user, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    const result = await login(email, password)

    if (result.success) {
      router.push(redirectTo)
    } else {
      setError(result.error || 'Nieprawidłowy email lub hasło')
      setIsLoading(false)
    }
  }

  if (authLoading || user) {
    return null
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <h1>Zaloguj się</h1>
            <p>Witaj z powrotem w Smart Campus</p>
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

            <div className="form-group">
              <label htmlFor="password">Hasło</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-5)',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-2)',
                  cursor: 'pointer',
                  fontSize: '0.9375rem',
                }}
              >
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  disabled={isLoading}
                />
                Zapamiętaj mnie
              </label>
              <Link href="/forgot-password" className="link" style={{ fontSize: '0.9375rem' }}>
                Zapomniałeś hasła?
              </Link>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Logowanie...
                </>
              ) : (
                'Zaloguj się'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Nie masz konta?{' '}
              <Link
                href={`/register${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}
                className="link"
              >
                Zarejestruj się
              </Link>
            </p>
            <Link href="/" className="link-secondary">
              ← Powrót do strony głównej
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
