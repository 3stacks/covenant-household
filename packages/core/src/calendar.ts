import { bibleDir, DEFAULT_BIBLE, type BibleId } from './bibles.ts'
import { churchDay, HOLY_DAYS, type ChurchDay } from './churchYear.ts'
import type { CalendarIndex, CollectsFile, Commemoration, DateKey, DevotionsFile, LessonsFile, PsalterFile } from './types.ts'

const pad = (n: number) => String(n).padStart(2, '0')

/** The calendar key for a date: 10 November → "11-10". */
export const dateKey = (d: Date): DateKey => `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** A date as "2026-11-10", in local time. */
export const isoDate = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

/** Parses "2026-11-10" as a local date. Returns undefined for any other text. */
export function parseIsoDate(s: string): Date | undefined {
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) return undefined
  const d = new Date(+m[1], +m[2] - 1, +m[3])
  return isoDate(d) === s ? d : undefined
}

export const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)

/** The day of the Psalter: the day of the month. The 31st repeats the 30th. */
export const psalterDay = (d: Date) => Math.min(d.getDate(), 30)

export interface LoadedDay {
  church: ChurchDay
  /** The name of the saint's day on this date, if there is one. */
  holyDayName?: string
  /** Undefined when the table has no lessons for this day. */
  lessons?: LessonsFile
  /** The collect that serves today. */
  collect?: CollectsFile
  /** Today's own Epistle and Gospel, on a Sunday or a feast. */
  propers?: CollectsFile
  psalter: PsalterFile
  devotions?: DevotionsFile
  commemoration?: Commemoration
  sources: CalendarIndex['sources']
}

/**
 * Reads one file of the built calendar, for example "lessons/advent-1-0.json".
 * The web app fetches the file. The mobile app has the files in its bundle.
 */
export type CalendarLoader = (path: string) => Promise<unknown>

export interface Calendar {
  loadIndex(): Promise<CalendarIndex>
  /** The day, with its readings in the translation `bible` (the KJV by default). */
  loadDay(date: Date, bible?: BibleId): Promise<LoadedDay>
  /** The commemorations of a month (0 to 11), by date key. */
  loadCommemorations(month: number): Promise<Record<DateKey, Commemoration>>
}

export function createCalendar(load: CalendarLoader): Calendar {
  let indexPromise: Promise<CalendarIndex> | undefined
  const getJson = <T>(path: string) => load(path) as Promise<T>
  const loadIndex = () => (indexPromise ??= getJson<CalendarIndex>('index.json'))

  async function loadCommemorations(month: number) {
    const index = await loadIndex()
    const prefix = `${pad(month + 1)}-`
    const keys = index.commemorations.filter((k) => k.startsWith(prefix))
    const list = await Promise.all(keys.map((k) => getJson<Commemoration>(`commemorations/${k}.json`)))
    return Object.fromEntries(list.map((c) => [c.date, c]))
  }

  return { loadIndex, loadDay, loadCommemorations }

  async function loadDay(date: Date, bible: BibleId = DEFAULT_BIBLE): Promise<LoadedDay> {
    const church = churchDay(date)
    const index = await loadIndex()
    // The lessons, the collects (with the Epistle and Gospel) and the devotions
    // (with the proverb) have a copy in each translation.
    const text = bibleDir(bible)
    const maybe = <T>(list: string[], id: string | undefined, dir: string) =>
      id && list.includes(id) ? getJson<T>(`${dir === 'commemorations' ? '' : text}${dir}/${id}.json`) : Promise.resolve(undefined)
    const [lessons, collect, propers, psalter, devotions, commemoration] = await Promise.all([
      maybe<LessonsFile>(index.lessons, church.id, 'lessons'),
      maybe<CollectsFile>(index.collects, church.collect, 'collects'),
      church.propers && church.propers !== church.collect
        ? maybe<CollectsFile>(index.collects, church.propers, 'collects')
        : Promise.resolve(undefined),
      getJson<PsalterFile>(`psalter/${psalterDay(date)}.json`),
      maybe<DevotionsFile>(index.devotions, church.id, 'devotions'),
      maybe<Commemoration>(index.commemorations, dateKey(date), 'commemorations'),
    ])
    const holyDayName = church.holyDay ? HOLY_DAYS[church.holyDay.replace(/^holy-/, '')] : undefined
    return {
      church,
      holyDayName,
      lessons,
      collect,
      propers: church.propers ? (church.propers === church.collect ? collect : propers) : undefined,
      psalter,
      devotions,
      commemoration,
      sources: index.sources,
    }
  }
}
