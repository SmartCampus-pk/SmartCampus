'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { api } from '@/lib/api'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: string
  organization?: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  register: (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
  ) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const savedToken = localStorage.getItem('token')
      if (!savedToken) {
        setIsLoading(false)
        return
      }

      setToken(savedToken)

      // Verify token and get user data
      const { data, error } = await api.auth.me()
      if (error || !data?.user) {
        // Token invalid, clear it
        localStorage.removeItem('token')
        setToken(null)
      } else {
        setUser(data.user)
      }

      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string) => {
    const { data, error } = await api.auth.login(email, password)

    if (error || !data) {
      return { success: false, error: error || 'Login failed' }
    }

    // Save token and user
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)

    return { success: true }
  }

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const { data, error } = await api.auth.register(email, password, firstName, lastName)

    if (error || !data) {
      return { success: false, error: error || 'Registration failed' }
    }

    // Auto-login after registration
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(data.user)

    return { success: true }
  }

  const logout = () => {
    // Call logout endpoint (fire and forget)
    api.auth.logout()

    // Clear local state
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
  }

  const refreshUser = async () => {
    if (!token) return

    const { data } = await api.auth.me()
    if (data?.user) {
      setUser(data.user)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
