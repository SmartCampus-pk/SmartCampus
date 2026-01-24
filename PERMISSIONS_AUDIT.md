# Roles & Permissions Audit Report

Date: January 21, 2026

## Summary

This document outlines the access control configuration for the Smart Campus platform across all collections.

## User Roles

### 1. Student (`student`)
**Capabilities:**
- ✅ Read all active events and organizations
- ✅ Create and manage their own event participations
- ✅ Create and manage their own subscriptions
- ✅ Update their own profile
- ❌ Cannot create or edit events
- ❌ Cannot create or edit organizations
- ❌ Cannot access other users' participations or subscriptions

### 2. Organization Admin (`org-admin`)
**Capabilities:**
- ✅ All student capabilities
- ✅ Create events for their organization
- ✅ Edit events belonging to their organization
- ✅ Edit their own organization
- ✅ View participants for events in their organization
- ❌ Cannot edit events from other organizations
- ❌ Cannot create or edit other organizations
- ❌ Cannot delete events or organizations

### 3. Staff (`staff`)
**Capabilities:**
- ✅ Create new organizations
- ✅ Other permissions similar to students

### 4. Super Admin (`super-admin`)
**Capabilities:**
- ✅ Full access to all collections
- ✅ Can create, read, update, and delete any resource
- ✅ Can view deleted items
- ✅ Can change user roles
- ✅ Access to admin panel with full privileges

## Collection-Level Permissions

### Users
- **Read**: Public (anyone can read user profiles)
- **Create**: Public (self-registration enabled)
- **Update**: Own profile OR super-admin
- **Delete**: Super-admin only
- **Role changes**: Super-admin only

### Events
- **Read**: Anyone (non-deleted events)
  - Super-admins can see deleted events
- **Create**: Authenticated users
- **Update**: Org-admin (own org) OR super-admin
- **Delete**: Super-admin only (soft delete)

### Organizations
- **Read**: Anyone (active, non-deleted orgs)
  - Super-admins can see all
- **Create**: Staff OR super-admin
- **Update**: Org-admin (own org) OR super-admin
- **Delete**: Super-admin only (soft delete)

### Event Participations
- **Read**: Public (for displaying participant counts)
- **Create**: Authenticated users
- **Update**: Own participation OR super-admin
- **Delete**: Own participation OR super-admin

### Subscriptions
- **Read**: Own subscriptions only
- **Create**: Authenticated users
- **Update**: Own subscriptions OR super-admin
- **Delete**: Own subscriptions OR super-admin

### Notifications
- **Read**: Own notifications only
- **Create**: System generated
- **Update**: Own notifications (mark as read) OR super-admin
- **Delete**: Super-admin only

## Security Measures

### 1. Soft Deletes
- Events and Organizations use soft delete (set `deletedAt` timestamp)
- Prevents data loss and maintains referential integrity
- Deleted items hidden from regular users, visible to super-admins

### 2. Row-Level Security
- Users can only access their own:
  - Participations
  - Subscriptions
  - Notifications
- Org-admins scoped to their organization for events and org data

### 3. Field-Level Security
- Role field: Only super-admins can modify
- System fields (createdBy, updatedBy, deletedBy): Read-only

### 4. Validation & Business Logic
- Unique constraint: One participation per (event, user) pair
- Subscription type validation: Must specify either event OR organization
- Event date validation: Cannot create events in the past

## API Endpoints Security

### Public Endpoints
- `GET /api/health` - Health check
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Authenticated Endpoints
- `POST /api/events/[id]/join` - Requires authentication
- `POST /api/events/[id]/leave` - Requires authentication
- `GET /api/notifications/me` - User's own notifications
- `GET /api/me/events` - User's events

### Org-Admin Endpoints
- `GET /api/organizer/dashboard` - Org-admins only
- `GET /api/events/[id]/participants` - Org-admin of event's organization

### Admin-Only Endpoints
- Access via Payload admin panel (`/admin`)
- Full CRUD on all collections

## Test Coverage

Comprehensive test suite created: `tests/int/permissions.int.spec.ts`

**Test scenarios:**
- ✅ Student role permissions
- ✅ Org-admin role permissions
- ✅ Super-admin role permissions
- ✅ Cross-user access control
- ✅ Resource isolation
- ✅ Permission violations

## Recommendations

### Implemented ✅
1. Proper access control on all collections
2. Row-level security for user data
3. Soft deletes for critical collections
4. Field-level access control for sensitive fields

### Future Enhancements 💡
1. Add rate limiting for authentication endpoints
2. Implement API key authentication for integrations
3. Add audit logging for admin actions
4. Consider adding organization-level roles (moderator, member)
5. Add email verification for new accounts

## Compliance

- ✅ Principle of Least Privilege: Users have minimum necessary permissions
- ✅ Data Isolation: Users cannot access others' private data
- ✅ Role-Based Access Control (RBAC): Clear role hierarchy
- ✅ Audit Trail: createdBy, updatedBy, deletedBy fields track changes

## Conclusion

The permissions system is properly configured and tested. All user roles have appropriate access levels, and sensitive operations are restricted to authorized users only.
