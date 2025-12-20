import { test, expect } from '@playwright/test'
import { getPayload, Payload } from 'payload'
import config from '../../src/payload.config'

let payload: Payload

const runId = `e2e-${Date.now()}-${Math.random().toString(16).slice(2)}`

const createOrganization = async () => {
  return payload.create({
    collection: 'organizations',
    data: {
      name: `Org ${runId}`,
      description: `Org for ${runId}`,
      type: 'other',
      status: 'active',
    },
    overrideAccess: true,
  })
}

const createUser = async () => {
  return payload.create({
    collection: 'users',
    data: {
      email: `user-${runId}@example.com`,
      password: 'TestPass1',
      firstName: 'Test',
      lastName: 'User',
      role: 'student',
    },
    overrideAccess: true,
  })
}

const createEvent = async (organizationId: string) => {
  return payload.create({
    collection: 'events',
    data: {
      title: `Event ${runId}`,
      description: `Event for ${runId}`,
      organization: organizationId,
      eventDate: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      category: 'workshop',
    },
    overrideAccess: true,
  })
}

test.describe('Event join/leave UI', () => {
  test.beforeAll(async () => {
    const payloadConfig = await config
    payload = await getPayload({ config: payloadConfig })
  })

  test('user joins and leaves event from event page', async ({ page }) => {
    const organization = await createOrganization()
    const user = await createUser()
    const event = await createEvent(organization.id)

    const loginResult = await payload.login({
      collection: 'users',
      data: {
        email: user.email,
        password: 'TestPass1',
      },
    })

    await page.addInitScript(({ token }) => {
      localStorage.setItem('token', token)
    }, { token: loginResult.token })

    await page.goto(`/events/${event.id}`)

    const button = page.getByTestId('event-join-button')
    await expect(button).toBeVisible()
    await expect(button).toHaveAttribute('data-joined', 'false')

    await button.click()
    await expect(button).toHaveAttribute('data-joined', 'true')

    page.once('dialog', (dialog) => dialog.accept())
    await button.click()
    await expect(button).toHaveAttribute('data-joined', 'false')
  })
})
