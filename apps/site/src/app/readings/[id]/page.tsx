import { type Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { GetTheApp } from '@/components/GetTheApp'
import { JsonLd } from '@/components/JsonLd'
import { PageHeader } from '@/components/PageHeader'
import { neighbours, readingDay, readingDays, type Lesson, type Proper, type ReadingDay } from '@/lib/readings'
import { APP_URL, OG_IMAGE, appDayUrl } from '@/lib/site'
import { breadcrumbs } from '@/lib/structuredData'
import { SeasonPage } from '@/components/SeasonPage'
import { formatDate } from '@/lib/format'
import { SEASONS, seasonInfo } from '@/lib/seasons'

type Props = { params: Promise<{ id: string }> }

export const dynamicParams = false

// This route serves two kinds of page. No day id is the name of a season.
//   /readings/advent/      a season
//   /readings/advent-1-0/  a day
export function generateStaticParams() {
  return [...SEASONS.map((s) => ({ id: s.slug })), ...readingDays().map((day) => ({ id: day.id }))]
}

const lessonText = (l: Lesson) => l.title || l.apocrypha || ''

function describe(day: ReadingDay): string {
  const parts: string[] = []
  if (day.morning) parts.push(`Morning: ${lessonText(day.morning.first)} and ${lessonText(day.morning.second)}.`)
  if (day.evening) parts.push(`Evening: ${lessonText(day.evening.first)} and ${lessonText(day.evening.second)}.`)
  if (day.epistle && day.gospel) parts.push(`Epistle: ${day.epistle.title}. Gospel: ${day.gospel.title}.`)
  parts.push(`With the collect for ${day.collectDay}.`)
  return `The daily readings for ${day.name}. ${parts.join(' ')}`
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const season = seasonInfo(id)
  if (season) {
    const title = `${season.name}: daily readings and collects`
    const description = `${season.summary} The lessons and the collect for each day of ${season.name}.`
    return {
      title,
      description,
      alternates: { canonical: `/readings/${season.slug}/` },
      openGraph: { title, description, url: `/readings/${season.slug}/`, images: [OG_IMAGE] },
    }
  }
  const day = readingDay(id)
  if (!day) return {}
  const title = day.epistle ? `${day.name}: collect, Epistle, Gospel and lessons` : `${day.name}: daily readings and collect`
  return {
    title,
    description: describe(day),
    alternates: { canonical: `/readings/${day.id}/` },
    openGraph: { title, description: describe(day), url: `/readings/${day.id}/`, type: 'article', images: [OG_IMAGE] },
  }
}

function LessonRow({ label, lesson }: { label: string; lesson: Lesson }) {
  return (
    <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
      <dt className="text-sm font-medium text-stone-500">{label}</dt>
      <dd className="mt-1 text-lg text-stone-900 sm:col-span-2 sm:mt-0">
        {lesson.title}
        {lesson.apocrypha && (
          <span className="block text-sm text-stone-500">
            In place of {lesson.apocrypha}. The 1922 table appoints that lesson from the Apocrypha.
          </span>
        )}
      </dd>
    </div>
  )
}

function ProperText({ heading, proper }: { heading: string; proper: Proper }) {
  return (
    <section className="mt-10">
      <h2 className="font-display text-3xl font-bold text-stone-900">
        {heading}: {proper.title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-stone-700">
        {proper.verses.map((v) => (
          <span key={`${v.chapter}.${v.verse}`}>
            <sup className="mr-1 text-xs text-stone-400">{v.verse}</sup>
            {v.text}{' '}
          </span>
        ))}
      </p>
    </section>
  )
}

export default async function ReadingDayPage({ params }: Props) {
  const { id } = await params
  const season = seasonInfo(id)
  if (season) return <SeasonPage season={season} />
  const day = readingDay(id)
  if (!day) notFound()
  const { previous, next } = neighbours(day.id)
  const nextDate = day.dates[0]

  return (
    <>
      <JsonLd
        data={breadcrumbs([
          { name: 'Home', path: '/' },
          { name: 'Readings', path: '/readings/' },
          { name: day.seasonName, path: `/readings/${day.season}/` },
          { name: day.name, path: `/readings/${day.id}/` },
        ])}
      />
      <PageHeader />
      <main className="flex-auto py-12 sm:py-16">
        <Container size="sm">
          <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
            <Link href="/readings/" className="hover:text-brand-700">
              Readings
            </Link>{' '}
            /{' '}
            <Link href={`/readings/${day.season}/`} className="hover:text-brand-700">
              {day.seasonName}
            </Link>
          </nav>
          <h1 className="mt-4 font-display text-5xl font-extrabold tracking-tight text-stone-900">{day.name}</h1>
          {day.dates.length > 0 && (
            <p className="mt-4 text-lg tracking-tight text-stone-700">
              {day.dates.length === 1 ? 'Date: ' : 'Dates: '}
              {day.dates.slice(0, 3).map((iso, i) => (
                <span key={iso}>
                  {i > 0 && '; '}
                  <a href={appDayUrl(iso)} className="text-brand-600 hover:text-brand-800">
                    {formatDate(iso)}
                  </a>
                </span>
              ))}
              .
            </p>
          )}
          <div className="mt-6 flex flex-wrap gap-4">
            <Button href={nextDate ? appDayUrl(nextDate) : APP_URL} color="blue" data-event="Open app" data-event-label="readings">
              Read the full text in the app
            </Button>
          </div>

          {(day.morning || day.evening) && (
            <section className="mt-12">
              <h2 className="font-display text-3xl font-bold text-stone-900">The lessons</h2>
              <dl className="mt-4 divide-y divide-stone-200 border-y border-stone-200">
                {day.morning && <LessonRow label="Morning, first lesson" lesson={day.morning.first} />}
                {day.morning && <LessonRow label="Morning, second lesson" lesson={day.morning.second} />}
                {day.evening && <LessonRow label="Evening, first lesson" lesson={day.evening.first} />}
                {day.evening && <LessonRow label="Evening, second lesson" lesson={day.evening.second} />}
              </dl>
              <p className="mt-4 text-sm text-stone-500">
                The lessons come from the Revised Tables of Lessons (1922). The
                psalms follow the day of the month, in the order of 1662. Open a
                date in the app to sing the psalm of that day.
              </p>
            </section>
          )}

          {day.collects.length > 0 && (
            <section className="mt-12">
              <h2 className="font-display text-3xl font-bold text-stone-900">The collect</h2>
              <p className="mt-2 text-sm text-stone-500">The collect for {day.collectDay}, from the Book of Common Prayer (1662).</p>
              {day.collects.map((collect) => (
                <blockquote key={collect} className="mt-4 border-l-4 border-brand-300 pl-5 font-display text-2xl leading-9 text-stone-800">
                  {collect}
                </blockquote>
              ))}
            </section>
          )}

          {day.epistle && <ProperText heading="The Epistle" proper={day.epistle} />}
          {day.gospel && <ProperText heading="The Gospel" proper={day.gospel} />}

          <nav aria-label="Other days" className="mt-16 flex justify-between gap-6 border-t border-stone-200 pt-6 text-base">
            {previous ? (
              <Link href={`/readings/${previous.id}/`} className="text-brand-600 hover:text-brand-800">
                <span aria-hidden="true">&larr;</span> {previous.name}
              </Link>
            ) : (
              <span />
            )}
            {next && (
              <Link href={`/readings/${next.id}/`} className="text-right text-brand-600 hover:text-brand-800">
                {next.name} <span aria-hidden="true">&rarr;</span>
              </Link>
            )}
          </nav>
        </Container>
      </main>
      <GetTheApp title="Read these lessons with your family." />
      <Footer />
    </>
  )
}
