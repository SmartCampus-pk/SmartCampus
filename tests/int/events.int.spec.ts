import { beforeAll, describe, expect, it } from 'vitest'
import { getPayload, Payload } from 'payload'
import { NextRequest } from 'next/server'

import config from '@/payload.config'
import { POST as joinEvent } from '@/app/api/events/[id]/join/route'
import { POST as leaveEvent } from '@/app/api/events/[id]/leave/route'
import { GET as getParticipants } from '@/app/api/events/[id]/participants/route'

let payload: Payload

const runId = `run-${Date.now()}-${Math.random().toString(16).slice(2)}`

const createOrganization = async (name: string) => {
  return payload.create({
    collection: 'organizations',
    data: {
      name,
      description: `Test org ${runId}`,
      type: 'other',
      status: 'active',
    },
    overrideAccess: true,
  })
}

const createUser = async (email: string, role: 'student' | 'org-admin', organization?: string) => {
  return payload.create({
    collection: 'users',
    data: {
      email,
      password: 'TestPass1',
      firstName: 'Test',
      lastName: 'User',
      role,
      organization,
    },
    overrideAccess: true,
  })
}

const createEvent = async (data: {
  title: string
  organization: string
  eventDate: string
  tags?: string[]
}) => {
  return payload.create({
    collection: 'events',
    data: {
      title: data.title,
      description: `Event ${runId}`,
      organization: data.organization,
      eventDate: data.eventDate,
      category: 'workshop',
      tags: data.tags?.map((tag) => ({ tag })) || [],
    },
    overrideAccess: true,
  })
}

const loginUser = async (email: string) => {
  const result = await payload.login({
    collection: 'users',
    data: {
      email,
      password: 'TestPass1',
    },
  })

  return result.token
}

describe('Events scenarios', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('filters events by date and tag', async () => {
    const org = await createOrganization(`Org ${runId}`)
    const tagDate = `date-${runId}`
    const tagSpecial = `special-${runId}`

    await createEvent({
      title: `Event past ${runId}`,
      organization: org.id,
      eventDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      tags: [tagDate],
    })

    await createEvent({
      title: `Event future 1 ${runId}`,
      organization: org.id,
      eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      tags: [tagDate],
    })

    await createEvent({
      title: `Event future 2 ${runId}`,
      organization: org.id,
      eventDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      tags: [tagDate],
    })

    await createEvent({
      title: `Event tag ${runId}`,
      organization: org.id,
      eventDate: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
      tags: [tagSpecial],
    })

    const upcoming = await payload.find({
      collection: 'events',
      where: {
        and: [
          {
            eventDate: {
              greater_than: new Date().toISOString(),
            },
          },
          {
            'tags.tag': {
              equals: tagDate,
            },
          },
        ],
      },
    })

    expect(upcoming.totalDocs).toBe(2)

    const tagged = await payload.find({
      collection: 'events',
      where: {
        'tags.tag': {
          equals: tagSpecial,
        },
      },
    })

    expect(tagged.totalDocs).toBe(1)
  })

  it('user joins and leaves event', async () => {
    const org = await createOrganization(`Org join ${runId}`)
    const user = await createUser(`join-${runId}@example.com`, 'student')
    const event = await createEvent({
      title: `Join event ${runId}`,
      organization: org.id,
      eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    const token = await loginUser(user.email)

    const joinRequest = new NextRequest(`http://localhost/api/events/${event.id}/join`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const joinResponse = await joinEvent(joinRequest, {
      params: Promise.resolve({ id: event.id }),
    })

    expect(joinResponse.status).toBe(200)
    const joinData = await joinResponse.json()
    expect(joinData.participantsCount).toBe(1)

    const leaveRequest = new NextRequest(`http://localhost/api/events/${event.id}/leave`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const leaveResponse = await leaveEvent(leaveRequest, {
      params: Promise.resolve({ id: event.id }),
    })

    expect(leaveResponse.status).toBe(200)
    const leaveData = await leaveResponse.json()
    expect(leaveData.participantsCount).toBe(0)
  })

  it('organizer sees participants for own events only', async () => {
    const orgA = await createOrganization(`Org A ${runId}`)
    const orgB = await createOrganization(`Org B ${runId}`)
    const admin = await createUser(`admin-${runId}@example.com`, 'org-admin', orgA.id)

    const eventA = await createEvent({
      title: `Event A ${runId}`,
      organization: orgA.id,
      eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    const eventB = await createEvent({
      title: `Event B ${runId}`,
      organization: orgB.id,
      eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    })

    const participant = await createUser(`participant-${runId}@example.com`, 'student')

    await payload.create({
      collection: 'event-participations',
      data: {
        event: eventA.id,
        user: participant.id,
        status: 'going',
      },
      overrideAccess: true,
    })

    const token = await loginUser(admin.email)

    const participantsRequest = new NextRequest(
      `http://localhost/api/events/${eventA.id}/participants`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const participantsResponse = await getParticipants(participantsRequest, {
      params: Promise.resolve({ id: eventA.id }),
    })

    expect(participantsResponse.status).toBe(200)
    const participantsData = await participantsResponse.json()
    expect(participantsData.stats.going).toBe(1)

    const forbiddenRequest = new NextRequest(
      `http://localhost/api/events/${eventB.id}/participants`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    const forbiddenResponse = await getParticipants(forbiddenRequest, {
      params: Promise.resolve({ id: eventB.id }),
    })

    expect(forbiddenResponse.status).toBe(403)
  })
})
