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
        <NavigationMenu.List className="navigation-list">
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/" className="navigation-link">
                Strona główna
              </Link>
            </NavigationMenu.Link>
          </NavigationMenu.Item>
          <NavigationMenu.Item>
            <NavigationMenu.Link asChild>
              <Link href="/events" className="navigation-link">
                Wydarzenia
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
