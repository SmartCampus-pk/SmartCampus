import { describe, it, beforeAll, afterAll, expect } from 'vitest'
import { getPayload, Payload } from 'payload'
import config from '@/payload.config'

let payload: Payload
let orgA: any
let orgB: any
let student: any
let orgAdmin: any
let superAdmin: any
let eventA: any
let participationA: any

describe('Access control - integration', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Create organizations (overrideAccess)
    orgA = await payload.create({ collection: 'organizations', data: { name: `Org A ${Date.now()}`, slug: `org-a-${Date.now()}`, description: 'Org A', type: 'student-organization', status: 'active' }, overrideAccess: true })
    orgB = await payload.create({ collection: 'organizations', data: { name: `Org B ${Date.now()}`, slug: `org-b-${Date.now()}`, description: 'Org B', type: 'student-organization', status: 'active' }, overrideAccess: true })

    // Create users
    student = await payload.create({ collection: 'users', data: { email: `student-${Date.now()}@example.com`, password: 'Test1234!', firstName: 'Student', lastName: 'One', role: 'student' }, overrideAccess: true })

    orgAdmin = await payload.create({ collection: 'users', data: { email: `orgadmin-${Date.now()}@example.com`, password: 'Test1234!', firstName: 'Org', lastName: 'Admin', role: 'org-admin', organization: orgA.id }, overrideAccess: true })

    superAdmin = await payload.create({ collection: 'users', data: { email: `super-${Date.now()}@example.com`, password: 'Test1234!', firstName: 'Super', lastName: 'Admin', role: 'super-admin' }, overrideAccess: true })

    // Create an event for orgA
    eventA = await payload.create({ collection: 'events', data: { title: `Event A ${Date.now()}`, slug: `event-a-${Date.now()}`, description: 'Test event', eventDate: new Date(Date.now() + 86400000).toISOString(), organization: orgA.id, status: 'upcoming' }, overrideAccess: true })

    // Create a participation for student on eventA
    participationA = await payload.create({ collection: 'event-participations', data: { event: eventA.id, user: student.id, status: 'going' }, overrideAccess: true })
  })

  afterAll(async () => {
    // Clean up created docs
    try {
      await payload.delete({ collection: 'event-participations', id: participationA.id, overrideAccess: true })
      await payload.delete({ collection: 'events', id: eventA.id, overrideAccess: true })
      await payload.delete({ collection: 'users', id: student.id, overrideAccess: true })
      await payload.delete({ collection: 'users', id: orgAdmin.id, overrideAccess: true })
      await payload.delete({ collection: 'users', id: superAdmin.id, overrideAccess: true })
      await payload.delete({ collection: 'organizations', id: orgA.id, overrideAccess: true })
      await payload.delete({ collection: 'organizations', id: orgB.id, overrideAccess: true })
    } catch (e) {
      // ignore
    }
  })

  it('prevents student from updating an event', async () => {
    let threw = false
    try {
      await payload.update({ collection: 'events', id: eventA.id, data: { title: 'Hacked Title' }, req: { user: student } })
    } catch (err: any) {
      threw = true
    }
    expect(threw).toBe(true)
  })

  it('allows org-admin to update event for their organization', async () => {
    const updated = await payload.update({ collection: 'events', id: eventA.id, data: { title: 'Updated by OrgAdmin' }, req: { user: orgAdmin } })
    expect(updated.title).toBe('Updated by OrgAdmin')
  })

  it('prevents student reading another users participation', async () => {
    // Create another participation for a different (fake) user
    const otherUser = await payload.create({ collection: 'users', data: { email: `other-${Date.now()}@example.com`, password: 'Test1234!', firstName: 'Other', lastName: 'User', role: 'student' }, overrideAccess: true })
    const otherPart = await payload.create({ collection: 'event-participations', data: { event: eventA.id, user: otherUser.id, status: 'going' }, overrideAccess: true })

    const res = await payload.find({ collection: 'event-participations', where: { user: { equals: otherUser.id } }, req: { user: student } })
    expect(res.totalDocs === 0 || (res.docs && res.docs.length === 0)).toBe(true)

    // cleanup
    await payload.delete({ collection: 'event-participations', id: otherPart.id, overrideAccess: true })
    await payload.delete({ collection: 'users', id: otherUser.id, overrideAccess: true })
  })

  it('allows org-admin to read participations for their organization', async () => {
    const res = await payload.find({ collection: 'event-participations', where: { event: { equals: eventA.id } }, req: { user: orgAdmin } })
    expect(res.totalDocs).toBeGreaterThanOrEqual(1)
  })

  it('allows super-admin full access', async () => {
    const res = await payload.find({ collection: 'event-participations', limit: 10, req: { user: superAdmin } })
    expect(res).toBeDefined()
  })
})
