import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      logger.warn('Subscriptions fetch attempted without authentication')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Get all subscriptions for the user
    const subscriptions = await payload.find({
      collection: 'subscriptions',
      where: {
        user: {
          equals: user.id,
        },
      },
      limit: 1000, // Adjust as needed
      depth: 2, // Populate relationships
    })

    logger.info('Subscriptions fetched', { userId: user.id, count: subscriptions.totalDocs })
    return NextResponse.json({
      subscriptions: subscriptions.docs,
      total: subscriptions.totalDocs,
    })
  } catch (error: any) {
    let userId = 'unknown'
    try {
      const payloadConfig = await config
      const payloadInstance = await getPayload({ config: payloadConfig })
      const authResult = await payloadInstance
        .auth({ headers: request.headers })
        .catch(() => ({ user: null }))
      if (authResult.user) {
        userId = authResult.user.id
      }
    } catch {
      // auth not available
    }
    logger.error('Get subscriptions error', error, { userId })
    return NextResponse.json(
      { error: error.message || 'Failed to get subscriptions' },
      { status: 400 },
    )
  }
}
