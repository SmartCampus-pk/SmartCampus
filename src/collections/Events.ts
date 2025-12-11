import type { CollectionConfig } from 'payload'

export const Events: CollectionConfig = {
  slug: 'events',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'organization', 'eventDate', 'status', 'featured'],
    group: 'Content',
  },
  access: {
    read: () => true,
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
      name: 'content',
      type: 'richText',
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
    },
    {
      name: 'endDate',
      type: 'date',
      admin: {
        description: 'End date and time (for multi-day events)',
        position: 'sidebar',
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
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Featured image for the event',
      },
    },
    {
      name: 'gallery',
      type: 'array',
      fields: [
        {
          name: 'image',
          type: 'upload',
          relationTo: 'media',
        },
      ],
      admin: {
        description: 'Additional images for the event',
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
        description: 'Maximum number of participants',
        position: 'sidebar',
      },
    },
    {
      name: 'registeredCount',
      type: 'number',
      min: 0,
      defaultValue: 0,
      admin: {
        description: 'Number of registered participants',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'registrationRequired',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Is registration required for this event?',
        position: 'sidebar',
      },
    },
    {
      name: 'registrationDeadline',
      type: 'date',
      admin: {
        description: 'Registration deadline',
        position: 'sidebar',
        condition: (data) => data.registrationRequired,
      },
    },
    {
      name: 'registrationLink',
      type: 'text',
      admin: {
        description: 'External registration link',
        condition: (data) => data.registrationRequired,
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Feature this event on the homepage',
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
      name: 'organizers',
      type: 'array',
      fields: [
        {
          name: 'organizer',
          type: 'relationship',
          relationTo: 'users',
        },
      ],
      admin: {
        description: 'Event organizers',
      },
    },
    {
      name: 'sponsors',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
        },
        {
          name: 'logo',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'website',
          type: 'text',
        },
      ],
      admin: {
        description: 'Event sponsors',
      },
    },
  ],
  versions: {
    drafts: true,
  },
  timestamps: true,
}
