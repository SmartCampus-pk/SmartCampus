import { getPayload, Payload } from 'payload'
import config from '@/payload.config'
import { describe, it, beforeAll, expect } from 'vitest'

let payload: Payload

describe('Organizations API', () => {
  beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  it('should fetch organizations list', async () => {
    const organizations = await payload.find({
      collection: 'organizations',
      where: {
        status: {
          equals: 'active',
        },
        deletedAt: {
          exists: false,
        },
      },
      limit: 10,
    })

    expect(organizations).toBeDefined()
    expect(Array.isArray(organizations.docs)).toBe(true)
  })

  it('should fetch organization details', async () => {
    const organizations = await payload.find({
      collection: 'organizations',
      where: {
        status: {
          equals: 'active',
        },
        deletedAt: {
          exists: false,
        },
      },
      limit: 1,
    })

    if (organizations.docs.length > 0) {
      const org = organizations.docs[0]
      const orgDetails = await payload.findByID({
        collection: 'organizations',
        id: org.id,
        depth: 2,
      })

      expect(orgDetails).toBeDefined()
      expect(orgDetails.name).toBeDefined()
      expect(orgDetails.description).toBeDefined()
    }
  })

  it('should filter organizations by search', async () => {
    const allOrgs = await payload.find({
      collection: 'organizations',
      where: {
        status: {
          equals: 'active',
        },
        deletedAt: {
          exists: false,
        },
      },
      limit: 100,
    })

    if (allOrgs.docs.length > 0) {
      const searchTerm = allOrgs.docs[0].name.substring(0, 3)

      const filtered = await payload.find({
        collection: 'organizations',
        where: {
          and: [
            {
              status: {
                equals: 'active',
              },
            },
            {
              deletedAt: {
                exists: false,
              },
            },
            {
              or: [
                {
                  name: {
                    contains: searchTerm,
                  },
                },
                {
                  description: {
                    contains: searchTerm,
                  },
                },
              ],
            },
          ],
        },
        limit: 10,
      })

      expect(filtered).toBeDefined()
      expect(Array.isArray(filtered.docs)).toBe(true)
    }
  })
})
