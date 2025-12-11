'use client'

import { useState } from 'react'
import { JoinEventButton } from './JoinEventButton'

interface EventActionsProps {
  eventId: string
  initialParticipantsCount: number
}

export function EventActions({ eventId, initialParticipantsCount }: EventActionsProps) {
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
          onCountUpdate={handleCountUpdate}
        />
      </div>
    </>
  )
}
