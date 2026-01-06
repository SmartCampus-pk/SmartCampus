import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect, beforeEach } from 'vitest'

let payload: Payload
let testUser: any
let testEvent: any

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
      }
    }

    // Create test event
    const orgs = await payload.find({
      collection: 'organizations',
      limit: 1,
    })
    if (orgs.docs.length > 0) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      testEvent = await payload.create({
        collection: 'events',
        data: {
          title: `Test Event ${Date.now()}`,
          slug: `test-event-profile-${Date.now()}`,
          description: 'Test event',
          organization: orgs.docs[0].id,
          eventDate: futureDate.toISOString(),
          category: 'workshop',
          status: 'upcoming',
        },
        draft: false,
      })
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
    await payload.create({
      collection: 'event-participations',
      data: {
        user: testUser.id,
        event: testEvent.id,
        status: 'going',
      },
    })

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
    const participation = participations.docs.find((p) => {
      const eventId = typeof p.event === 'object' ? p.event.id : p.event
      return eventId === testEvent.id
    })
    expect(participation).toBeDefined()
    expect(participation?.status).toBe('going')
  })
})
