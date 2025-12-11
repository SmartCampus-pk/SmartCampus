import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'organization'],
    group: 'Admin',
    listSearchableFields: ['email', 'firstName', 'lastName', 'studentId'],
  },
  auth: true,
  access: {
    // Everyone can read users (for displaying organizers, members etc)
    read: () => true,
    // Only logged in users can create accounts (or public if you want self-registration)
    create: () => true,
    // Users can update their own profile, super-admins can update anyone
    update: ({ req: { user } }) => {
      if (!user) return false
      if (user.role === 'super-admin') return true
      // Users can only update their own profile
      return {
        id: {
          equals: user.id,
        },
      }
    },
    // Only super-admins can delete users
    delete: ({ req: { user } }) => {
      return user?.role === 'super-admin'
    },
  },
  fields: [
    // Email added by default by auth: true
    {
      name: 'firstName',
      type: 'text',
      required: true,
      admin: {
        description: 'User first name',
      },
    },
    {
      name: 'lastName',
      type: 'text',
      required: true,
      admin: {
        description: 'User last name',
      },
    },
    {
      name: 'avatar',
      type: 'upload',
      relationTo: 'media',
      admin: {
        description: 'User profile picture',
        position: 'sidebar',
      },
    },
    {
      name: 'role',
      type: 'select',
      required: true,
      defaultValue: 'student',
      index: true,
      options: [
        {
          label: 'Student',
          value: 'student',
        },
        {
          label: 'Organization Admin',
          value: 'org-admin',
        },
        {
          label: 'Staff',
          value: 'staff',
        },
        {
          label: 'Super Admin',
          value: 'super-admin',
        },
      ],
      admin: {
        description: 'User role in the system',
        position: 'sidebar',
      },
      // Only super-admins can change roles
      access: {
        create: ({ req: { user } }) => user?.role === 'super-admin',
        update: ({ req: { user } }) => user?.role === 'super-admin',
      },
    },
    {
      name: 'organization',
      type: 'relationship',
      relationTo: 'organizations',
      index: true,
      admin: {
        description: 'Organization the user belongs to (N:1 relationship)',
        position: 'sidebar',
      },
    },
    {
      name: 'studentId',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        description: 'Student ID number (index number)',
      },
    },
    {
      name: 'bio',
      type: 'textarea',
      admin: {
        description: 'Short biography or description',
      },
    },
    {
      name: 'phone',
      type: 'text',
      admin: {
        description: 'Phone number',
      },
    },
    {
      name: 'faculty',
      type: 'text',
      admin: {
        description: 'Faculty name',
      },
    },
    {
      name: 'fieldOfStudy',
      type: 'text',
      admin: {
        description: 'Field of study',
      },
    },
    {
      name: 'yearOfStudy',
      type: 'number',
      min: 1,
      max: 7,
      admin: {
        description: 'Current year of study',
      },
    },
    {
      name: 'interests',
      type: 'array',
      fields: [
        {
          name: 'interest',
          type: 'text',
        },
      ],
      admin: {
        description: 'User interests and areas of focus',
      },
    },
    {
      name: 'notifications',
      type: 'group',
      fields: [
        {
          name: 'emailNotifications',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive email notifications',
          },
        },
        {
          name: 'eventReminders',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive event reminders',
          },
        },
        {
          name: 'organizationUpdates',
          type: 'checkbox',
          defaultValue: true,
          admin: {
            description: 'Receive organization updates',
          },
        },
      ],
      admin: {
        description: 'Notification preferences',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: {
        description: 'Account active status',
        position: 'sidebar',
      },
    },
    {
      name: 'lastLoginAt',
      type: 'date',
      admin: {
        description: 'Last login timestamp',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who created this account',
        position: 'sidebar',
        readOnly: true,
      },
    },
    {
      name: 'updatedBy',
      type: 'relationship',
      relationTo: 'users',
      admin: {
        description: 'User who last updated this account',
        position: 'sidebar',
        readOnly: true,
      },
    },
  ],
  hooks: {
    beforeValidate: [
      ({ data, operation }) => {
        // Password validation on registration
        if (operation === 'create' && data?.password) {
          // Minimum 8 characters
          if (data.password.length < 8) {
            throw new Error('Hasło musi mieć minimum 8 znaków')
          }

          // Must contain at least one digit
          if (!/\d/.test(data.password)) {
            throw new Error('Hasło musi zawierać co najmniej jedną cyfrę')
          }

          // Must contain at least one uppercase letter
          if (!/[A-Z]/.test(data.password)) {
            throw new Error('Hasło musi zawierać co najmniej jedną dużą literę')
          }
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
  },
  timestamps: true,
}
