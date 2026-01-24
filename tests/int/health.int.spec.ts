import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Health Check', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('should connect to database', async () => {
    const users = await payload.find({
      collection: 'users',
      limit: 1,
    })
    expect(users).toBeDefined()
  })

  it('should access events collection', async () => {
    const events = await payload.find({
      collection: 'events',
      limit: 1,
    })
    expect(events).toBeDefined()
  })

  it('should access organizations collection', async () => {
    const organizations = await payload.find({
      collection: 'organizations',
      limit: 1,
    })
    expect(organizations).toBeDefined()
  })

  it('should access subscriptions collection', async () => {
    const subscriptions = await payload.find({
      collection: 'subscriptions',
      limit: 1,
    })
    expect(subscriptions).toBeDefined()
  })

  it('should access notifications collection', async () => {
    const notifications = await payload.find({
      collection: 'notifications',
      limit: 1,
    })
    expect(notifications).toBeDefined()
  })
})
