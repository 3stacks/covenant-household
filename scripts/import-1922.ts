// Imports the Revised Tables of Lessons (1922) into content/lectionary/1922.json.
//
//   node scripts/import-1922.ts
//
// The source is the transcription of the 1662 Book of Common Prayer by Lynda
// Howell (http://www.eskimo.com/~lhowell/bcp1662/info/calendar.html). Each lesson
// links to Bible Gateway, and the link holds the full reference, so the importer
// reads the references from the links. The tables themselves were published in
// 1922 and are in the public domain.
//
// The transcription puts a few lessons in the wrong column. A row has two Old
// Testament lessons (the first lessons) and two New Testament lessons (the second
// lessons), so the importer sorts each row by testament.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { isNewTestament } from '../packages/core/src/bookNames.ts'
import { BOOKS } from '../packages/core/src/books.ts'
import { kjvBook } from './cache.ts'
import { parseReference } from './refs.ts'
import type { Lectionary, LessonDay, Lesson } from '../packages/core/src/types.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const cache = join(root, '.cache/1922')
const BASE = 'http://www.eskimo.com/~lhowell/bcp1662/info/cal_1922'
const PARTS = ['advent', 'xmas', 'epiphany', 'lent', 'easter', 'trinity1', 'trinity2', 'trinity3', 'trinity4']

async function page(part: string): Promise<string> {
  const file = join(cache, `${part}.html`)
  if (existsSync(file)) return readFileSync(file, 'latin1')
  const r = await fetch(`${BASE}/${part}.html`)
  if (!r.ok) throw new Error(`${part}: ${r.status}`)
  const text = Buffer.from(await r.arrayBuffer()).toString('latin1')
  mkdirSync(cache, { recursive: true })
  writeFileSync(file, text, 'latin1')
  return text
}

const decode = (s: string) =>
  s
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/** Typing errors in the transcription, by church-year id: the link as it is, then the correct reference. */
const CORRECTIONS: Record<string, Record<string, string>> = {
  // The week reads Ephesians in order. Friday is 5:22-6:9, so Saturday is 6:10.
  'lent-3-6': { 'Ephesians+9:10-999': 'Ephesians 6:10-999' },
  // "214": the next day starts at Acts 12:25.
  'easter-2-4': { 'Acts+12:1-214': 'Acts 12:1-24' },
  // "44:15-3": the next day starts Ezekiel, so the lesson runs to the end of the chapter.
  'trinity-11-3': { 'Jeremiah+44:15-3': 'Jeremiah 44:15-999' },
  // Joshua 5 has 15 verses. The lesson is the fall of Jericho, 5:13-6:20.
  'trinity-1-0': { 'Joshua+5:13-20': 'Joshua 5:13-6:20' },
}

/** The Apocrypha pages of the transcription, by file name. */
const APOCRYPHA_PAGES: Record<string, string> = {
  maccabees1: '1 Maccabees', maccabees2: '2 Maccabees', sirach: 'Ecclesiasticus', ecclesiasticus: 'Ecclesiasticus',
  wisdom: 'Wisdom', tobit: 'Tobit', baruch: 'Baruch', judith: 'Judith', manasses: 'Prayer of Manasses',
  esdras1: '1 Esdras', esdras2: '2 Esdras', susanna: 'Susanna', bel: 'Bel and the Dragon',
}

const APOCRYPHA_NAME = /^(?:[12] )?(?:Macc|Sirach|Ecclus|Ecclesiasticus|Wisdom|Wisd|Tobit|Baruch|Judith|Prayer of Manass|Song of (?:the )?Three|Susanna|Bel |[12] Esdras)/i

interface CellLesson {
  passages: string[]
  /** For a lesson from the Apocrypha: the reference as the table gives it. */
  apocrypha?: string
}

