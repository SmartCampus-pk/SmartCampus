'use client'

import { useRouter } from 'next/navigation'
import React, { useEffect, useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { api } from '@/lib/api'

interface JoinEventButtonProps {
  eventId: string
  initialParticipantsCount?: number
  initialIsJoined?: boolean
  onSuccess?: () => void
  onCountUpdate?: (count: number) => void
}

export function JoinEventButton({
  eventId,
  initialParticipantsCount = 0,
  initialIsJoined = false,
  onSuccess,
  onCountUpdate,
}: JoinEventButtonProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [isJoined, setIsJoined] = useState(initialIsJoined)
  const [isLoading, setIsLoading] = useState(false)
  const [participantsCount, setParticipantsCount] = useState(initialParticipantsCount)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    const loadParticipation = async () => {
      if (!user) {
        setIsJoined(false)
        return
      }

      const { data } = await api.events.participation(eventId, user.id)
      if (!isMounted) return

      const hasParticipation = Array.isArray(data?.docs) && data.docs.length > 0
      setIsJoined(hasParticipation)
    }

    loadParticipation()

    return () => {
      isMounted = false
    }
  }, [eventId, user?.id])

  const showSuccessToast = (message: string) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleJoin = async () => {
    if (!user) {
      router.push(`/login?redirect=/events/${eventId}`)
      return
    }

    setIsLoading(true)
    const { data, error } = await api.events.join(eventId)

    if (error) {
      alert(error)
      setIsLoading(false)
      return
    }

    if (data) {
      setIsJoined(true)
      const newCount = data.participantsCount || participantsCount + 1
      setParticipantsCount(newCount)
      onCountUpdate?.(newCount)
      showSuccessToast('Dołączyłeś do wydarzenia! 🎉')
      onSuccess?.()
    }

    setIsLoading(false)
  }

  const handleLeave = async () => {
    const confirmed = confirm('Czy na pewno chcesz opuścić to wydarzenie?')
    if (!confirmed) return

    setIsLoading(true)
    const { data, error } = await api.events.leave(eventId)

    if (error) {
      alert(error)
      setIsLoading(false)
      return
    }

    if (data) {
      setIsJoined(false)
      const newCount = data.participantsCount || Math.max(0, participantsCount - 1)
      setParticipantsCount(newCount)
      onCountUpdate?.(newCount)
      showSuccessToast('Opusciłeś wydarzenie')
      onSuccess?.()
    }

    setIsLoading(false)
  }

  if (!user) {
    return (
      <button
        onClick={() => router.push(`/login?redirect=/events/${eventId}`)}
        className="btn btn-primary btn-full"
      >
        Zaloguj się, aby dołączyć
      </button>
    )
  }

  return (
    <>
      {isJoined ? (
        <button onClick={handleLeave} disabled={isLoading} className="btn btn-secondary btn-full">
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Opuszczanie...
            </>
          ) : (
            '✓ Dołączono · Opuść wydarzenie'
          )}
        </button>
      ) : (
        <button onClick={handleJoin} disabled={isLoading} className="btn btn-primary btn-full">
          {isLoading ? (
            <>
              <span className="spinner"></span>
              Dołączanie...
            </>
          ) : (
            'Dołącz do wydarzenia'
          )}
        </button>
      )}

      {showToast && (
        <div className="toast toast-success">
          <span>{toastMessage}</span>
        </div>
      )}
    </>
  )
}
