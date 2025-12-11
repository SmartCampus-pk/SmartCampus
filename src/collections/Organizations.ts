import type { CollectionConfig } from 'payload'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'createdAt'],
    group: 'Content',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      index: true,
      admin: {
        description: 'Official name of the organization',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'URL-friendly version of the name',
        position: 'sidebar',
      },
    },
    {
      name: 'type',
      type: 'select',
      required: true,
      index: true,
      options: [
        {
          label: 'Scientific Circle',
          value: 'scientific-circle',
        },
        {
          label: 'Student Organization',
          value: 'student-organization',
        },
        {
          label: 'Faculty',
          value: 'faculty',
        },
        {
          label: 'Department',
          value: 'department',
        },
        {
          label: 'Student Government',
          value: 'student-government',
        },
        {
          label: 'Other',
          value: 'other',
        },
      ],
      admin: {
        description: 'Type of organization',
        position: 'sidebar',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      admin: {
        description: 'Short description of the organization',
      },
    },
    {
      name: 'fullDescription',
      type: 'richText',
      admin: {
        description: 'Detailed information about the organization',
      },
    },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Organization logo',
        position: 'sidebar',
      },
    },
    {
      name: 'coverImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Cover image for organization page',
      },
    },
    {
      name: 'contactEmail',
      type: 'email',
      admin: {
        description: 'Primary contact email',
      },
    },
    {
      name: 'contactPhone',
      type: 'text',
      admin: {
        description: 'Contact phone number',
      },
    },
    {
      name: 'website',
      type: 'text',
      admin: {
        description: 'Organization website URL',
      },
    },
    {
      name: 'socialMedia',
      type: 'group',
      fields: [
        {
          name: 'facebook',
          type: 'text',
          admin: {
            description: 'Facebook profile URL',
          },
        },
        {
          name: 'instagram',
          type: 'text',
          admin: {
            description: 'Instagram profile URL',
          },
        },
        {
          name: 'twitter',
          type: 'text',
          admin: {
            description: 'Twitter/X profile URL',
          },
        },
        {
          name: 'linkedin',
          type: 'text',
          admin: {
            description: 'LinkedIn profile URL',
          },
        },
        {
          name: 'youtube',
          type: 'text',
          admin: {
            description: 'YouTube channel URL',
          },
        },
      ],
      admin: {
        description: 'Social media profiles',
      },
    },
    {
      name: 'location',
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
      ],
      admin: {
        description: 'Physical location details',
      },
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      index: true,
      options: [
        {
          label: 'Active',
          value: 'active',
        },
        {
          label: 'Inactive',
          value: 'inactive',
        },
        {
          label: 'Pending Approval',
          value: 'pending',
        },
        {
          label: 'Suspended',
          value: 'suspended',
        },
      ],
      admin: {
        description: 'Current status of the organization',
        position: 'sidebar',
      },
    },
    {
      name: 'foundedYear',
      type: 'number',
      admin: {
        description: 'Year the organization was founded',
        position: 'sidebar',
      },
    },
    {
      name: 'memberCount',
      type: 'number',
      admin: {
        description: 'Number of active members',
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
      name: 'featured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: {
        description: 'Feature this organization on the homepage',
        position: 'sidebar',
      },
    },
  ],
  versions: {
    drafts: true,
  },
  timestamps: true,
}
