import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function GET() {
  try {
    const startTime = Date.now()
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Test database connection
    try {
      await payload.find({
        collection: 'users',
        limit: 1,
      })
    } catch (dbError) {
      logger.error('Database connection failed', dbError)
      return NextResponse.json(
        {
          status: 'error',
          database: 'disconnected',
          message: 'Database connection failed',
        },
        { status: 503 },
      )
    }

    const responseTime = Date.now() - startTime

    logger.info('Health check successful', { responseTime })

    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
    })
  } catch (error) {
    logger.error('Health check failed', error)
    return NextResponse.json(
      {
        status: 'error',
        message: 'Health check failed',
      },
      { status: 503 },
    )
  }
}
