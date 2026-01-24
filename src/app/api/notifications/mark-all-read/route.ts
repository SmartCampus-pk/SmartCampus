import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Find all unread notifications for user
    const unreadNotifications = await payload.find({
      collection: 'notifications',
      where: {
        and: [{ user: { equals: user.id } }, { isRead: { equals: false } }],
      },
      limit: 1000,
    })

    // Update all to read
    const updatePromises = unreadNotifications.docs.map((notif) =>
      payload.update({
        collection: 'notifications',
        id: notif.id,
        data: { isRead: true },
      }),
    )

    await Promise.all(updatePromises)

    logger.info('All notifications marked as read', {
      userId: user.id,
      count: unreadNotifications.docs.length,
    })

    return NextResponse.json({
      message: 'All notifications marked as read',
      count: unreadNotifications.docs.length,
    })
  } catch (error: any) {
    logger.error('Mark all as read error', error)
    return NextResponse.json(
      { error: error.message || 'Failed to mark all as read' },
      { status: 400 },
    )
  }
}
