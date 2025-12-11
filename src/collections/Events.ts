import type { CollectionConfig } from 'payload'
import { slugify, generateUniqueSlug } from '../lib/slugify'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'organization', 'eventDate', 'status', 'participantsCount'],
    group: 'Content',
    listSearchableFields: ['title', 'description', 'location'],
  },
  access: {
    // Everyone can read non-deleted events
    read: ({ req: { user } }) => {
      // Super admins can see deleted events
      if (user?.role === 'super-admin') return true

      // Others only see non-deleted
      return {
        deletedAt: {
          exists: false,
        },
      }
    },
    // Only logged in users can create events
    create: ({ req: { user } }) => !!user,
    // Organizers and org-admins of the event's organization can update
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true

      // Org admins can update events from their organization
      if (user.role === 'org-admin' && user.organization) {
        return {
          organization: {
            equals: user.organization,
          },
        }
      }

      // For now, allow all logged in users to update
      return true
    },
    // Only super-admins can delete events
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin'
    },
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      index: true,
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly version of the title (e.g., "my-event")',
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      required: true,
      index: true,
      admin: {
        description: 'Organization hosting this event (N:1 relationship)',
        position: 'sidebar',
      },
    },
    {
      name: 'eventDate',
      type: 'date',
      required: true,
      index: true,
      admin: {
        description: 'Date and time of the event',
        position: 'sidebar',
      },
      validate: (value, { operation }) => {
        if (!value) return true // Required validation handles this

        const eventDate = new Date(value)
        const now = new Date()

        // Only check for past dates on create, not on update
        if (operation === 'create' && eventDate < now) {
          return 'Event date cannot be in the past'
        }

        return true
      },
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'End date and time (for multi-day events)',
        position: 'sidebar',
      },
      validate: (value: Date | null | undefined, { data }: { data: any }) => {
        if (!value || !data?.eventDate) return true

        const endDate = new Date(value)
        const eventDate = new Date(data.eventDate)

        if (endDate <= eventDate) {
          return 'End date must be later than event date'
        }

        return true
      },
    },
    {
      name: 'location',
      type: 'text',
      admin: {
        description: 'Event location',
      },
    },
    {
      name: 'locationDetails',
      type: 'group',
      fields: [
        {
          name: 'building',
          type: 'text',
          admin: {
            description: 'Building name or number',
          },
        },
        {
          name: 'room',
          type: 'text',
          admin: {
            description: 'Room number',
          },
        },
        {
          name: 'address',
          type: 'text',
          admin: {
            description: 'Full address',
          },
        },
        {
          name: 'isOnline',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Is this an online event?',
          },
        },
        {
          name: 'onlineLink',
          type: 'text',
          admin: {
            description: 'Link for online event (e.g., Zoom, Teams)',
            condition: (data, siblingData) => siblingData?.isOnline,
          },
        },
      ],
      admin: {
        description: 'Detailed location information',
      },
    },
    {
      name: 'category',
      type: 'select',
      required: true,
      index: true,
      options: [
        {
          label: 'Workshop',
          value: 'workshop',
        },
        {
          label: 'Conference',
          value: 'conference',
        },
        {
          label: 'Seminar',
          value: 'seminar',
        },
        {
          label: 'Social Event',
          value: 'social',
        },
        {
          label: 'Competition',
          value: 'competition',
        },
        {
          label: 'Meeting',
          value: 'meeting',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Event category',
        position: 'sidebar',
      },
    },
    {
      name: 'capacity',
      type: 'number',
      min: 0,
      admin: {
        description: 'Maximum number of participants (optional)',
        position: 'sidebar',
      },
    },
    {
      name: 'participantsCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of participants (auto-calculated)',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'upcoming',
      index: true,
      options: [
        {
          label: 'Upcoming',
          value: 'upcoming',
        },
        {
          label: 'Ongoing',
          value: 'ongoing',
        },
        {
          label: 'Completed',
          value: 'completed',
        },
        {
          label: 'Cancelled',
          value: 'cancelled',
        },
      ],
      admin: {
        description: 'Current event status',
        position: 'sidebar',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags for categorization and search',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this event',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who last updated this event',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'deletedAt',
      type: 'date',
      admin: {
        description: 'Soft delete timestamp',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'deletedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who deleted this event',
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Auto-generate slug from title if not provided
        if (data?.title && (!data?.slug || operation === 'create')) {
          const baseSlug = slugify(data.title)
          data.slug = await generateUniqueSlug(
            baseSlug,
            'events',
            req.payload,
            operation === 'update' ? data.id : undefined,
          )
        }
        return data
      },
    ],
    beforeChange: [
      ({ req, operation, data }) => {
        if (req.user) {
          if (operation === 'create') {
            data.createdBy = req.user.id
          }
          data.updatedBy = req.user.id
        }
        return data
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Soft delete instead of hard delete
        await req.payload.update({
          collection: 'events',
          id,
          data: {
            deletedAt: new Date().toISOString(),
            deletedBy: req.user?.id,
          },
        })

        // Return false to prevent actual deletion
        return false
      },
    ],
    afterRead: [
      async ({ doc, req }) => {
        // Auto-calculate participants count from event-participations collection
        if (doc?.id) {
          const participations = await req.payload.count({
            collection: 'event-participations',
            where: {
              and: [
                {
                  event: {
                    equals: doc.id,
                  },
                },
                {
                  status: {
                    equals: 'going',
                  },
                },
              ],
            },
          })

          doc.participantsCount = participations.totalDocs
        }

        return doc
      },
    ],
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
}
