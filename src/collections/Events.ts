import type { CollectionConfig } from 'payload'
import { slugify, generateUniqueSlug } from '../lib/slugify'
import { logger } from '../lib/logger'
import type { Event } from '../payload-types'

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
    // Only org-admins and super-admins can create events
    create: ({ req: { user } }) => {
      if (!user) return false
      return user.role === 'org-admin' || user.role === 'super-admin'
    },
    // Only org-admins of the event's organization (or super-admin) can update
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

      // Other roles cannot update events
      return false
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
      validate: (value: Date | null | undefined, { data }: { data: Partial<Event> }) => {
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
    afterChange: [
      async ({ doc, req, previousDoc, operation }) => {
        // Only generate notifications on update, not on create
        if (operation !== 'update' || !previousDoc || !doc) {
          return doc
        }

        const changes: string[] = []
        const eventId = doc.id

        // Check for date change
        if (previousDoc.eventDate && doc.eventDate && previousDoc.eventDate !== doc.eventDate) {
          changes.push('date')
        }

        // Check for location change
        const previousLocation = previousDoc.location || ''
        const currentLocation = doc.location || ''
        if (previousLocation !== currentLocation) {
          changes.push('location')
        }

        // Check for status change to cancelled
        if (previousDoc.status !== 'cancelled' && doc.status === 'cancelled') {
          changes.push('cancelled')
        }

        // If no relevant changes, skip notification generation
        if (changes.length === 0) {
          return doc
        }

        try {
          // Find all users subscribed to this event
          const eventSubscriptions = await req.payload.find({
            collection: 'subscriptions',
            where: {
              and: [
                {
                  type: {
                    equals: 'event',
                  },
                },
                {
                  event: {
                    equals: eventId,
                  },
                },
              ],
            },
            limit: 1000,
          })

          // Find all users subscribed to the event's organization
          const organizationId =
            typeof doc.organization === 'object' && doc.organization !== null
              ? doc.organization.id
              : doc.organization

          const orgSubscriptions = organizationId
            ? await req.payload.find({
                collection: 'subscriptions',
                where: {
                  and: [
                    {
                      type: {
                        equals: 'organization',
                      },
                    },
                    {
                      organization: {
                        equals: organizationId,
                      },
                    },
                  ],
                },
                limit: 1000,
              })
            : { docs: [] }

          // Combine all unique user IDs
          const userIds = new Set<string>()
          eventSubscriptions.docs.forEach((sub) => {
            const userId =
              typeof sub.user === 'object' && sub.user !== null ? sub.user.id : sub.user
            if (userId) userIds.add(userId)
          })
          orgSubscriptions.docs.forEach((sub) => {
            const userId =
              typeof sub.user === 'object' && sub.user !== null ? sub.user.id : sub.user
            if (userId) userIds.add(userId)
          })

          // Generate notification messages based on changes
          let title = ''
          let message = ''
          let notificationType: 'event_update' | 'announcement' = 'event_update'

          if (changes.includes('cancelled')) {
            title = `Event Cancelled: ${doc.title}`
            message = `The event "${doc.title}" has been cancelled.`
            notificationType = 'event_update'
          } else if (changes.includes('date') && changes.includes('location')) {
            title = `Event Updated: ${doc.title}`
            message = `The event "${doc.title}" has been updated. Date and location have changed.`
            notificationType = 'event_update'
          } else if (changes.includes('date')) {
            title = `Event Date Changed: ${doc.title}`
            const newDate = new Date(doc.eventDate).toLocaleString()
            message = `The event "${doc.title}" date has been changed to ${newDate}.`
            notificationType = 'event_update'
          } else if (changes.includes('location')) {
            title = `Event Location Changed: ${doc.title}`
            message = `The event "${doc.title}" location has been changed${currentLocation ? ` to ${currentLocation}` : ''}.`
            notificationType = 'event_update'
          }

          // Create notifications for all subscribed users
          if (title && message && userIds.size > 0) {
            logger.info('Generating notifications for event update', {
              eventId,
              changes,
              subscribersCount: userIds.size,
            })

            const notificationPromises = Array.from(userIds).map((userId) =>
              req.payload.create({
                collection: 'notifications',
                data: {
                  user: userId,
                  title,
                  message,
                  type: notificationType,
                  relatedEvent: eventId,
                  isRead: false,
                },
              }),
            )

            await Promise.all(notificationPromises)
            logger.info('Notifications created successfully', {
              eventId,
              notificationsCount: userIds.size,
            })
          }
        } catch (error) {
          // Log error but don't fail the event update
          logger.error('Error generating notifications', error, { eventId, changes })
        }

        return doc
      },
    ],
    beforeDelete: [
      async ({ req, id }) => {
        // Skip soft delete logic if there's no user (system/admin operations)
        if (!req.user) {
          return false // Allow the delete operation
        }

        // Only super-admins can soft delete
        if (req.user.role !== 'super-admin') {
          throw new Error('Forbidden - only super-admins can delete events')
        }

        // Soft delete instead of hard delete
        // Need to bypass access control to update the deleted event
        await req.payload.update({
          collection: 'events',
          id,
          data: {
            deletedAt: new Date().toISOString(),
            deletedBy: req.user.id,
          },
          overrideAccess: true,
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
  timestamps: true,
}
