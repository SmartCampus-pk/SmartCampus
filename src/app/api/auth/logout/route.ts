import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'

export async function POST(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Logout invalidates the token server-side
    await payload.logout({ headers: request.headers })

    return NextResponse.json({ message: 'Logout successful' })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Logout failed' }, { status: 400 })
  }
}
