import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { getEventStats } from '@/lib/stats'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Authenticate
    const { user } = await payload.auth({ headers: request.headers })
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only org-admins (or super-admins with organization) can access organizer dashboard
    const orgId = user.organization as string | undefined
    const isOrgAdmin = user.role === 'org-admin' && !!orgId
    const isSuperAdminWithOrg = user.role === 'super-admin' && !!orgId
    if (!isOrgAdmin && !isSuperAdminWithOrg) {
      const errorMsg =
        user.role === 'org-admin'
          ? 'Organization not assigned. Please contact administrator to assign your organization.'
          : 'Organizer dashboard is available for organization admins only. Your current role: ' +
            user.role
      return NextResponse.json({ error: 'Forbidden - ' + errorMsg }, { status: 403 })
    }

    // Upcoming events for this organization
    const nowISO = new Date().toISOString()
    const eventsRes = await payload.find({
      collection: 'events',
      where: {
        and: [
          { organization: { equals: orgId } },
          { deletedAt: { exists: false } },
          { eventDate: { greater_than: nowISO } },
        ],
      },
      sort: '-eventDate',
      limit: 100,
    })

    const upcoming = await Promise.all(
      eventsRes.docs.map(async (ev) => {
        const stats = await getEventStats(ev.id as string)
        return {
          id: ev.id,
          title: ev.title,
          slug: ev.slug,
          description: ev.description,
          eventDate: ev.eventDate,
          category: ev.category,
          location: ev.location,
          capacity: ev.capacity,
          registrations: {
            total: stats.total,
            going: stats.going,
          },
          attendanceRate: null as number | null, // not applicable for upcoming
        }
      }),
    )

    // Summary stats
    const upcomingEventsCount = upcoming.length

    // Registrations in last 7 days for this organization
    const sevenDaysAgoISO = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    let registrationsLast7Days = 0

    // Count for each event to keep logic simple and robust
    for (const ev of eventsRes.docs) {
      const [goingRecent, interestedRecent] = await Promise.all([
        payload.find({
          collection: 'event-participations',
          where: {
            and: [
              { event: { equals: ev.id as string } },
              { status: { equals: 'going' } },
              { createdAt: { greater_than: sevenDaysAgoISO } },
            ],
          },
          limit: 0,
        }),
        payload.find({
          collection: 'event-participations',
          where: {
            and: [
              { event: { equals: ev.id as string } },
              { status: { equals: 'interested' } },
              { createdAt: { greater_than: sevenDaysAgoISO } },
            ],
          },
          limit: 0,
        }),
      ])

      registrationsLast7Days += (goingRecent.totalDocs || 0) + (interestedRecent.totalDocs || 0)
    }

    return NextResponse.json({
      upcoming,
      stats: {
        upcomingEventsCount,
        registrationsLast7Days,
      },
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
}
