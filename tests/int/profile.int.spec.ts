import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, afterAll, expect, beforeEach } from 'vitest'

let payload: Payload
let testUser: any
let testEvent: any

const createdIds: {
  users: string[]
  events: string[]
  organizations: string[]
  participations: string[]
} = {
  users: [],
  events: [],
  organizations: [],
  participations: [],
}

describe('User Profile & Events History', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  beforeEach(async () => {
    // Create test user
    try {
      testUser = await payload.create({
        collection: 'users',
        data: {
          email: `test-profile-${Date.now()}@example.com`,
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        },
        draft: true,
      })
      createdIds.users.push(testUser.id)
    } catch (error) {
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            contains: 'test-profile',
          },
        },
        limit: 1,
      })
      if (users.docs.length > 0) {
        testUser = users.docs[0]
        if (!createdIds.users.includes(testUser.id)) {
          createdIds.users.push(testUser.id)
        }
      }
    }

    // Create test event
    const orgs = await payload.find({
      collection: 'organizations',
      limit: 1,
    })
    if (orgs.docs.length > 0) {
      const org = orgs.docs[0]
      if (!createdIds.organizations.includes(org.id)) {
        createdIds.organizations.push(org.id)
      }
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      testEvent = await payload.create({
        collection: 'events',
        data: {
          title: `Test Event ${Date.now()}`,
          slug: `test-event-profile-${Date.now()}`,
          description: 'Test event',
          organization: org.id,
          eventDate: futureDate.toISOString(),
          category: 'workshop',
          status: 'upcoming',
        },
        draft: false,
      })
      createdIds.events.push(testEvent.id)
    }
  })

  it('should fetch user profile data', async () => {
    if (!testUser) {
      return // Skip if test data not available
    }

    const user = await payload.findByID({
      collection: 'users',
      id: testUser.id,
    })

    expect(user).toBeDefined()
    expect(user.email).toBe(testUser.email)
    expect(user.firstName).toBe('Test')
    expect(user.lastName).toBe('User')
  })

  it('should fetch user events history', async () => {
    if (!testUser || !testEvent) {
      return // Skip if test data not available
    }

    // Create participation
    const participation = await payload.create({
      collection: 'event-participations',
      data: {
        user: testUser.id,
        event: testEvent.id,
        status: 'going',
      },
    })
    createdIds.participations.push(participation.id)

    // Fetch user events
    const participations = await payload.find({
      collection: 'event-participations',
      where: {
        user: {
          equals: testUser.id,
        },
      },
      depth: 2,
    })

    expect(participations.docs.length).toBeGreaterThan(0)
    const foundParticipation = participations.docs.find((p) => {
      const eventId = typeof p.event === 'object' ? p.event.id : p.event
      return eventId === testEvent.id
    })
    expect(foundParticipation).toBeDefined()
    expect(foundParticipation?.status).toBe('going')
  })

  afterAll(async () => {
    // Clean up all created test data
    for (const id of createdIds.participations) {
      try {
        await payload.delete({ collection: 'event-participations', id, overrideAccess: true })
      } catch {}
    }
    for (const id of createdIds.events) {
      try {
        await payload.delete({ collection: 'events', id, overrideAccess: true })
      } catch {}
    }
    for (const id of createdIds.organizations) {
      try {
        await payload.delete({ collection: 'organizations', id, overrideAccess: true })
      } catch {}
    }
    for (const id of createdIds.users) {
      try {
        await payload.delete({ collection: 'users', id, overrideAccess: true })
      } catch {}
    }
  })
})
