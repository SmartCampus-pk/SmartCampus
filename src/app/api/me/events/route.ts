import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      logger.warn('User events fetch attempted without authentication')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all participations for the user with status 'going' or 'interested'
    const participations = await payload.find({
      collection: 'event-participations',
      where: {
        and: [
          {
            user: {
              equals: user.id,
            },
          },
          {
            status: {
              in: ['going', 'interested'],
            },
          },
        ],
      },
      limit: 1000,
      depth: 2, // Populate event relationships
    })

    // Extract events and enrich with status information
    const now = new Date()
    const events = participations.docs.map((participation) => {
      const event =
        typeof participation.event === 'object' && participation.event !== null
          ? participation.event
          : null

      if (!event || !event.eventDate) {
        return null
      }

      const eventDate = new Date(event.eventDate)
      let eventStatus: 'upcoming' | 'ongoing' | 'past' = 'upcoming'

      if (eventDate < now) {
        eventStatus = 'past'
      } else if (event.endDate) {
        const endDate = new Date(event.endDate)
        if (eventDate <= now && now <= endDate) {
          eventStatus = 'ongoing'
        }
      } else {
        // If no endDate, consider it ongoing if it's today or past
        const eventDateOnly = new Date(eventDate)
        eventDateOnly.setHours(0, 0, 0, 0)
        const nowDateOnly = new Date(now)
        nowDateOnly.setHours(0, 0, 0, 0)

        if (eventDateOnly.getTime() === nowDateOnly.getTime()) {
          eventStatus = 'ongoing'
        } else if (eventDate < now) {
          eventStatus = 'past'
        }
      }

      return {
        ...event,
        participationStatus: participation.status,
        participationId: participation.id,
        eventStatus, // upcoming, ongoing, or past
      }
    })

    // Filter out null events and sort by eventDate
    const validEvents = events.filter((e) => e !== null) as any[]
    validEvents.sort((a, b) => {
      const dateA = new Date(a.eventDate).getTime()
      const dateB = new Date(b.eventDate).getTime()
      return dateB - dateA // Most recent first
    })

    // Separate into upcoming and past
    const upcoming = validEvents.filter(
      (e) => e.eventStatus === 'upcoming' || e.eventStatus === 'ongoing',
    )
    const past = validEvents.filter((e) => e.eventStatus === 'past')

    return NextResponse.json({
      events: validEvents,
      upcoming,
      past,
      total: validEvents.length,
    })
  } catch (error: any) {
    let userId = 'unknown'
    try {
      const payloadConfig = await config
      const payloadInstance = await getPayload({ config: payloadConfig })
      const authResult = await payloadInstance
        .auth({ headers: request.headers })
        .catch(() => ({ user: null }))
      if (authResult.user) {
        userId = authResult.user.id
      }
    } catch {
      // auth not available
    }
    logger.error('Get user events error', error, { userId })
    return NextResponse.json(
      { error: error.message || 'Failed to get user events' },
      { status: 400 },
    )
  }
}
