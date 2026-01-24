import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      logger.warn('Subscription creation attempted without authentication')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { type, event, organization } = body

    // Validate required fields
    if (!type || (type !== 'event' && type !== 'organization')) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "event" or "organization"' },
        { status: 400 },
      )
    }

    if (type === 'event' && !event) {
      return NextResponse.json({ error: 'Event is required when type is "event"' }, { status: 400 })
    }

    if (type === 'organization' && !organization) {
      return NextResponse.json(
        { error: 'Organization is required when type is "organization"' },
        { status: 400 },
      )
    }

    // Check for duplicates - user can only subscribe once to the same event/organization
    const whereClause: any = {
      and: [
        {
          user: {
            equals: user.id,
          },
        },
      ],
    }

    if (type === 'event') {
      whereClause.and.push({
        type: {
          equals: 'event',
        },
      })
      whereClause.and.push({
        event: {
          equals: event,
        },
      })
    } else {
      whereClause.and.push({
        type: {
          equals: 'organization',
        },
      })
      whereClause.and.push({
        organization: {
          equals: organization,
        },
      })
    }

    const existing = await payload.find({
      collection: 'subscriptions',
      where: whereClause,
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json(
        {
          subscribed: true,
          subscription: existing.docs[0],
          message: 'Already subscribed',
        },
        { status: 200 },
      )
    }

    // Create subscription
    const subscription = await payload.create({
      collection: 'subscriptions',
      data: {
        user: user.id,
        type,
        ...(type === 'event' ? { event } : { organization }),
      },
    })

    logger.info('Subscription created', { userId: user.id, type, event, organization })
    return NextResponse.json(
      {
        subscribed: true,
        subscription,
        message: 'Successfully subscribed',
      },
      { status: 201 },
    )
  } catch (error: any) {
    let errorContext: any = {}
    try {
      const body = await request.json().catch(() => ({}))
      errorContext = { type: body.type, event: body.event, organization: body.organization }
    } catch {
      // body not available
    }
    logger.error('Subscription creation error', error, errorContext)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 400 },
    )
  }
}
