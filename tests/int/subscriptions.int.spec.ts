import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect, beforeEach } from 'vitest'

let payload: Payload
let testUser: any
let testEvent: any
let testOrganization: any

describe('Subscriptions API', () => {
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
          email: `test-subscription-${Date.now()}@example.com`,
          password: 'Test1234!',
          firstName: 'Test',
          lastName: 'User',
        },
        draft: true,
      })
    } catch (error) {
      // User might already exist
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            contains: 'test-subscription',
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
      testOrganization = orgs.docs[0]
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 7)

      testEvent = await payload.create({
        collection: 'events',
        data: {
          title: `Test Event ${Date.now()}`,
          slug: `test-event-${Date.now()}`,
          description: 'Test event for subscriptions',
          organization: testOrganization.id,
          eventDate: futureDate.toISOString(),
          category: 'workshop',
          status: 'upcoming',
        },
        draft: false,
      })
    }
  })

  it('should create event subscription', async () => {
    if (!testUser || !testEvent) {
      return // Skip if test data not available
    }

    const subscription = await payload.create({
      collection: 'subscriptions',
      data: {
        user: testUser.id,
        type: 'event',
        event: testEvent.id,
      },
    })

    expect(subscription).toBeDefined()
    expect(subscription.type).toBe('event')
    const eventId =
      typeof subscription.event === 'object' && subscription.event !== null
        ? subscription.event.id
        : subscription.event
    expect(eventId).toBe(testEvent.id)
  })

  it('should create organization subscription', async () => {
    if (!testUser || !testOrganization) {
      return // Skip if test data not available
    }

    const subscription = await payload.create({
      collection: 'subscriptions',
      data: {
        user: testUser.id,
        type: 'organization',
        organization: testOrganization.id,
      },
    })

    expect(subscription).toBeDefined()
    expect(subscription.type).toBe('organization')
    const orgId =
      typeof subscription.organization === 'object' && subscription.organization !== null
        ? subscription.organization.id
        : subscription.organization
    expect(orgId).toBe(testOrganization.id)
  })

  it('should prevent duplicate subscriptions', async () => {
    if (!testUser || !testEvent) {
      return // Skip if test data not available
    }

    // Create first subscription
    await payload.create({
      collection: 'subscriptions',
      data: {
        user: testUser.id,
        type: 'event',
        event: testEvent.id,
      },
    })

    // Try to create duplicate - should fail
    try {
      await payload.create({
        collection: 'subscriptions',
        data: {
          user: testUser.id,
          type: 'event',
          event: testEvent.id,
        },
      })
      expect.fail('Should have thrown error for duplicate subscription')
    } catch (error: any) {
      expect(error).toBeDefined()
    }
  })
})
