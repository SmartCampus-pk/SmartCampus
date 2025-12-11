import React from 'react'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navigation } from '@/components/Navigation'
import './styles.css'

export const metadata = {
  description: 'Smart Campus - platforma wydarzeń kampusowych',
  title: 'Smart Campus',
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
