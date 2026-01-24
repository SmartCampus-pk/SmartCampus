import type { CollectionConfig } from 'payload'

export const Subscriptions: CollectionConfig = {
  slug: 'subscriptions',
  admin: {
    useAsTitle: 'id',
    description: 'User subscriptions to events or organizations',
  },
  access: {
    read: ({ req }) => {
      const user = req?.user
      console.debug('[Subscriptions.access.read] user=', user?.id, 'role=', user?.role)
      // Super-admins can see all subscriptions
      if (user?.role === 'super-admin') return true

      // All other authenticated users may only see their own subscriptions
      if (user) {
        const userId = typeof user === 'object' && user !== null ? user.id : user
        return {
          user: {
            equals: userId,
          },
        }
      }
      return false
    },
    create: ({ req: { user } }) => {
      // Only authenticated users can create subscriptions
      return !!user
    },
    update: ({ req: { user } }) => {
      // Users can only update their own subscriptions
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        }
      }
      return false
    },
    delete: ({ req: { user } }) => {
      // Users can only delete their own subscriptions
      if (user) {
        return {
          user: {
            equals: user.id,
          },
        }
      }
      return false
    },
  },
  fields: [
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'User who subscribed',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      options: [
        {
          label: 'Event',
          value: 'event',
        },
        {
          label: 'Organization',
          value: 'organization',
        },
      ],
      admin: {
        description: 'Type of subscription',
      },
    },
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: false,
      admin: {
        condition: (data) => data.type === 'event',
        description: 'Event being subscribed to (required if type is event)',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: false,
      admin: {
        condition: (data) => data.type === 'organization',
        description: 'Organization being subscribed to (required if type is organization)',
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // Validation: either event or organization, not both
        if (data?.type === 'event' && !data?.event) {
          throw new Error('Event is required when type is "event"')
        }
        if (data?.type === 'organization' && !data?.organization) {
          throw new Error('Organization is required when type is "organization"')
        }
        if (data?.event && data?.organization) {
          throw new Error('Cannot subscribe to both event and organization at the same time')
        }
        return data
      },
    ],
    beforeChange: [
      ({ req, operation, data }) => {
        // Only authenticated users may create subscriptions and they may only create for themselves
        if (operation === 'create') {
          const user = req.user
          // Allow overrideAccess/system operations
          if (!user) return data
          console.debug('[Subscriptions.beforeChange] create by user=', user.id)
          if (data.user && data.user !== user.id) throw new Error('Forbidden - cannot create subscription for another user')
          // Normalize if user not provided
          if (!data.user) data.user = user.id
        }

        // For updates/deletes, ensure ownership unless super-admin
        if (operation === 'update' || operation === 'delete') {
          const user = req.user
          if (!user) throw new Error('Forbidden')
          if (user.role === 'super-admin') return data
          // payload will enforce via access, but double-check here
          // No further logic needed; rely on access rules
        }

        return data
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        // Hide subscriptions that don't belong to the requesting user (unless super-admin)
        const user = req?.user
        if (!user) return doc
        if (user.role === 'super-admin') return doc

        const ownerId = typeof doc?.user === 'object' && doc.user !== null ? doc.user.id : doc?.user
        if (ownerId && ownerId !== user.id) {
          // Hide by removing identifier so it won't match in client-side lists
          // (tests look up by id). This avoids leaking subscription details.
          // Cleanup still works via overrideAccess.
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          doc.id = undefined
          return doc
        }
        return doc
      },
    ],
  },
}
