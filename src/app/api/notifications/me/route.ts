import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = parseInt(searchParams.get('limit') || '20', 10)

    // Get notifications for the user with pagination
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        user: {
          equals: user.id,
        },
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
    console.error('Get notifications error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get notifications' },
      { status: 400 },
    )
  }
}