/** The lessons in one table cell: the first, then the "or" alternatives. */
function cellLessons(id: string, cell: string, where: string, problems: string[]): CellLesson[] {
  const out: CellLesson[] = []
  let apocryphaBook = ''
  for (const m of cell.matchAll(/<A\s+HREF\s*=\s*"([^"]+)"[^>]*>([\s\S]*?)<\/A>/gi)) {
    const href = m[1]
    const search = href.match(/search=([^"&]+)/i)?.[1]
    const label = decode(m[2])
    const page = href.match(/apocrypha\/([a-z0-9]+)/i)?.[1]?.toLowerCase()
    if (page || APOCRYPHA_NAME.test(label) || (search && APOCRYPHA_NAME.test(decodeURIComponent(search.replace(/\+/g, ' '))))) {
      // The app does not read the Apocrypha (WCF 1.3), so it keeps only a label.
      const book = page ? APOCRYPHA_PAGES[page] ?? page : ''
      if (/^[A-Za-z]/.test(label) || /^[12] [A-Za-z]/.test(label)) apocryphaBook = label.replace(/\s*\d.*$/, '')
      const text = /^\d/.test(label) && !/^[12] [A-Za-z]/.test(label) ? `${book || apocryphaBook} ${label}` : label
      out.push({ passages: [], apocrypha: text.trim() })
      continue
    }
    const raw = search ?? ''
    const fixed = CORRECTIONS[id]?.[raw]
    const text = fixed ?? (search ? decodeURIComponent(search.replace(/\+/g, ' ')) : label)
    const parts = parseReference(text, verseCount)
    if (parts) out.push({ passages: parts })
    else problems.push(`${where}: cannot read "${text}"`)
  }
  return out
}

/** A lesson from a cell. An Apocrypha lesson gives way to the first canonical "or" lesson. */
function lesson(cell: CellLesson[]): Lesson {
  const canonical = cell.filter((l) => !l.apocrypha)
  const main = cell[0].apocrypha && canonical.length ? canonical[0] : cell[0]
  const out: Lesson = { passages: main.passages, alternatives: canonical.filter((l) => l !== main).map((l) => l.passages) }
  if (cell[0].apocrypha) out.apocrypha = cell[0].apocrypha
  return out
}

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** The church-year week id for a row anchor in the table. See churchYear.ts. */
const WEEK_IDS: Record<string, string> = {
  Advent1: 'advent-1', Advent2: 'advent-2', Advent3: 'advent-3', Advent4: 'advent-4',
  Epiphany1: 'epiphany-1', Epiphany2: 'epiphany-2', Epiphany3: 'epiphany-3', Epiphany4: 'epiphany-4', Epiphany5: 'epiphany-5', Epiphany6: 'epiphany-6',
  Septuagesima: 'septuagesima', Sexagesima: 'sexagesima', Quinquagesima: 'quinquagesima',
  Lent1: 'lent-1', Lent2: 'lent-2', Lent3: 'lent-3', Lent4: 'lent-4', Lent5: 'lent-5',
  PalmSunday: 'holy-week', Easter: 'easter-0',
  Easter1: 'easter-1', Easter2: 'easter-2', Easter3: 'easter-3', Easter4: 'easter-4', Easter5: 'easter-5',
  AsensionSunday: 'easter-6', Whitsunday: 'whitsun', Trinity: 'trinity-0', Trinity27: 'next-before-advent',
}
for (let n = 1; n <= 26; n++) WEEK_IDS[`Trinity${n}`] = `trinity-${n}`

/** Rows that have a date or a fixed id of their own. */
const FIXED_IDS: Record<string, string> = {
  'Christmas Eve': 'dec-24', Christmas: 'dec-25', Stephen: 'dec-26', JohnEvangelist: 'dec-27', Innocents: 'dec-28',
  ChristmasSunday: 'christmas-sunday', 'December 29': 'dec-29', 'December 30': 'dec-30', 'December 31': 'dec-31',
  Circumcision: 'jan-01', Christmas2: 'christmas-2', 'January 2': 'jan-02', 'January 3': 'jan-03', 'January 4': 'jan-04',
  'January 5': 'jan-05', Epiphany: 'jan-06', AshWednesday: 'lent-0-3', GoodFriday: 'holy-week-5', EasterEven: 'holy-week-6',
  Ascension: 'easter-5-4',
}

// Verse counts for "to the end of the chapter", from the KJV.
const kjv = new Map<string, string[][]>()
for (const b of BOOKS) kjv.set(b.code, await kjvBook(b.code))
const verseCount = (code: string, chapter: number) => kjv.get(code)?.[chapter - 1]?.length

const days: Record<string, LessonDay> = {}
const problems: string[] = []

/** The canonical lessons that the app reads in place of the Apocrypha lessons. */
interface Substitutes {
  groups: { apocrypha: string; reason: string; days: Record<string, Partial<Record<'morning' | 'evening', string[]>>> }[]
}
const substitutes = new Map<string, string[]>()
for (const g of (JSON.parse(readFileSync(join(root, 'content/lectionary/apocrypha-1922.json'), 'utf8')) as Substitutes).groups)
  for (const [id, offices] of Object.entries(g.days)) for (const [office, passages] of Object.entries(offices)) substitutes.set(`${id} ${office}`, passages!)
const usedSubstitutes = new Set<string>()

/** Put the canonical substitute into an Apocrypha lesson that has no canonical "or" lesson. */
function substitute(id: string, office: 'morning' | 'evening', l: Lesson | undefined) {
  if (!l?.apocrypha || l.passages.length) return
  const key = `${id} ${office}`
  const passages = substitutes.get(key)
  if (!passages) return problems.push(`${key}: ${l.apocrypha} has no canonical substitute in apocrypha-1922.json`)
  l.passages = passages
  usedSubstitutes.add(key)
}

for (const part of PARTS) {
  const html = await page(part)
  let week: string | undefined = part === 'epiphany' ? 'epiphany-0' : undefined
  // The last row of a table can have no </TR>. The table end closes it.
  for (const row of html.matchAll(/<TR[^>]*>([\s\S]*?)(?=<\/TR>|<TR[\s>]|<\/TABLE>)/gi)) {
    const cells = [...row[1].matchAll(/<TD[^>]*>([\s\S]*?)<\/TD>/gi)].map((c) => c[1])
    if (cells.length < 5) continue
    const label = decode(cells[0]).replace(/^\*\s*|\s*\*$/g, '')
    const anchor = cells[0].match(/NAME\s*=\s*"([^"]+)"/i)?.[1]

    let id: string | undefined
    if (anchor && WEEK_IDS[anchor]) {
      week = WEEK_IDS[anchor]
      id = `${week}-0`
    } else if (FIXED_IDS[anchor ?? ''] ?? FIXED_IDS[label]) {
      id = FIXED_IDS[anchor ?? ''] ?? FIXED_IDS[label]
      // After Ash Wednesday, the weekday rows belong to its week.
      if (id === 'lent-0-3') week = 'lent-0'
    } else {
      // A weekday row. Ember Days and the named days of Holy Week and Easter Week
      // keep the weekday position in the week.
      const named = anchor?.match(/^(Monday|Tuesday|Wednesday|Thursday)(Easter)$|^(Easter|Whitsun)(Monday|Tuesday)$/)
      const dayName = named ? (named[1] ?? named[4]) : label === 'Ember Day' ? undefined : label
      let index = dayName ? WEEKDAYS.indexOf(dayName) + 1 : 0
      if (label === 'Ember Day') {
        // Ember Days fall on Wednesday, Friday and Saturday.
        const used = Object.keys(days).filter((k) => k.startsWith(`${week}-`)).map((k) => +k.split('-').pop()!)
        index = [3, 5, 6].find((d) => !used.includes(d)) ?? 0
      }
      if (!week || index < 1) {
        problems.push(`${part}: cannot place the row "${label}"`)
        continue
      }
      id = `${week}-${index}`
    }

    const where = `${part} ${id}`
    const lists = cells.slice(1, 5).map((c) => cellLessons(id, c, where, problems))
    // Sort by testament: the first lesson of each office is Old Testament (or
    // Apocrypha), the second is New Testament.
    const isNt = (l: CellLesson[]) => !l[0].apocrypha && isNewTestament(l[0].passages[0])
    const first = lists.filter((l) => l.length && !isNt(l))
    const second = lists.filter((l) => l.length && isNt(l))
    if (first.length > 2 || second.length > 2) problems.push(`${where}: ${first.length} first and ${second.length} second lessons`)
    const swapped = lists[0].length > 0 && lists[1].length > 0 && (isNt(lists[0]) || !isNt(lists[1]))
    const day: LessonDay = { label }
    if (first[0] && second[0]) day.morning = { first: lesson(first[0]), second: lesson(second[0]) }
    if (first[1] && second[1]) day.evening = { first: lesson(first[1]), second: lesson(second[1]) }
    substitute(id, 'morning', day.morning?.first)
    substitute(id, 'evening', day.evening?.first)
    if (swapped) day.note = 'The transcription has these lessons in other columns. The importer sorted them by testament.'
    if (!day.morning) problems.push(`${where}: no morning lessons`)
    if (days[id]) problems.push(`${where}: a second row for this id`)
    days[id] = day
  }
}

for (const key of substitutes.keys()) if (!usedSubstitutes.has(key)) problems.push(`${key}: apocrypha-1922.json has a substitute, but the table has no Apocrypha lesson here`)

const lectionary: Lectionary = {
  name: 'The Revised Tables of Lessons (1922)',
  source: {
    name: 'The Revised Tables of Lessons, 1922. Transcription by Lynda Howell.',
    url: 'http://www.eskimo.com/~lhowell/bcp1662/info/calendar.html',
    licence: 'public-domain',
  },
  days,
}

const apocrypha = Object.entries(days).flatMap(([id, d]) =>
  [d.morning?.first, d.evening?.first]
    .filter((l): l is Lesson => !!l?.apocrypha)
    .map((l) => `${id}: ${l.apocrypha}${l.passages.length ? ` (the app reads ${l.passages.join(', ')} in its place)` : ' (no canonical lesson)'}`),
)

mkdirSync(join(root, 'content/lectionary'), { recursive: true })
writeFileSync(join(root, 'content/lectionary/1922.json'), JSON.stringify(lectionary, null, 1) + '\n')
console.log(`1922: ${Object.keys(days).length} days. ${apocrypha.length} first lessons from the Apocrypha.`)
for (const p of problems) console.warn(`problem: ${p}`)
if (problems.length) process.exitCode = 1
if (process.argv.includes('--apocrypha')) for (const a of apocrypha) console.log(`apocrypha: ${a}`)
