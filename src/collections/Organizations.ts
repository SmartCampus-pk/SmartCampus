import type { CollectionConfig } from 'payload'
import { slugify, generateUniqueSlug } from '../lib/slugify'

export const Organizations: CollectionConfig = {
  slug: 'organizations',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'status', 'createdAt'],
    group: 'Content',
    listSearchableFields: ['name', 'description'],
  },
  access: {
    // Everyone can read active, non-deleted organizations
    read: ({ req: { user } }) => {
      // Super admins can see all
      if (user?.role === 'super-admin') return true
      // Others can only see active and non-deleted organizations
      return {
        status: {
          equals: 'active',
        },
        deletedAt: {
          exists: false,
        },
      }
    },
    // Only staff and super-admins can create organizations
    create: ({ req: { user } }) => {
      return user?.role === 'staff' || user?.role === 'super-admin'
    },
    // Org admins can update their own organization, super-admins can update all
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      if (user.role === 'org-admin' && user.organization) {
        return {
          id: {
            equals: user.organization,
          },
        }
      }
      return false
    },
    // Only super-admins can delete organizations
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin'
    },
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
          label: 'Company',
          value: 'company',
        },
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'Organization logo',
        position: 'sidebar',
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
        description: 'User who created this organization',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who last updated this organization',
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
        description: 'User who deleted this organization',
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      async ({ data, req, operation }) => {
        // Auto-generate slug from name if not provided
        if (data?.name && (!data?.slug || operation === 'create')) {
          const baseSlug = slugify(data.name)
          data.slug = await generateUniqueSlug(
            baseSlug,
            'organizations',
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
    // TEMPORARILY DISABLED - causes performance issues
    // TODO: Optimize or move to API endpoint
    // afterRead: [
    //   async ({ doc, req }) => {
    //     if (!doc || !doc.id) return doc
    //     const upcomingEvents = await req.payload.find({
    //       collection: 'events',
    //       where: { organization: { equals: doc.id }, eventDate: { greater_than: new Date().toISOString() } },
    //       limit: 0,
    //     })
    //     const totalEvents = await req.payload.find({
    //       collection: 'events',
    //       where: { organization: { equals: doc.id } },
    //       limit: 0,
    //     })
    //     const activeMembers = await req.payload.find({
    //       collection: 'users',
    //       where: { organization: { equals: doc.id }, isActive: { equals: true } },
    //       limit: 0,
    //     })
    //     return {
    //       ...doc,
    //       upcomingEventsCount: upcomingEvents.totalDocs,
    //       totalEventsCount: totalEvents.totalDocs,
    //       activeMembersCount: activeMembers.totalDocs,
    //     }
    //   },
    // ],
    beforeDelete: [
      async ({ req, id }) => {
        // Soft delete instead of hard delete
        await req.payload.update({
          collection: 'organizations',
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
  },
  versions: {
    drafts: true,
  },
  timestamps: true,
}
