import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: eventId } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from headers
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get event to check permissions
    const event = await payload.findByID({
      collection: 'events',
      id: eventId,
    })

    // Check if user is org-admin of event's organization or super-admin
    const isOrgAdmin = user.role === 'org-admin' && user.organization === event.organization
    const isSuperAdmin = user.role === 'super-admin'

    if (!isOrgAdmin && !isSuperAdmin) {
      return NextResponse.json(
        { error: 'Forbidden - only organization admins can view participants' },
        { status: 403 },
      )
    }

    // Get participants
    const participations = await payload.find({
      collection: 'event-participations',
      where: {
        event: {
          equals: eventId,
        },
      },
      depth: 2, // Include user details
      limit: 1000,
    })

    // Filter by status if provided
    const status = request.nextUrl.searchParams.get('status')
    let filtered = participations.docs

    if (status) {
      filtered = filtered.filter((p) => p.status === status)
    }

    return NextResponse.json({
      total: filtered.length,
      participants: filtered,
      stats: {
        going: filtered.filter((p) => p.status === 'going').length,
        interested: filtered.filter((p) => p.status === 'interested').length,
        cancelled: filtered.filter((p) => p.status === 'cancelled').length,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
