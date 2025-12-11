import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getRemainingTime } from '@/lib/rateLimiter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 })
    }

    // Rate limiting based on email
    const identifier = `login:${email.toLowerCase()}`

    if (!checkRateLimit(identifier, 5, 15 * 60 * 1000)) {
      const remainingTime = getRemainingTime(identifier)
      return NextResponse.json(
        {
          error: `Too many login attempts. Please try again in ${Math.ceil(remainingTime / 60)} minutes.`,
          remainingTime,
        },
        { status: 429 },
      )
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Attempt login using Payload's built-in auth
    const result = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    return NextResponse.json({
      message: 'Login successful',
      token: result.token,
      user: result.user,
      exp: result.exp,
    })
  } catch (error: any) {
    // Invalid credentials
    return NextResponse.json(
      { error: error.message || 'Invalid email or password' },
      { status: 401 },
    )
  }
}
