import { APP_STORE_URL, GOOGLE_PLAY_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'

const author = { '@type': 'Person', name: 'Luke Boyle' }
const free = { '@type': 'Offer', price: '0', priceCurrency: 'AUD' }

/** The site, the web app and each mobile app that is in a store. */
export function homeStructuredData(): Record<string, unknown>[] {
  const data: Record<string, unknown>[] = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: SITE_NAME,
      url: `${SITE_URL}/`,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
    },
    {
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: SITE_NAME,
      url: `${SITE_URL}/app/`,
      description: SITE_DESCRIPTION,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: 'Any',
      browserRequirements: 'Requires JavaScript',
      isAccessibleForFree: true,
      offers: free,
      author,
    },
  ]
  if (APP_STORE_URL || GOOGLE_PLAY_URL) {
    data.push({
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      applicationCategory: 'LifestyleApplication',
      operatingSystem: [APP_STORE_URL && 'iOS', GOOGLE_PLAY_URL && 'Android'].filter(Boolean).join(', '),
      installUrl: APP_STORE_URL || GOOGLE_PLAY_URL,
      sameAs: [APP_STORE_URL, GOOGLE_PLAY_URL].filter(Boolean),
      isAccessibleForFree: true,
      offers: free,
      author,
    })
  }
  return data
}

export function breadcrumbs(items: { name: string; path: string }[]): Record<string, unknown> {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  }
}
