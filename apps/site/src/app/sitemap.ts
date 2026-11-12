import { type MetadataRoute } from 'next'

import { readingDays } from '@/lib/readings'
import { SEASONS } from '@/lib/seasons'
import { SITE_URL } from '@/lib/site'

export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: 'monthly', priority: 1 },
    { url: `${SITE_URL}/app/`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/readings/`, changeFrequency: 'yearly', priority: 0.8 },
    ...SEASONS.map((season) => ({
      url: `${SITE_URL}/readings/${season.slug}/`,
      changeFrequency: 'yearly' as const,
      priority: 0.7,
    })),
    ...readingDays().map((day) => ({
      url: `${SITE_URL}/readings/${day.id}/`,
      changeFrequency: 'yearly' as const,
      priority: day.isSunday ? 0.7 : 0.5,
    })),
  ]
}
