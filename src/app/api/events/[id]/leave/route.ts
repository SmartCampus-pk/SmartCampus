import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from headers
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Verify event exists
    let event
    try {
      event = await payload.findByID({
        collection: 'events',
        id: eventId,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }

    // Find participation
    const existing = await payload.find({
      collection: 'event-participations',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            user: {
              equals: user.id,
            },
          },
        ],
      },
      limit: 1,
    })

    if (existing.docs.length === 0) {
      return NextResponse.json({ error: 'Not participating in this event' }, { status: 404 })
    }

    // Update status to cancelled
    const updated = await payload.update({
      collection: 'event-participations',
      id: existing.docs[0].id,
      data: {
        status: 'cancelled',
      },
    })

    // Get current participants count (after leaving)
    const participantsCount = await payload.count({
      collection: 'event-participations',
      where: {
        and: [
          {
            event: {
              equals: eventId,
            },
          },
          {
            status: {
              equals: 'going',
            },
          },
        ],
      },
    })

    return NextResponse.json({
      message: 'Successfully left event',
      participation: updated,
      participantsCount: participantsCount.totalDocs,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
