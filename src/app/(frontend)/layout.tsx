import React from 'react'
import type { Viewport } from 'next'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation'
import './styles.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export const metadata = {
  description: 'Smart Campus - platforma wydarzeń kampusowych',
  title: 'Smart Campus',
  icons: {
    icon: '/favicon.ico',
  },
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="pl">
      <body>
        <AuthProvider>
          <Navigation />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  )
}
