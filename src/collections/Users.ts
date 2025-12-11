import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'firstName', 'lastName', 'role', 'organization'],
    group: 'Admin',
  },
  auth: true,
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
  ],
  timestamps: true,
}
