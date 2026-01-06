import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

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
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    // Check if organization is active and not deleted
    if (organization.status !== 'active' || organization.deletedAt) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 })
    }

    return NextResponse.json({ organization })
  } catch (error: any) {
    console.error('Get organization error:', error)
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

    return NextResponse.json({
      organization: updated,
      message: 'Organization updated successfully',
    })
  } catch (error: any) {
    console.error('Update organization error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update organization' },
      { status: 400 },
    )
  }
}
