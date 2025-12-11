import type { CollectionConfig } from 'payload'

export const EventParticipations: CollectionConfig = {
  slug: 'event-participations',
  admin: {
    useAsTitle: 'id',
    defaultColumns: ['event', 'user', 'status', 'createdAt'],
    group: 'Content',
  },
  access: {
    // Everyone can read (for displaying participant counts)
    read: () => true,
    // Only logged in users can create participations
    create: ({ req: { user } }) => !!user,
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
      async ({ req, operation, data }) => {
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

        return data
      },
    ],
  },
  timestamps: true,
}
