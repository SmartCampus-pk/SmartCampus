import { OrganizationPageClient } from './OrganizationPageClient'
import '../../styles.css'

interface Organization {
  id: string
  name: string
  slug: string
  description: string
  type: string
  contactEmail?: string
  contactPhone?: string
  website?: string
  logo?: string | { url?: string }
}

interface Event {
  id: string
  title: string
  slug: string
  description: string
  eventDate: string
  location?: string
}

export const metadata = {
  title: 'Organizacja - Smart Campus',
  description: 'Szczegóły organizacji',
}

export async function generateStaticParams() {
  const { getPayload } = await import('payload')
  const payloadConfig = await import('@/payload.config').then((m) => m.default)
  const payload = await getPayload({ config: payloadConfig })

  const orgs = await payload.find({
    collection: 'organizations',
    limit: 100,
  })

  return orgs.docs.map((org: any) => ({
    id: org.id,
  }))
}

async function OrganizationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { getPayload } = await import('payload')
  const payloadConfig = await import('@/payload.config').then((m) => m.default)
  const payload = await getPayload({ config: payloadConfig })

  const org = await payload.findByID({
    collection: 'organizations',
    id,
  })

  const now = new Date().toISOString()
  const eventsRes = await payload.find({
    collection: 'events',
    where: {
      and: [
        { organization: { equals: id } },
        { eventDate: { greater_than: now } },
        { deletedAt: { exists: false } },
      ],
    },
    sort: 'eventDate',
    limit: 20,
  })

  const organization = org as Organization
  const events = eventsRes.docs as Event[]

  return <OrganizationPageClient organization={organization} events={events} />
}

export default OrganizationPage
