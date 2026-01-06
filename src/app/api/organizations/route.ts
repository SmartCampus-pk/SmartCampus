import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get search query parameter
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    // Build where clause
    const where: any = {
      and: [
        {
          status: {
            equals: 'active',
          },
        },
        {
          deletedAt: {
            exists: false,
          },
        },
      ],
    }

    // Add search filter if provided
    if (search) {
      where.and.push({
        or: [
          {
            name: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
            },
          },
        ],
      })
    }

    // Get organizations
    const organizations = await payload.find({
      collection: 'organizations',
      where,
      limit: 100,
      sort: 'name',
      depth: 1,
    })

    logger.info('Organizations fetched', { count: organizations.totalDocs, search })
    return NextResponse.json({
      organizations: organizations.docs,
      total: organizations.totalDocs,
    })
  } catch (error: any) {
    let searchTerm = ''
    try {
      const { searchParams } = new URL(request.url)
      searchTerm = searchParams.get('search') || ''
    } catch {
      // url not available
    }
    logger.error('Get organizations error', error, { search: searchTerm })
    return NextResponse.json(
      { error: error.message || 'Failed to get organizations' },
      { status: 400 },
    )
  }
}
