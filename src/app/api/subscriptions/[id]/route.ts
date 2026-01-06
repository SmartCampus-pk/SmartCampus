import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      logger.warn('Subscription deletion attempted without authentication', { subscriptionId: id })
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify subscription exists and belongs to the user
    let subscription
    try {
      subscription = await payload.findByID({
        collection: 'subscriptions',
        id,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 })
    }

    // Verify ownership
    const subscriptionUserId =
      typeof subscription.user === 'object' && subscription.user !== null
        ? subscription.user.id
        : subscription.user

    if (subscriptionUserId !== user.id) {
      logger.warn('Unauthorized subscription deletion attempt', {
        userId: user.id,
        subscriptionId: id,
        subscriptionUserId,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Delete subscription
    await payload.delete({
      collection: 'subscriptions',
      id,
    })

    logger.info('Subscription deleted', { userId: user.id, subscriptionId: id })
    return NextResponse.json({
      subscribed: false,
      message: 'Successfully unsubscribed',
    })
  } catch (error: any) {
    let userId = 'unknown'
    let subId = 'unknown'
    try {
      const paramsData = await params
      subId = paramsData.id
      const payloadConfig = await config
      const payloadInstance = await getPayload({ config: payloadConfig })
      const authResult = await payloadInstance
        .auth({ headers: request.headers })
        .catch(() => ({ user: null }))
      if (authResult.user) {
        userId = authResult.user.id
      }
    } catch {
      // params/auth not available
    }
    logger.error('Subscription deletion error', error, { userId, subscriptionId: subId })
    return NextResponse.json(
      { error: error.message || 'Failed to delete subscription' },
      { status: 400 },
    )
  }
}
