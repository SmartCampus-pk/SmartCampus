import '../styles.css'
import { OrganizationsPageClient } from './OrganizationsPageClient'

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

export const metadata = {
  title: 'Organizacje - Smart Campus',
  description: 'Przeglądaj organizacje, koła naukowe i samorządy na kampusie',
}

async function OrganizationsPage() {
  const { getPayload } = await import('payload')
  const payloadConfig = await import('@/payload.config').then((m) => m.default)
  const payload = await getPayload({ config: payloadConfig })

  const orgsResult = await payload.find({
    collection: 'organizations',
    where: {
      status: {
        equals: 'active',
      },
    },
    sort: '-createdAt',
    limit: 100,
  })

  const organizations = orgsResult.docs as Organization[]

  return <OrganizationsPageClient initialOrganizations={organizations} />
}

export default OrganizationsPage
