'use client'

import * as NavigationMenu from '@radix-ui/react-navigation-menu'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'

export function Navigation() {
  const { user, logout, isLoading } = useAuth()
  const router = useRouter()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    setIsUserMenuOpen(false)

    try {
      await logout()
      // Redirect to home page after successful logout
      router.push('/')
      router.refresh() // Refresh to clear any cached data
    } catch (error) {
      console.error('Logout error:', error)
      // Still redirect even if there was an error
      router.push('/')
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <NavigationMenu.Root className="navigation-root">
      <div className="navigation-container">
        <Link href="/" className="navigation-brand">
          Smart Campus
        </Link>
        <NavigationMenu.List
          className="navigation-list"
          // style={{ position: 'absolute', top: '50%', transform: 'translateY(-50%)' }}
        >
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/events" className="navigation-link">
                Wydarzenia
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/organizations" className="navigation-link">
                Organizacje
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
        </NavigationMenu.List>

        <div className="navigation-auth">
          {isLoading ? (
            <div className="auth-skeleton"></div>
          ) : user ? (
            <div className="user-menu">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="user-menu-trigger"
              >
                <span className="user-avatar">
                  {user.firstName?.[0] || user.email[0].toUpperCase()}
                  {user.lastName?.[0] || ''}
                </span>
                <span className="user-name">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.email}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                  <path d="M6 8L2 4h8l-4 4z" />
                </svg>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="user-menu-overlay" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="user-menu-dropdown">
                    <div className="user-menu-header">
                      <p className="user-menu-name">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.email}
                      </p>
                      {user.firstName && user.lastName && (
                        <p className="user-menu-email">{user.email}</p>
                      )}
                    </div>
                    <div className="user-menu-divider" />
                    {(user.role === 'org-admin' || user.role === 'super-admin') &&
                      user.organization && (
                        <>
                          <Link
                            href="/organizer/dashboard"
                            className="user-menu-item user-menu-item-primary"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                              <path d="M1 3a1 1 0 011-1h12a1 1 0 011 1H1zm7 8a2 2 0 100-4 2 2 0 000 4z" />
                              <path d="M0 5a2 2 0 012-2h12a2 2 0 012 2v6a2 2 0 01-2 2H2a2 2 0 01-2-2V5zm2-1a1 1 0 00-1 1v6a1 1 0 001 1h12a1 1 0 001-1V5a1 1 0 00-1-1H2z" />
                            </svg>
                            Panel Organizatora
                          </Link>
                          <div className="user-menu-divider" />
                        </>
                      )}
                    <Link
                      href="/notifications"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 16a2 2 0 002-2H6a2 2 0 002 2zM8 1.918l-.797.161A4.002 4.002 0 004 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 00-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 111.99 0A5.002 5.002 0 0113 6c0 .88.32 4.2 1.22 6z" />
                      </svg>
                      Powiadomienia
                    </Link>
                    <Link
                      href="/profile"
                      className="user-menu-item"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M8 8a3 3 0 100-6 3 3 0 000 6zm2-3a2 2 0 11-4 0 2 2 0 014 0zm4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z" />
                      </svg>
                      Mój profil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="user-menu-item"
                      disabled={isLoggingOut}
                    >
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                        <path d="M3 2h6v2H3v8h6v2H3a2 2 0 01-2-2V4a2 2 0 012-2zm7 3l4 3-4 3V9H6V7h4V5z" />
                      </svg>
                      {isLoggingOut ? 'Wylogowywanie...' : 'Wyloguj się'}
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="auth-links">
              <Link href="/login" className="auth-link">
                Zaloguj się
              </Link>
              <Link href="/register" className="auth-link auth-link-primary">
                Zarejestruj się
              </Link>
            </div>
          )}
        </div>
      </div>
    </NavigationMenu.Root>
  )
}
