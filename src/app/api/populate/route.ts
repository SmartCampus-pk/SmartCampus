import { NextRequest, NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { logger } from '@/lib/logger'
import { slugify, generateUniqueSlug } from '@/lib/slugify'

export async function GET(request: NextRequest) {
  try {
    const payloadConfig = await config
    const payload = await getPayload({ config: payloadConfig })

    // Get authenticated user from JWT token (optional, but good practice)
    const { user } = await payload.auth({ headers: request.headers })

    const results = {
      organizations: [] as string[],
      events: [] as string[],
    }

    // Define organizations to create
    const organizationsData = [
      {
        name: 'Koło Naukowe Informatyków',
        type: 'scientific-circle',
        description:
          'Koło naukowe skupiające studentów zainteresowanych programowaniem, algorytmami i nowoczesnymi technologiami.',
        contactEmail: 'kni@university.edu.pl',
        website: 'https://kni.university.edu.pl',
        tags: [{ tag: 'informatyka' }, { tag: 'programowanie' }, { tag: 'technologia' }],
      },
      {
        name: 'Samorząd Studencki',
        type: 'student-government',
        description:
          'Reprezentacja studentów działająca na rzecz poprawy warunków studiowania i organizacji życia studenckiego.',
        contactEmail: 'samorzad@university.edu.pl',
        website: 'https://samorzad.university.edu.pl',
        tags: [{ tag: 'samorząd' }, { tag: 'studenci' }],
      },
      {
        name: 'Wydział Informatyki',
        type: 'faculty',
        description: 'Wydział prowadzący studia informatyczne na wszystkich poziomach kształcenia.',
        contactEmail: 'dziekanat@inf.university.edu.pl',
        website: 'https://inf.university.edu.pl',
        tags: [{ tag: 'wydział' }, { tag: 'informatyka' }],
      },
      {
        name: 'Koło Naukowe Robotyki',
        type: 'scientific-circle',
        description: 'Koło naukowe zajmujące się robotyką, automatyzacją i systemami wbudowanymi.',
        contactEmail: 'knr@university.edu.pl',
        tags: [{ tag: 'robotyka' }, { tag: 'automatyka' }],
      },
      {
        name: 'Klub Sportowy Uniwersytetu',
        type: 'student-organization',
        description:
          'Organizacja studencka promująca aktywność fizyczną i organizująca wydarzenia sportowe.',
        contactEmail: 'sport@university.edu.pl',
        tags: [{ tag: 'sport' }, { tag: 'aktywność' }],
      },
      {
        name: 'TechCorp Sp. z o.o.',
        type: 'company',
        description:
          'Firma technologiczna współpracująca z uniwersytetem w zakresie praktyk studenckich i projektów badawczych.',
        contactEmail: 'kontakt@techcorp.pl',
        website: 'https://techcorp.pl',
        tags: [{ tag: 'firma' }, { tag: 'praktyki' }],
      },
    ]

    // Create organizations
    logger.info('Creating organizations...')
    const createdOrganizations: { id: string; name: string }[] = []

    for (const orgData of organizationsData) {
      try {
        // Check if organization already exists
        const existing = await payload.find({
          collection: 'organizations',
          where: {
            name: {
              equals: orgData.name,
            },
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          logger.info(`Organization "${orgData.name}" already exists, skipping...`)
          createdOrganizations.push({
            id: existing.docs[0].id,
            name: orgData.name,
          })
          continue
        }

        const baseSlug = slugify(orgData.name)
        const uniqueSlug = await generateUniqueSlug(baseSlug, 'organizations', payload)

        const org = await payload.create({
          collection: 'organizations',
          data: {
            ...orgData,
            slug: uniqueSlug,
            status: 'active',
            createdBy: user?.id,
            updatedBy: user?.id,
          },
          overrideAccess: true,
        })

        createdOrganizations.push({
          id: org.id,
          name: org.name,
        })
        results.organizations.push(org.name)
        logger.info(`Created organization: ${org.name}`)
      } catch (error) {
        logger.error(
          `Failed to create organization "${orgData.name}"`,
          error as Record<string, any>,
        )
      }
    }

    // Generate events from January 2026 to May 2026
    logger.info('Creating events...')

    const eventTemplates = [
      {
        title: 'Warsztaty z React',
        description:
          'Praktyczne warsztaty z frameworka React - od podstaw do zaawansowanych technik.',
        category: 'workshop',
        location: 'Sala 101, Budynek A',
        locationDetails: {
          building: 'Budynek A',
          room: '101',
          isOnline: false,
        },
        capacity: 30,
      },
      {
        title: 'Konferencja Technologii Webowych',
        description: 'Konferencja prezentująca najnowsze trendy w technologiach webowych.',
        category: 'conference',
        location: 'Aula Główna',
        locationDetails: {
          building: 'Budynek Główny',
          room: 'Aula',
          isOnline: false,
        },
        capacity: 200,
      },
      {
        title: 'Seminarium: Sztuczna Inteligencja',
        description:
          'Seminarium naukowe poświęcone zastosowaniom sztucznej inteligencji w praktyce.',
        category: 'seminar',
        location: 'Sala 205, Budynek B',
        locationDetails: {
          building: 'Budynek B',
          room: '205',
          isOnline: false,
        },
        capacity: 50,
      },
      {
        title: 'Hackathon 2026',
        description: '24-godzinny maraton programistyczny - stwórz innowacyjny projekt!',
        category: 'competition',
        location: 'Centrum Konferencyjne',
        locationDetails: {
          building: 'Centrum Konferencyjne',
          room: 'Główna sala',
          isOnline: false,
        },
        capacity: 100,
      },
      {
        title: 'Spotkanie Koła Naukowego',
        description:
          'Cotygodniowe spotkanie członków koła naukowego - omówienie projektów i planów.',
        category: 'meeting',
        location: 'Sala 103, Budynek A',
        locationDetails: {
          building: 'Budynek A',
          room: '103',
          isOnline: false,
        },
        capacity: 25,
      },
      {
        title: 'Wieczór Integracyjny',
        description: 'Spotkanie integracyjne dla nowych członków organizacji.',
        category: 'social',
        location: 'Klub Studencki',
        locationDetails: {
          building: 'Klub Studencki',
          room: 'Główna sala',
          isOnline: false,
        },
        capacity: 80,
      },
      {
        title: 'Webinar: Cloud Computing',
        description: 'Webinar online o chmurze obliczeniowej i jej zastosowaniach.',
        category: 'workshop',
        location: 'Online',
        locationDetails: {
          isOnline: true,
          onlineLink: 'https://meet.university.edu.pl/webinar-cloud',
        },
        capacity: 500,
      },
      {
        title: 'Warsztaty z Machine Learning',
        description: 'Praktyczne warsztaty z uczenia maszynowego i analizy danych.',
        category: 'workshop',
        location: 'Laboratorium 301, Budynek C',
        locationDetails: {
          building: 'Budynek C',
          room: '301',
          isOnline: false,
        },
        capacity: 20,
      },
    ]

    // Generate dates from January 2026 to May 2026
    const startDate = new Date('2026-01-01T10:00:00')
    const endDate = new Date('2026-05-31T18:00:00')
    const events: Array<{
      title: string
      description: string
      category: string
      location: string
      locationDetails: any
      capacity: number
      eventDate: Date
      organizationId: string
    }> = []

    // Distribute events across the months
    let currentDate = new Date(startDate)
    let eventIndex = 0

    while (currentDate <= endDate) {
      // Create 2-3 events per week
      const dayOfWeek = currentDate.getDay()

      // Events typically on Tuesday, Thursday, and Saturday
      if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
        const template = eventTemplates[eventIndex % eventTemplates.length]
        const org = createdOrganizations[eventIndex % createdOrganizations.length]

        // Vary the time: morning (10:00), afternoon (14:00), or evening (18:00)
        const hours = [10, 14, 18][Math.floor(Math.random() * 3)]
        const eventDateTime = new Date(currentDate)
        eventDateTime.setHours(hours, 0, 0, 0)

        events.push({
          ...template,
          eventDate: eventDateTime,
          organizationId: org.id,
        })

        eventIndex++
      }

      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Create events in database
    for (const eventData of events) {
      try {
        // Make title unique by adding date if needed
        const dateStr = eventData.eventDate.toLocaleDateString('pl-PL', {
          month: 'long',
          day: 'numeric',
        })
        let eventTitle = eventData.title

        // Add date to title for recurring events to make them unique
        if (eventData.title.includes('Spotkanie') || eventData.title.includes('Warsztaty')) {
          eventTitle = `${eventData.title} - ${dateStr}`
        }

        // Check if event already exists (by title and date)
        const existing = await payload.find({
          collection: 'events',
          where: {
            and: [
              {
                title: {
                  equals: eventTitle,
                },
              },
              {
                eventDate: {
                  equals: eventData.eventDate.toISOString(),
                },
              },
            ],
          },
          limit: 1,
        })

        if (existing.docs.length > 0) {
          logger.info(
            `Event "${eventTitle}" on ${eventData.eventDate.toISOString()} already exists, skipping...`,
          )
          continue
        }

        const baseSlug = slugify(eventTitle)
        const uniqueSlug = await generateUniqueSlug(baseSlug, 'events', payload)

        const event = await payload.create({
          collection: 'events',
          data: {
            title: eventTitle,
            slug: uniqueSlug,
            description: eventData.description,
            organization: eventData.organizationId,
            eventDate: eventData.eventDate.toISOString(),
            location: eventData.location,
            locationDetails: eventData.locationDetails,
            category: eventData.category,
            capacity: eventData.capacity,
            status: 'upcoming',
            participantsCount: 0,
            createdBy: user?.id,
            updatedBy: user?.id,
          },
          overrideAccess: true,
        })

        results.events.push(event.title)
        logger.info(`Created event: ${event.title} on ${eventData.eventDate.toISOString()}`)
      } catch (error) {
        logger.error(`Failed to create event "${eventData.title}"`, error as Record<string, any>)
      }
    }

    logger.info('Database population completed', {
      organizationsCount: results.organizations.length,
      eventsCount: results.events.length,
      userId: user?.id,
    })

    return NextResponse.json({
      success: true,
      message: `Database populated successfully! Created ${results.organizations.length} organizations and ${results.events.length} events.`,
      results: {
        organizations: results.organizations.length,
        events: results.events.length,
        organizationNames: results.organizations,
        eventTitles: results.events.slice(0, 10), // Show first 10 event titles
      },
    })
  } catch (error: any) {
    logger.error('Database population error', error)
    return NextResponse.json(
      { error: error.message || 'Failed to populate database' },
      { status: 500 },
    )
  }
}
