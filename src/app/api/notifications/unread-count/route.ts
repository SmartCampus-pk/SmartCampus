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

    const unreadCount = await payload.count({
      collection: 'notifications',
      where: {
        and: [{ user: { equals: user.id } }, { isRead: { equals: false } }],
      },
    })

    return NextResponse.json({ count: unreadCount.totalDocs })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to get unread count' },
      { status: 400 },
    )
  }
}
