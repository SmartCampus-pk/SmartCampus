'use client'

import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import '../../styles.css'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  const { register, user, isLoading: authLoading } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo)
    }
  }, [user, authLoading, router, redirectTo])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Imię jest wymagane'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Nazwisko jest wymagane'
    }

    if (!formData.email.includes('@')) {
      newErrors.email = 'Nieprawidłowy adres email'
    }

    if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć minimum 8 znaków'
    }

    if (!/\d/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać cyfrę'
    }

    if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać dużą literę'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Hasła nie są identyczne'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    const result = await register(
      formData.email,
      formData.password,
      formData.firstName,
      formData.lastName,
    )

    if (result.success) {
      router.push(redirectTo)
    } else {
      setErrors({ general: result.error || 'Rejestracja nie powiodła się' })
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
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
            <h1>Zarejestruj się</h1>
            <p>Dołącz do społeczności Smart Campus</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {errors.general && (
              <div className="alert alert-error">
                <span>⚠️</span>
                <p>{errors.general}</p>
              </div>
            )}

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Imię</label>
                <input
                  type="text"
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  placeholder="Jan"
                  required
                  disabled={isLoading}
                  className={errors.firstName ? 'error' : ''}
                />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nazwisko</label>
                <input
                  type="text"
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  placeholder="Kowalski"
                  required
                  disabled={isLoading}
                  className={errors.lastName ? 'error' : ''}
                />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="twoj@email.com"
                required
                disabled={isLoading}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Hasło</label>
              <input
                type="password"
                id="password"
                value={formData.password}
                onChange={(e) => handleChange('password', e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={errors.password ? 'error' : ''}
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
              <span className="field-hint">Min. 8 znaków, cyfra i duża litera</span>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Potwierdź hasło</label>
              <input
                type="password"
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={(e) => handleChange('confirmPassword', e.target.value)}
                placeholder="••••••••"
                required
                disabled={isLoading}
                className={errors.confirmPassword ? 'error' : ''}
              />
              {errors.confirmPassword && (
                <span className="field-error">{errors.confirmPassword}</span>
              )}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <span className="spinner"></span>
                  Rejestracja...
                </>
              ) : (
                'Zarejestruj się'
              )}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Masz już konto?{' '}
              <Link
                href={`/login${redirectTo !== '/' ? `?redirect=${redirectTo}` : ''}`}
                className="link"
              >
                Zaloguj się
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

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="auth-page">
          <div className="auth-container">
            <div className="auth-card">
              <div className="auth-header">
                <h1>Zarejestruj się</h1>
                <p>Dołącz do społeczności Smart Campus</p>
              </div>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <span className="spinner"></span>
              </div>
            </div>
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
