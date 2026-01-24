import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'
import { checkRateLimit, getRemainingTime } from '@/lib/rateLimiter'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      logger.warn('Notifications fetch attempted without authentication')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Light rate limiting for notifications fetch to avoid scraping
    const userIdentifier = `notifications:user:${user.id}`
    if (!checkRateLimit(userIdentifier, 60, 60 * 1000)) {
      const remaining = getRemainingTime(userIdentifier)
      return NextResponse.json(
        {
          error: `Too many requests for notifications. Try again in ${remaining} seconds.`,
          remainingTime: remaining,
        },
        { status: 429 },
      )
    }

    // Light rate limiting for notifications fetch to avoid scraping
    const userIdentifier = `notifications:user:${user.id}`
    if (!checkRateLimit(userIdentifier, 60, 60 * 1000)) {
      const remaining = getRemainingTime(userIdentifier)
      return NextResponse.json(
        {
          error: `Too many requests for notifications. Try again in ${remaining} seconds.`,
          remainingTime: remaining,
        },
        { status: 429 },
      )
    }

    // Get pagination and filter parameters from query string
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)
    const type = searchParams.get('type')
    const unreadOnly = searchParams.get('unreadOnly') === 'true'

    // Build where clause with filters
    const whereConditions: any[] = [{ user: { equals: user.id } }]

    if (type && (type === 'event_update' || type === 'announcement')) {
      whereConditions.push({ type: { equals: type } })
    }

    if (unreadOnly) {
      whereConditions.push({ isRead: { equals: false } })
    }

    // Get notifications for the user with pagination
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        and: whereConditions,
      },
      limit,
      page,
      sort: '-createdAt', // Most recent first
      depth: 2, // Populate relationships
    })

    return NextResponse.json({
      notifications: notifications.docs,
      totalDocs: notifications.totalDocs,
      totalPages: Math.ceil(notifications.totalDocs / limit),
      page,
      limit,
      hasNextPage: notifications.hasNextPage,
      hasPrevPage: notifications.hasPrevPage,
    })
  } catch (error: any) {
    let errorContext: any = {}
    try {
      const payloadConfig = await config
      const payloadInstance = await getPayload({ config: payloadConfig })
      const authResult = await payloadInstance
        .auth({ headers: request.headers })
        .catch(() => ({ user: null }))
      if (authResult.user) {
        errorContext.userId = authResult.user.id
      }
      const { searchParams } = new URL(request.url)
      errorContext.page = searchParams.get('page') || '1'
      errorContext.limit = searchParams.get('limit') || '10'
    } catch {
      // auth/params not available
    }
    logger.error('Get notifications error', error, errorContext)
    return NextResponse.json(
      { error: error.message || 'Failed to get notifications' },
      { status: 400 },
    )
  }
}
