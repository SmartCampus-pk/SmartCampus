import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get organization
    let organization
    try {
      organization = await payload.findByID({
        collection: 'organizations',
        id,
        depth: 2,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (!organization) {
      logger.warn('Organization not found', { organizationId: id })
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check if organization is active and not deleted
    if (organization.status !== 'active' || organization.deletedAt) {
      logger.warn('Organization not accessible', {
        organizationId: id,
        status: organization.status,
      })
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    logger.info('Organization fetched', { organizationId: id })
    return NextResponse.json({ organization })
  } catch (error: any) {
    let orgId = 'unknown'
    try {
      const paramsData = await params
      orgId = paramsData.id
    } catch {
      // params not available
    }
    logger.error('Get organization error', error, { organizationId: orgId })
    return NextResponse.json(
      { error: error.message || 'Failed to get organization' },
      { status: 400 },
    )
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Verify organization exists
    let organization
    try {
      organization = await payload.findByID({
        collection: 'organizations',
        id,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    if (!organization) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check permissions: only org-admin assigned to this organization or super-admin can update
    const userOrganizationId =
      typeof user.organization === 'object' && user.organization !== null
        ? user.organization.id
        : user.organization

    if (user.role !== 'super-admin' && (user.role !== 'org-admin' || userOrganizationId !== id)) {
      logger.warn('Unauthorized organization update attempt', {
        userId: user.id,
        organizationId: id,
        userRole: user.role,
      })
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const body = await request.json()

    // Only allow updating specific fields (description, contact info)
    const allowedFields = ['description', 'contactEmail', 'contactPhone', 'website']
    const updateData: any = {}

    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }

    // Update organization
    const updated = await payload.update({
      collection: 'organizations',
      id,
      data: updateData,
    })

    logger.info('Organization updated', {
      organizationId: id,
      userId: user.id,
      updatedFields: Object.keys(updateData),
    })
    return NextResponse.json({
      organization: updated,
      message: 'Organization updated successfully',
    })
  } catch (error: any) {
    let orgId = 'unknown'
    let userId = 'unknown'
    try {
      const paramsData = await params
      orgId = paramsData.id
      const payloadConfig = await config
      const payloadInstance = await getPayload({ config: payloadConfig })
      const authResult = await payloadInstance
        .auth({ headers: request.headers })
        .catch(() => ({ user: null }))
      if (authResult.user) {
        userId = authResult.user.id
      }
    } catch {
      // params/auth not available
    }
    logger.error('Update organization error', error, { organizationId: orgId, userId })
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 400 },
    )
  }
}
