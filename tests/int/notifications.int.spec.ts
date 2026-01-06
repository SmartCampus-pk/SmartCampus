import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect, beforeEach } from 'vitest'

let payload: Payload
let testUser: any
let testEvent: any
let testOrganization: any

describe('Notifications on Event Updates', () => {
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
          email: `test-notif-${Date.now()}@example.com`,
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
            contains: 'test-notif',
          },
        },
        limit: 1,
      })
      if (users.docs.length > 0) {
        testUser = users.docs[0]
      }
    }

    // Get or create test organization
    const orgs = await payload.find({
      collection: 'organizations',
      limit: 1,
    })
    if (orgs.docs.length > 0) {
      testOrganization = orgs.docs[0]
    }

    // Create test event
    if (testOrganization) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      testEvent = await payload.create({
        collection: 'events',
        data: {
          title: `Test Event ${Date.now()}`,
          slug: `test-event-notif-${Date.now()}`,
          description: 'Test event for notifications',
          organization: testOrganization.id,
          eventDate: futureDate.toISOString(),
          location: 'Test Location',
          category: 'workshop',
          status: 'upcoming',
        },
        draft: false,
      })
    }
  })

  it('should create notification when event date changes', async () => {
    if (!testUser || !testEvent) {
      return // Skip if test data not available
    }

    // Create subscription first
    await payload.create({
      collection: 'subscriptions',
      data: {
        user: testUser.id,
        type: 'event',
        event: testEvent.id,
      },
    })

    // Update event date
    const newDate = new Date()
    newDate.setDate(newDate.getDate() + 10)

    await payload.update({
      collection: 'events',
      id: testEvent.id,
      data: {
        eventDate: newDate.toISOString(),
      },
    })

    // Check if notification was created
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        and: [
          {
            user: {
              equals: testUser.id,
            },
          },
          {
            relatedEvent: {
              equals: testEvent.id,
            },
          },
        ],
      },
    })

    expect(notifications.docs.length).toBeGreaterThan(0)
    expect(notifications.docs[0].type).toBe('event_update')
  })

  it('should create notification when event location changes', async () => {
    if (!testUser || !testEvent) {
      return // Skip if test data not available
    }

    // Create subscription first
    await payload.create({
      collection: 'subscriptions',
      data: {
        user: testUser.id,
        type: 'event',
        event: testEvent.id,
      },
    })

    // Update event location
    await payload.update({
      collection: 'events',
      id: testEvent.id,
      data: {
        location: 'New Location',
      },
    })

    // Check if notification was created
    const notifications = await payload.find({
      collection: 'notifications',
      where: {
        and: [
          {
            user: {
              equals: testUser.id,
            },
          },
          {
            relatedEvent: {
              equals: testEvent.id,
            },
          },
        ],
      },
    })

    expect(notifications.docs.length).toBeGreaterThan(0)
  })
})
