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

    // Verify event exists and is active
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

    if (event.status === 'cancelled') {
      return NextResponse.json({ error: 'Event is cancelled' }, { status: 400 })
    }

    if (event.deletedAt) {
      return NextResponse.json({ error: 'Event is deleted' }, { status: 400 })
    }

    // Check if already participating
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

    if (existing.docs.length > 0) {
      // Already participating - update status to 'going'
      const updated = await payload.update({
        collection: 'event-participations',
        id: existing.docs[0].id,
        data: {
          status: 'going',
        },
      })

      // Get current participants count
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
        message: 'Participation status updated',
        participation: updated,
        participantsCount: participantsCount.totalDocs,
      })
    }

    // Create new participation
    const participation = await payload.create({
      collection: 'event-participations',
      data: {
        event: eventId,
        user: user.id,
        status: 'going',
      },
    })

    // Get current participants count
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
      message: 'Successfully joined event',
      participation,
      participantsCount: participantsCount.totalDocs,
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
