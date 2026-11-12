import { type Metadata } from 'next'
import Link from 'next/link'

import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { GetTheApp } from '@/components/GetTheApp'
import { JsonLd } from '@/components/JsonLd'
import { PageHeader } from '@/components/PageHeader'
import { readingDays, type ReadingDay } from '@/lib/readings'
import { OG_IMAGE } from '@/lib/site'
import { breadcrumbs } from '@/lib/structuredData'
import { weeks } from '@/lib/format'

import { TodayLink } from './TodayLink'

export const metadata: Metadata = {
  title: 'Daily readings for the church year',
  description:
    'The lessons of the 1922 table and the collects of the 1662 Book of Common Prayer for each day of the church year, from Advent to the Sunday next before Advent. Canonical lessons replace the Apocrypha.',
  alternates: { canonical: '/readings/' },
  openGraph: {
    title: 'Daily readings for the church year',
    description: 'The 1922 lessons and the 1662 collect for each day of the church year.',
    url: '/readings/',
    images: [OG_IMAGE],
  },
}

export default function ReadingsPage() {
  const days = readingDays()
  const seasons: { slug: string; name: string; days: ReadingDay[] }[] = []
  for (const day of days) {
    const last = seasons[seasons.length - 1]
    if (last?.slug === day.season) last.days.push(day)
    else seasons.push({ slug: day.season, name: day.seasonName, days: [day] })
  }

  return (
    <>
      <JsonLd data={breadcrumbs([{ name: 'Home', path: '/' }, { name: 'Readings', path: '/readings/' }])} />
      <PageHeader />
      <main className="flex-auto py-12 sm:py-16">
        <Container size="md">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-stone-900">
            Daily readings for the church year
          </h1>
          <p className="mt-4 max-w-3xl text-lg tracking-tight text-stone-700">
            Each day has two lessons in the morning and two in the evening, from
            the Revised Tables of Lessons (1922). Each week has the collect of its
            Sunday, from the Book of Common Prayer (1662). Where the table reads
            the Apocrypha, a canonical lesson takes its place.
          </p>
          <TodayLink />
          <nav aria-label="Seasons" className="mt-8 flex flex-wrap gap-2">
            {seasons.map((season) => (
              <Link
                key={season.slug}
                href={`/readings/${season.slug}/`}
                className="rounded-full px-3 py-1 text-sm font-medium text-brand-700 ring-1 ring-brand-200 hover:bg-brand-50"
              >
                {season.name}
              </Link>
            ))}
          </nav>
          {seasons.map((season) => (
            <section key={season.slug} id={season.slug} className="mt-14 scroll-mt-8">
              <h2 className="font-display text-3xl font-bold text-stone-900">
                <Link href={`/readings/${season.slug}/`} className="hover:text-brand-700">
                  {season.name}
                </Link>
              </h2>
              <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">
                {weeks(season.days).map((week) => (
                  <ul key={week[0].id} role="list" className="space-y-1">
                    {week.map((day) => (
                      <li key={day.id}>
                        <Link
                          href={`/readings/${day.id}/`}
                          className={day.isSunday ? 'font-semibold text-stone-900 hover:text-brand-700' : 'text-stone-600 hover:text-brand-700'}
                        >
                          {day.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ))}
              </div>
            </section>
          ))}
        </Container>
      </main>
      <GetTheApp title="Every reading, every day, in your pocket." />
      <Footer />
    </>
  )
}
