import { NextResponse } from 'next/server'

export async function POST() {
  // JWT tokens are stateless, so logout is handled client-side
  // by clearing the token from localStorage
  // This endpoint just confirms the logout request was received
  return NextResponse.json({ message: 'Logout successful' })
}
