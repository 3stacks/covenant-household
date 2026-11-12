// The readings of each day of the church year, for the pages under /readings/.
// The pages are static. The build reads the calendar that `npm run calendar`
// writes for the web app (apps/web/public/calendar/).

import { readFileSync } from 'node:fs'
import path from 'node:path'

import { isoDate } from '@daily-prayer/core/calendar'
import { allLessonIds, churchDay, type Season } from '@daily-prayer/core/churchYear'
import { SEASON_NAMES } from '@daily-prayer/core/labels'
import { formatPassageId } from '@daily-prayer/core/passage'
import type { CollectsFile, LessonText, LessonsFile } from '@daily-prayer/core/types'

const CALENDAR = path.join(process.cwd(), '../web/public/calendar')

function readJson<T>(file: string): T {
  try {
    return JSON.parse(readFileSync(path.join(CALENDAR, file), 'utf8')) as T
  } catch {
    throw new Error(`${CALENDAR}/${file} is missing. Run "npm run calendar" at the repository root first.`)
  }
}

export interface Lesson {
  /** For example "Isaiah 1:1–20". Empty for a lesson that has no canonical text. */
  title: string
  /** The Apocrypha lesson of the 1922 table, which this lesson replaces. */
  apocrypha?: string
}

export interface Proper {
  title: string
  verses: { chapter: number; verse: number; text: string }[]
}

export interface ReadingDay {
  id: string
  /** For example "Wednesday after the Second Sunday in Advent". */
  name: string
  season: Season
  seasonName: string
  isSunday: boolean
  /** The dates of the day from the start of the build year, for three years. */
  dates: string[]
  morning?: { first: Lesson; second: Lesson }
  evening?: { first: Lesson; second: Lesson }
  /** The title of the 1662 day that gives the collect. */
  collectDay: string
  collects: string[]
  epistle?: Proper
  gospel?: Proper
}

const lesson = (l: LessonText): Lesson => ({
  title: l.parts.map((p) => formatPassageId(p.passage)).join('; '),
  apocrypha: l.apocrypha,
})

const proper = (p: CollectsFile['epistle']): Proper | undefined =>
  p && { title: formatPassageId(p.passage), verses: p.verses }

/** "The First Sunday of Advent." → "the First Sunday of Advent", to follow "the collect for". */
const tidy = (title: string) => title.replace(/\.\s*$/, '').replace(/^The /, 'the ')

let cache: ReadingDay[] | undefined

/** Each day of the church year, in the order of the year. */
export function readingDays(): ReadingDay[] {
  if (cache) return cache

  // Find each day in the calendar. A day such as the Sixth Sunday after the
  // Epiphany occurs in few years, so the search covers 40 years.
  const year = new Date().getFullYear()
  const found = new Map<string, { date: Date; dates: string[] }>()
  for (let d = new Date(year, 0, 1); d.getFullYear() < year + 40; d = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1)) {
    const id = churchDay(d).id
    const entry = found.get(id) ?? { date: d, dates: [] }
    if (d.getFullYear() < year + 3) entry.dates.push(isoDate(d))
    found.set(id, entry)
  }

  cache = allLessonIds().flatMap((id): ReadingDay[] => {
    const at = found.get(id)
    if (!at) return []
    const day = churchDay(at.date)
    const lessons = readJson<LessonsFile>(`lessons/${id}.json`)
    const collects = readJson<CollectsFile>(`collects/${day.collect}.json`)
    const propers = day.propers ? readJson<CollectsFile>(`collects/${day.propers}.json`) : undefined
    return [
      {
        id,
        name: day.name,
        season: day.season,
        seasonName: SEASON_NAMES[day.season],
        isSunday: at.date.getDay() === 0,
        dates: at.dates,
        morning: lessons.morning && { first: lesson(lessons.morning.first), second: lesson(lessons.morning.second) },
        evening: lessons.evening && { first: lesson(lessons.evening.first), second: lesson(lessons.evening.second) },
        collectDay: tidy(collects.title),
        collects: collects.collects ?? [],
        epistle: proper(propers?.epistle),
        gospel: proper(propers?.gospel),
      },
    ]
  })
  return cache
}

export function readingDay(id: string): ReadingDay | undefined {
  return readingDays().find((d) => d.id === id)
}

/** The days before and after, for the links at the foot of a page. */
export function neighbours(id: string): { previous?: ReadingDay; next?: ReadingDay } {
  const days = readingDays()
  const i = days.findIndex((d) => d.id === id)
  return { previous: days[i - 1], next: days[i + 1] }
}
