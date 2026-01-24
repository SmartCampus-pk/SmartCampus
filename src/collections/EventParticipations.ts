import type { CollectionConfig } from 'payload'

export const EventParticipations: CollectionConfig = {
  slug: 'event-participations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'user', 'status', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Read access: owners, org-admins/staff/super-admins can view
    read: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin' || user.role === 'staff') return true
      if (user.role === 'org-admin') return true // org-admins have broader access (filtered in admin UI)

      // Default: users can only read their own participations
      return {
        user: {
          equals: user.id,
        },
      }
    },

    // Only authenticated users can create participations. Users may only create participations for themselves
    create: ({ req: { user }, data }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      // If `user` was provided in payload data, ensure it matches the authenticated user
      if (data?.user && data.user !== user.id) return false
      return true
    },
    // Users can update their own participations
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true

      // Users can only update their own participations
      return {
        user: {
          equals: user.id,
        },
      }
    },
    // Users can delete their own participations (cancel)
    delete: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true

      return {
        user: {
          equals: user.id,
        },
      }
    },
  },
  fields: [
    {
      name: 'event',
      type: 'relationship',
      relationTo: 'events',
      required: true,
      index: true,
      admin: {
        description: 'Event the user is participating in',
      },
    },
    {
      name: 'user',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      index: true,
      admin: {
        description: 'User participating in the event',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'going',
      index: true,
      options: [
        {
          label: 'Going',
          value: 'going',
        },
        {
          label: 'Interested',
          value: 'interested',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      admin: {
        description: 'Participation status',
      },
    },
  ],
  hooks: {
    beforeChange: [
      async ({ req, operation, data, id, originalDoc }) => {
        console.debug('[EventParticipations.beforeChange] operation=', operation, 'id=', id, 'hasOriginal=', !!originalDoc, 'user=', req?.user?.id)
        // Ensure unique (event, user) pair
        if (operation === 'create') {
          const existing = await req.payload.find({
            collection: 'event-participations',
            where: {
              and: [
                {
                  event: {
                    equals: data.event,
                  },
                },
                {
                  user: {
                    equals: data.user,
                  },
                },
              ],
            },
            limit: 1,
          })

          if (existing.docs.length > 0) {
            throw new Error('User is already registered for this event')
          }
        }

        // Auto-set user from req.user if not provided
        if (!data.user && req.user) {
          data.user = req.user.id
        }

        // Server-side enforcement for updates/deletes: only owner or super-admin
        if (operation === 'update' || operation === 'delete') {
          if (!req.user) {
            throw new Error('Forbidden')
          }
          if (req.user.role === 'super-admin') return data

          // Prefer the provided originalDoc (Payload gives this for update operations)
          let ownerId: string | undefined
          if (originalDoc) {
            ownerId = typeof originalDoc.user === 'object' && originalDoc.user !== null ? originalDoc.user.id : originalDoc.user
            console.debug('[EventParticipations.beforeChange] ownerId from originalDoc=', ownerId)
          }

          // Fallback to fetching by id if originalDoc not present
          if (!ownerId) {
            const existingId = id || data?.id
            if (existingId) {
              const existingDoc = await req.payload.findByID({ collection: 'event-participations', id: existingId, overrideAccess: true }).catch(() => null)
              ownerId = typeof existingDoc?.user === 'object' && existingDoc?.user !== null ? existingDoc.user.id : existingDoc?.user
              console.debug('[EventParticipations.beforeChange] ownerId from findByID=', ownerId)
            }
          }

          if (ownerId && ownerId !== req.user.id) {
            throw new Error('Forbidden - cannot modify another user\'s participation')
          }
        }

        return data
      },
    ],
  },
  timestamps: true,
}
