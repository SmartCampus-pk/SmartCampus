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

    return NextResponse.json({
      subscriptions: subscriptions.docs,
      total: subscriptions.totalDocs,
    })
  } catch (error: any) {
    console.error('Get subscriptions error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to get subscriptions' },
      { status: 400 },
    )
  }
}
