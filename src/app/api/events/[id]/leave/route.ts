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

    // Remove event subscription
    try {
      const existingSubscription = await payload.find({
        collection: 'subscriptions',
        where: {
          and: [
            { user: { equals: user.id } },
            { type: { equals: 'event' } },
            { event: { equals: eventId } },
          ],
        },
        limit: 1,
      })

      if (existingSubscription.docs.length > 0) {
        await payload.delete({
          collection: 'subscriptions',
          id: existingSubscription.docs[0].id,
        })
      }
    } catch (subError) {
      // Log but don't fail - unsubscription is secondary
      console.error('Failed to remove event subscription:', subError)
    }

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
