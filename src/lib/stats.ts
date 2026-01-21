import { getPayload } from 'payload'
import config from '@/payload.config'
import type { Event, Organization } from '@/payload-types'

export type EventStats = {
  total: number
  going: number
  interested: number
  attended: number
}

export type OrganizationStats = {
  eventsCount: number
  registrationsTotal: number
  topTags: Array<{ tag: string; registrations: number }>
}

// Helper to get a Payload instance
async function getPayloadInstance() {
  const payloadConfig = await config
  return getPayload({ config: payloadConfig })
}

/**
 * Compute stats for a single event
 */
export async function getEventStats(eventId: string): Promise<EventStats> {
  const payload = await getPayloadInstance()

  // Fetch event for date + tags context
  const event = (await payload.findByID({ collection: 'events', id: eventId })) as Event

  // Count participations by status
  const going = await payload.count({
    collection: 'event-participations',
    where: {
      and: [
        { event: { equals: eventId } },
        { status: { equals: 'going' } },
      ],
    },
  })

  const interested = await payload.count({
    collection: 'event-participations',
    where: {
      and: [
        { event: { equals: eventId } },
        { status: { equals: 'interested' } },
      ],
    },
  })

  // Total = going + interested (excluding cancelled)
  const total = (going.totalDocs || 0) + (interested.totalDocs || 0)

  // "attended" approximation: number of "going" if event is in the past
  const now = new Date()
  const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.eventDate)
  const attended = eventEnd < now ? (going.totalDocs || 0) : 0

  return {
    total,
    going: going.totalDocs || 0,
    interested: interested.totalDocs || 0,
    attended,
  }
}

/**
 * Compute stats for an organization, including top tags by registrations
 */
export async function getOrganizationStats(
  organizationId: string,
  opts?: { topN?: number },
): Promise<OrganizationStats> {
  const payload = await getPayloadInstance()
  const topN = opts?.topN ?? 5

  // Fetch all events for the organization
  const eventsRes = await payload.find({
    collection: 'events',
    where: {
      organization: { equals: organizationId },
    },
    limit: 1000,
  })

  const events = eventsRes.docs as Event[]
  const eventsCount = events.length

  // For each event, count registrations (going + interested)
  let registrationsTotal = 0
  const tagWeights: Record<string, number> = {}

  for (const ev of events) {
    const [going, interested] = await Promise.all([
      payload.count({
        collection: 'event-participations',
        where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'going' } }] },
      }),
      payload.count({
        collection: 'event-participations',
        where: { and: [{ event: { equals: ev.id } }, { status: { equals: 'interested' } }] },
      }),
    ])

    const evRegistrations = (going.totalDocs || 0) + (interested.totalDocs || 0)
    registrationsTotal += evRegistrations

    // Weight tags by registrations for popularity
    if (Array.isArray(ev.tags)) {
      for (const t of ev.tags) {
        const tag = (t?.tag || '').trim()
        if (!tag) continue
        tagWeights[tag] = (tagWeights[tag] || 0) + evRegistrations
      }
    }
  }

  // Compute top tags
  const topTags = Object.entries(tagWeights)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
    .map(([tag, registrations]) => ({ tag, registrations }))

  return {
    eventsCount,
    registrationsTotal,
    topTags,
  }
}
