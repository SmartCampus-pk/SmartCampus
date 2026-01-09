import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token
    const { user } = await payload.auth({ headers: request.headers })

    if (!user) {
      logger.warn('Clear tests attempted without authentication')
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    let deletedCount = 0
    const results = {
      users: 0,
      events: 0,
      organizations: 0,
      subscriptions: 0,
      notifications: 0,
      participations: 0,
    }

    // Clean up users with test emails
    logger.info('Cleaning up test users...')
    const testUserPatterns = [
      'test-subscription',
      'test-notif',
      'test-profile',
      'user-',
      'join-',
      'admin-',
      'participant-',
      'e2e-',
    ]

    for (const pattern of testUserPatterns) {
      const users = await payload.find({
        collection: 'users',
        where: {
          email: {
            contains: pattern,
          },
        },
        limit: 1000,
      })

      for (const testUser of users.docs) {
        try {
          await payload.delete({ collection: 'users', id: testUser.id, overrideAccess: true })
          deletedCount++
          results.users++
        } catch (error) {
          logger.warn(`Failed to delete user ${testUser.id}:`, error as Record<string, any>)
        }
      }
    }

    // Clean up events with test titles
    logger.info('Cleaning up test events...')
    const testEventPatterns = [
      'Test Event',
      'Event run-',
      'Event e2e-',
      'Join event',
      'Event A',
      'Event B',
    ]

    for (const pattern of testEventPatterns) {
      const events = await payload.find({
        collection: 'events',
        where: {
          title: {
            contains: pattern,
          },
        },
        limit: 1000,
      })

      for (const event of events.docs) {
        try {
          await payload.delete({ collection: 'events', id: event.id, overrideAccess: true })
          deletedCount++
          results.events++
        } catch (error) {
          logger.warn(`Failed to delete event ${event.id}:`, error as Record<string, any>)
        }
      }
    }

    // Clean up organizations with test names
    logger.info('Cleaning up test organizations...')
    const testOrgPatterns = ['Org run-', 'Org e2e-', 'Org A', 'Org B', 'Org join']

    for (const pattern of testOrgPatterns) {
      const orgs = await payload.find({
        collection: 'organizations',
        where: {
          name: {
            contains: pattern,
          },
        },
        limit: 1000,
      })

      for (const org of orgs.docs) {
        try {
          await payload.delete({ collection: 'organizations', id: org.id, overrideAccess: true })
          deletedCount++
          results.organizations++
        } catch (error) {
          logger.warn(`Failed to delete organization ${org.id}:`, error as Record<string, any>)
        }
      }
    }

    // Clean up orphaned subscriptions
    logger.info('Cleaning up orphaned subscriptions...')
    const allSubscriptions = await payload.find({
      collection: 'subscriptions',
      limit: 1000,
    })

    for (const subscription of allSubscriptions.docs) {
      try {
        // Check if related user/event/org still exists
        const userId =
          typeof subscription.user === 'object' ? subscription.user.id : subscription.user
        const eventId = subscription.event
          ? typeof subscription.event === 'object'
            ? subscription.event.id
            : subscription.event
          : null
        const orgId = subscription.organization
          ? typeof subscription.organization === 'object'
            ? subscription.organization.id
            : subscription.organization
          : null

        let shouldDelete = false

        if (userId) {
          try {
            await payload.findByID({ collection: 'users', id: userId })
          } catch {
            shouldDelete = true
          }
        }

        if (eventId) {
          try {
            await payload.findByID({ collection: 'events', id: eventId })
          } catch {
            shouldDelete = true
          }
        }

        if (orgId) {
          try {
            await payload.findByID({ collection: 'organizations', id: orgId })
          } catch {
            shouldDelete = true
          }
        }

        // Also delete subscriptions for test users
        if (userId) {
          try {
            const subUser = await payload.findByID({ collection: 'users', id: userId })
            if (
              subUser.email &&
              testUserPatterns.some((pattern) => subUser.email.includes(pattern))
            ) {
              shouldDelete = true
            }
          } catch {}
        }

        if (shouldDelete) {
          await payload.delete({
            collection: 'subscriptions',
            id: subscription.id,
            overrideAccess: true,
          })
          deletedCount++
          results.subscriptions++
        }
      } catch (error) {
        logger.warn(
          `Failed to process subscription ${subscription.id}:`,
          error as Record<string, any>,
        )
      }
    }

    // Clean up orphaned notifications
    logger.info('Cleaning up orphaned notifications...')
    const allNotifications = await payload.find({
      collection: 'notifications',
      limit: 1000,
    })

    for (const notification of allNotifications.docs) {
      try {
        const userId =
          typeof notification.user === 'object' ? notification.user.id : notification.user

        if (userId) {
          try {
            const notifUser = await payload.findByID({ collection: 'users', id: userId })
            if (
              notifUser.email &&
              testUserPatterns.some((pattern) => notifUser.email.includes(pattern))
            ) {
              await payload.delete({
                collection: 'notifications',
                id: notification.id,
                overrideAccess: true,
              })
              deletedCount++
              results.notifications++
            }
          } catch {
            // User doesn't exist, delete notification
            await payload.delete({
              collection: 'notifications',
              id: notification.id,
              overrideAccess: true,
            })
            deletedCount++
            results.notifications++
          }
        }
      } catch (error) {
        logger.warn(
          `Failed to process notification ${notification.id}:`,
          error as Record<string, any>,
        )
      }
    }

    // Clean up orphaned event participations
    logger.info('Cleaning up orphaned event participations...')
    const allParticipations = await payload.find({
      collection: 'event-participations',
      limit: 1000,
    })

    for (const participation of allParticipations.docs) {
      try {
        const userId =
          typeof participation.user === 'object' ? participation.user.id : participation.user
        const eventId =
          typeof participation.event === 'object' ? participation.event.id : participation.event

        let shouldDelete = false

        if (userId) {
          try {
            const partUser = await payload.findByID({ collection: 'users', id: userId })
            if (
              partUser.email &&
              testUserPatterns.some((pattern) => partUser.email.includes(pattern))
            ) {
              shouldDelete = true
            }
          } catch {
            shouldDelete = true
          }
        }

        if (eventId) {
          try {
            await payload.findByID({ collection: 'events', id: eventId })
          } catch {
            shouldDelete = true
          }
        }

        if (shouldDelete) {
          await payload.delete({
            collection: 'event-participations',
            id: participation.id,
            overrideAccess: true,
          })
          deletedCount++
          results.participations++
        }
      } catch (error) {
        logger.warn(
          `Failed to process participation ${participation.id}:`,
          error as Record<string, any>,
        )
      }
    }

    logger.info('Test data cleanup completed', { deletedCount, results, userId: user.id })

    return NextResponse.json({
      success: true,
      message: `Cleanup complete! Deleted ${deletedCount} test records.`,
      deletedCount,
      results,
    })
  } catch (error: any) {
    logger.error('Test data cleanup error', error)
    return NextResponse.json(
      { error: error.message || 'Failed to cleanup test data' },
      { status: 500 },
    )
  }
}
