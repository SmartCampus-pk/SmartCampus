import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { checkRateLimit, getRemainingTime } from '@/lib/rateLimiter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, firstName, lastName } = body

    // Validation
    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'All fields are required: email, password, firstName, lastName' },
        { status: 400 },
      )
    }

    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Rate limiting: by IP and by email to prevent abuse
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.headers.get('x-real-ip') || 'unknown'
    const ipIdentifier = `register:ip:${ip}`
    const emailIdentifier = `register:email:${email?.toLowerCase()}`

    // Allow up to 10 registrations per IP per hour
    if (!checkRateLimit(ipIdentifier, 10, 60 * 60 * 1000)) {
      const remaining = getRemainingTime(ipIdentifier)
      return NextResponse.json({ error: `Too many registrations from this IP. Try again later.`, remainingTime: remaining }, { status: 429 })
    }

    // Allow up to 3 registrations per email per day
    if (!checkRateLimit(emailIdentifier, 3, 24 * 60 * 60 * 1000)) {
      const remaining = getRemainingTime(emailIdentifier)
      return NextResponse.json({ error: `Too many registration attempts for this email. Try again later.`, remainingTime: remaining }, { status: 429 })
    }

    // Create user (password validation happens in beforeValidate hook)
    const user = await payload.create({
      collection: 'users',
      data: {
        email,
        password,
        firstName,
        lastName,
        role: 'student', // Default role for new registrations
      },
    })

    // Auto-login after registration
    const loginResult = await payload.login({
      collection: 'users',
      data: { email, password },
    })

    return NextResponse.json(
      {
        message: 'Registration successful',
        token: loginResult.token,
        user: loginResult.user,
        exp: loginResult.exp,
      },
      { status: 201 },
    )
  } catch (error: any) {
    // Handle validation errors from hooks
    if (error.message.includes('Hasło') || error.message.includes('Password')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Handle duplicate email
    if (error.message.includes('duplicate') || error.message.includes('E11000')) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
    }

    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 400 })
  }
}
