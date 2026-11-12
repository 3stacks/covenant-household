import Link from 'next/link'

import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { GetTheApp } from '@/components/GetTheApp'
import { JsonLd } from '@/components/JsonLd'
import { PageHeader } from '@/components/PageHeader'
import { formatDate, weeks } from '@/lib/format'
import { SEASONS, seasonDates, seasonDays, type SeasonInfo } from '@/lib/seasons'
import { appDayUrl } from '@/lib/site'
import { breadcrumbs } from '@/lib/structuredData'

/** /readings/<season>/: the days of one season, with the collect of each week. */
export function SeasonPage({ season }: { season: SeasonInfo }) {
  const days = seasonDays(season.slug)
  const dates = seasonDates(season.slug).slice(0, 3)
  const i = SEASONS.findIndex((s) => s.slug === season.slug)
  const previous = SEASONS[(i + SEASONS.length - 1) % SEASONS.length]
  const next = SEASONS[(i + 1) % SEASONS.length]

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Readings', path: '/readings/' },
          { name: season.name, path: `/readings/${season.slug}/` },
        ])}
      />
      <PageHeader />
      <main className="flex-auto py-12 sm:py-16">
        <Container size="sm">
          <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
            <Link href="/readings/" className="hover:text-brand-700">
              Readings
            </Link>
          </nav>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-stone-900">{season.name}</h1>
          {season.intro.map((p) => (
            <p key={p} className="mt-4 text-lg tracking-tight text-stone-700">
              {p}
            </p>
          ))}

          {dates.length > 0 && (
            <section className="mt-10">
              <h2 className="font-display text-3xl font-bold text-stone-900">Dates</h2>
              <ul role="list" className="mt-4 space-y-1 text-lg text-stone-700">
                {dates.map((run) => (
                  <li key={run.from}>
                    <a href={appDayUrl(run.from)} className="text-brand-600 hover:text-brand-800">
                      {formatDate(run.from)}
                    </a>
                    {run.to !== run.from && <> to {formatDate(run.to)}</>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {weeks(days).map((week) => {
            const head = week[0]
            return (
              <section key={head.id} className="mt-12 border-t border-stone-200 pt-8">
                <h2 className="font-display text-3xl font-bold text-stone-900">
                  <Link href={`/readings/${head.id}/`} className="hover:text-brand-700">
                    {head.name}
                  </Link>
                </h2>
                {head.collects[0] && (
                  <blockquote className="mt-4 border-l-4 border-brand-300 pl-5 font-display text-xl leading-8 text-stone-800">
                    {head.collects[0]}
                  </blockquote>
                )}
                {head.collects[0] && (
                  <p className="mt-2 text-sm text-stone-500">The collect for {head.collectDay}.</p>
                )}
                <ul role="list" className="mt-4 grid gap-x-8 gap-y-1 sm:grid-cols-2">
                  {week.map((day) => (
                    <li key={day.id}>
                      <Link href={`/readings/${day.id}/`} className="text-brand-600 hover:text-brand-800">
                        {day.name}
                      </Link>
                      {day.morning && (
                        <span className="block text-sm text-stone-500">
                          {day.morning.first.title}; {day.morning.second.title}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}

          <nav aria-label="Other seasons" className="mt-16 flex justify-between gap-6 border-t border-stone-200 pt-6 text-base">
            <Link href={`/readings/${previous.slug}/`} className="text-brand-600 hover:text-brand-800">
              <span aria-hidden="true">&larr;</span> {previous.name}
            </Link>
            <Link href={`/readings/${next.slug}/`} className="text-right text-brand-600 hover:text-brand-800">
              {next.name} <span aria-hidden="true">&rarr;</span>
            </Link>
          </nav>
        </Container>
      </main>
      <GetTheApp title={`Keep ${season.name} with your household.`} />
      <Footer />
    </>
  )
}
