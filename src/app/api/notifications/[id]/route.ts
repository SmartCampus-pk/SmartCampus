import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify notification exists and belongs to the user
    let notification
    try {
      notification = await payload.findByID({
        collection: 'notifications',
        id,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    if (!notification) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 })
    }

    // Verify ownership
    const notificationUserId =
      typeof notification.user === 'object' && notification.user !== null
        ? notification.user.id
        : notification.user

    if (notificationUserId !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    // Update notification
    const updated = await payload.update({
      collection: 'notifications',
      id,
      data: body,
    })

    return NextResponse.json({
      notification: updated,
      message: 'Notification updated',
    })
  } catch (error: any) {
    console.error('Notification update error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update notification' },
      { status: 400 },
    )
  }
}
