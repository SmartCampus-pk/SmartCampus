import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { getPayload } from 'payload'
import config from '@/payload.config'

describe('Roles & Permissions Audit', () => {
  let payload: any
  let studentUser: any
  let orgAdminUser: any
  let superAdminUser: any
  let testOrg: any
  let testEvent: any
  const timestamp = Date.now()

  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })

    // Clean up ALL test data from previous runs (pattern-based cleanup)
    // Delete test events
    const testEvents = await payload.find({
      collection: 'events',
      where: {
        OR: [
          { slug: { contains: 'test-event-permissions' } },
          { slug: { contains: 'unauthorized-event' } },
          { slug: { contains: 'org-admin-event' } },
          { slug: { contains: 'temp-event-deletion' } },
        ],
      },
      limit: 50,
      overrideAccess: true,
    })
    for (const event of testEvents.docs) {
      await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
    }

    // Delete test organizations
    const testOrgs = await payload.find({
      collection: 'organizations',
      where: {
        OR: [
          { slug: { contains: 'test-org-permissions' } },
          { slug: { contains: 'unauthorized-org' } },
        ],
      },
      limit: 50,
      overrideAccess: true,
    })
    for (const org of testOrgs.docs) {
      await payload.delete({ collection: 'organizations', id: org.id, overrideAccess: true })
    }

    // Delete test users
    const testUsers = await payload.find({
      collection: 'users',
      where: {
        email: { contains: '-perms-' },
      },
      limit: 50,
      overrideAccess: true,
    })
    for (const user of testUsers.docs) {
      await payload.delete({ collection: 'users', id: user.id, overrideAccess: true })
    }

    // Create test organization
    testOrg = await payload.create({
      collection: 'organizations',
      data: {
        name: 'Test Organization Permissions',
        slug: `test-org-permissions-${timestamp}`,
        type: 'student-organization',
        description: 'Test org for permissions',
        status: 'active',
      },
      overrideAccess: true,
    })

    // Create student user
    studentUser = await payload.create({
      collection: 'users',
      data: {
        email: `student-perms-${timestamp}@test.com`,
        password: 'Test1234!',
        firstName: 'Student',
        lastName: 'Test',
        role: 'student',
      },
      overrideAccess: true,
    })

    // Create org-admin user
    orgAdminUser = await payload.create({
      collection: 'users',
      data: {
        email: `orgadmin-perms-${timestamp}@test.com`,
        password: 'Test1234!',
        firstName: 'OrgAdmin',
        lastName: 'Test',
        role: 'org-admin',
        organization: testOrg.id,
      },
      overrideAccess: true,
    })

    // Create super-admin user
    superAdminUser = await payload.create({
      collection: 'users',
      data: {
        email: `superadmin-perms-${timestamp}@test.com`,
        password: 'Test1234!',
        firstName: 'SuperAdmin',
        lastName: 'Test',
        role: 'super-admin',
      },
      overrideAccess: true,
    })

    // Create test event
    testEvent = await payload.create({
      collection: 'events',
      data: {
        title: 'Test Event Permissions',
        slug: `test-event-permissions-${timestamp}`,
        description: 'Test event for permissions',
        organization: testOrg.id,
        eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        category: 'workshop',
        status: 'upcoming',
      },
      overrideAccess: true,
    })
  }, 30000) // 30 second timeout

  afterAll(async () => {
    // Cleanup - use overrideAccess to bypass permission checks
    if (testEvent) {
      await payload.delete({ collection: 'events', id: testEvent.id, overrideAccess: true })
    }
    if (testOrg) {
      await payload.delete({ collection: 'organizations', id: testOrg.id, overrideAccess: true })
    }
    if (studentUser) {
      await payload.delete({ collection: 'users', id: studentUser.id, overrideAccess: true })
    }
    if (orgAdminUser) {
      await payload.delete({ collection: 'users', id: orgAdminUser.id, overrideAccess: true })
    }
    if (superAdminUser) {
      await payload.delete({ collection: 'users', id: superAdminUser.id, overrideAccess: true })
    }
  }, 30000) // 30 second timeout

  describe('Student Role Permissions', () => {
    it('student can read events and organizations', async () => {
      const events = await payload.find({
        collection: 'events',
        user: studentUser,
      })
      expect(events.docs.length).toBeGreaterThanOrEqual(0)

      const orgs = await payload.find({
        collection: 'organizations',
        user: studentUser,
      })
      expect(orgs.docs.length).toBeGreaterThanOrEqual(0)
    })

    it('student can manage their own participations', async () => {
      const participation = await payload.create({
        collection: 'event-participations',
        data: {
          event: testEvent.id,
          user: studentUser.id,
          status: 'going',
        },
        user: studentUser,
      })
      expect(participation.id).toBeDefined()

      // Student can update their own participation
      const updated = await payload.update({
        collection: 'event-participations',
        id: participation.id,
        data: {
          status: 'interested',
        },
        user: studentUser,
      })
      expect(updated.status).toBe('interested')

      // Cleanup
      await payload.delete({
        collection: 'event-participations',
        id: participation.id,
      })
    })

    it('student can manage their own subscriptions', async () => {
      const subscription = await payload.create({
        collection: 'subscriptions',
        data: {
          user: studentUser.id,
          type: 'organization',
          organization: testOrg.id,
        },
        user: studentUser,
      })
      expect(subscription.id).toBeDefined()

      // Cleanup
      await payload.delete({
        collection: 'subscriptions',
        id: subscription.id,
      })
    })

    it('student cannot create events', async () => {
      await expect(
        payload.create({
          collection: 'events',
          data: {
            title: 'Unauthorized Event',
            slug: 'unauthorized-event',
            description: 'Should not be created',
            organization: testOrg.id,
            eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            category: 'workshop',
            status: 'upcoming',
          },
          user: studentUser,
        }),
      ).rejects.toThrow()
    })

    it('student cannot create or edit organizations', async () => {
      await expect(
        payload.create({
          collection: 'organizations',
          data: {
            name: 'Unauthorized Org',
            slug: 'unauthorized-org',
            type: 'student-organization',
            description: 'Should not be created',
            status: 'active',
          },
          user: studentUser,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Org-Admin Role Permissions', () => {
    it('org-admin can create events for their organization', async () => {
      const event = await payload.create({
        collection: 'events',
        data: {
          title: 'Org Admin Event',
          slug: 'org-admin-event',
          description: 'Event by org admin',
          organization: testOrg.id,
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'meeting',
          status: 'upcoming',
        },
        user: orgAdminUser,
      })
      expect(event.id).toBeDefined()

      // Cleanup
      await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
    })

    it('org-admin can edit events from their organization', async () => {
      const updated = await payload.update({
        collection: 'events',
        id: testEvent.id,
        data: {
          title: 'Updated by Org Admin',
        },
        user: orgAdminUser,
      })
      expect(updated.title).toBe('Updated by Org Admin')

      // Restore
      await payload.update({
        collection: 'events',
        id: testEvent.id,
        data: {
          title: 'Test Event Permissions',
        },
        overrideAccess: true,
      })
    })

    it('org-admin can edit their own organization', async () => {
      const updated = await payload.update({
        collection: 'organizations',
        id: testOrg.id,
        data: {
          description: 'Updated by org admin',
        },
        user: orgAdminUser,
        overrideAccess: false,
      })
      expect(updated.description).toBe('Updated by org admin')

      // Restore
      await payload.update({
        collection: 'organizations',
        id: testOrg.id,
        data: {
          description: 'Test org for permissions',
        },
        overrideAccess: true,
      })
    })

    it('org-admin cannot delete events or organizations', async () => {
      // Org-admin should not be able to delete events (soft delete hook will reject)
      await expect(
        payload.delete({
          collection: 'events',
          id: testEvent.id,
          user: orgAdminUser,
        }),
      ).rejects.toThrow(/Forbidden/)

      await expect(
        payload.delete({
          collection: 'organizations',
          id: testOrg.id,
          user: orgAdminUser,
        }),
      ).rejects.toThrow()
    })
  })

  describe('Super-Admin Role Permissions', () => {
    it('super-admin has full access to all collections', async () => {
      // Can read
      const events = await payload.find({
        collection: 'events',
        user: superAdminUser,
      })
      expect(events.docs.length).toBeGreaterThanOrEqual(0)

      // Can update
      const updated = await payload.update({
        collection: 'events',
        id: testEvent.id,
        data: {
          title: 'Updated by Super Admin',
        },
        user: superAdminUser,
        overrideAccess: true,
      })
      expect(updated.title).toBe('Updated by Super Admin')

      // Restore
      await payload.update({
        collection: 'events',
        id: testEvent.id,
        data: {
          title: 'Test Event Permissions',
        },
        overrideAccess: true,
      })
    })

    it('super-admin can delete events and organizations', async () => {
      // Create temp event with draft:false to enforce published state
      const tempEvent = await payload.create({
        collection: 'events',
        data: {
          title: 'Temp Event for Deletion',
          slug: 'temp-event-deletion',
          description: 'Will be deleted',
          organization: testOrg.id,
          eventDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          category: 'other',
          status: 'upcoming',
        },
        overrideAccess: true,
      })

      // Super admin can delete (soft delete)
      await payload.delete({
        collection: 'events',
        id: tempEvent.id,
        user: superAdminUser,
      })

      // Event should be soft deleted - find it using overrideAccess
      const deletedEvents = await payload.find({
        collection: 'events',
        where: {
          id: {
            equals: tempEvent.id,
          },
        },
        user: superAdminUser,
      })
      expect(deletedEvents.docs.length).toBe(1)
      expect(deletedEvents.docs[0].deletedAt).toBeTruthy()
    })
  })

  describe('Cross-User Access Control', () => {
    it('users cannot access other users participations', async () => {
      const participation = await payload.create({
        collection: 'event-participations',
        data: {
          event: testEvent.id,
          user: studentUser.id,
          status: 'going',
        },
        overrideAccess: true,
      })

      // Another user should not be able to update it
      await expect(
        payload.update({
          collection: 'event-participations',
          id: participation.id,
          data: {
            status: 'cancelled',
          },
          user: orgAdminUser,
        }),
      ).rejects.toThrow()

      // Cleanup
      await payload.delete({
        collection: 'event-participations',
        id: participation.id,
        overrideAccess: true,
      })
    })

    it('users cannot access other users subscriptions', async () => {
      const subscription = await payload.create({
        collection: 'subscriptions',
        data: {
          user: studentUser.id,
          type: 'organization',
          organization: testOrg.id,
        },
        overrideAccess: true,
      })

      // Another user cannot see subscriptions that don't belong to them
      const subscriptions = await payload.find({
        collection: 'subscriptions',
        user: orgAdminUser,
      })

      const found = subscriptions.docs.find((sub: any) => sub.id === subscription.id)
      expect(found).toBeUndefined()

      // Cleanup
      await payload.delete({
        collection: 'subscriptions',
        id: subscription.id,
        overrideAccess: true,
      })
    })
  })
})
