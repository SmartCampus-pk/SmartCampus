import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const eventId = searchParams.get('event')
    const organizationId = searchParams.get('organization')

    if (!type || (type !== 'event' && type !== 'organization')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "event" or "organization"' },
        { status: 400 },
      )
    }

    const whereClause: any = {
      and: [{ user: { equals: user.id } }, { type: { equals: type } }],
    }

    if (type === 'event') {
      if (!eventId) {
        return NextResponse.json({ error: 'Event ID required' }, { status: 400 })
      }
      whereClause.and.push({ event: { equals: eventId } })
    } else {
      if (!organizationId) {
        return NextResponse.json({ error: 'Organization ID required' }, { status: 400 })
      }
      whereClause.and.push({ organization: { equals: organizationId } })
    }

    const subscription = await payload.find({
      collection: 'subscriptions',
      where: whereClause,
      limit: 1,
    })

    if (subscription.docs.length > 0) {
      return NextResponse.json({
        subscribed: true,
        subscription: subscription.docs[0],
      })
    }

    return NextResponse.json({ subscribed: false })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to check subscription' },
      { status: 400 },
    )
  }
}
