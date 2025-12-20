'use client'

import { useState } from 'react'
import { JoinEventButton } from './JoinEventButton'

interface EventActionsProps {
  eventId: string
  initialParticipantsCount: number
  initialIsJoined: boolean
}

export function EventActions({ eventId, initialParticipantsCount, initialIsJoined }: EventActionsProps) {
  const [participantsCount, setParticipantsCount] = useState(initialParticipantsCount)

  const handleCountUpdate = (newCount: number) => {
    setParticipantsCount(newCount)
  }

  return (
    <>
      {participantsCount !== undefined && participantsCount !== null && (
        <div className="event-participants" style={{ marginTop: 'var(--spacing-4)' }}>
          👥 {participantsCount} {participantsCount === 1 ? 'uczestnik' : 'uczestników'}
        </div>
      )}

      <div style={{ marginTop: 'var(--spacing-6)' }}>
        <JoinEventButton
          eventId={eventId}
          initialParticipantsCount={participantsCount}
          initialIsJoined={initialIsJoined}
          onCountUpdate={handleCountUpdate}
        />
      </div>
    </>
  )
}
