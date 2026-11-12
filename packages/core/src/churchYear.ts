// The church year of the 1662 Book of Common Prayer: maps a date to its lessons,
// its collect, and its Epistle and Gospel.
//
// The lesson ids are the rows of the Revised Tables of Lessons (1922). A week id
// and a weekday make the id: "advent-2-3" is the Wednesday after the Second Sunday
// in Advent (0 = Sunday).
//
//   advent-1 … advent-4           Advent, to 23 December
//   dec-24 … jan-06               by date, except two Sundays:
//   christmas-sunday              a Sunday on 29, 30 or 31 December
//   christmas-2                   a Sunday on 2, 3, 4 or 5 January
//   epiphany-0 … epiphany-6       after the Epiphany (week 0: before its first Sunday)
//   septuagesima, sexagesima      the Sundays before Lent, with their weeks
//   quinquagesima-0 … -2          Quinquagesima to Shrove Tuesday
//   lent-0-3 … lent-0-6           Ash Wednesday to the Saturday after it
//   lent-1 … lent-5               Lent
//   holy-week                     the Sunday next before Easter to Easter Even
//   easter-0 … easter-5           Easter Day and the Sundays after Easter
//                                 (Ascension Day is easter-5-4)
//   easter-6                      the Sunday after Ascension Day
//   whitsun                       Whitsunday and its week
//   trinity-0 … trinity-26        Trinity Sunday and the Sundays after Trinity
//   next-before-advent            the Sunday next before Advent, always the last
//
// All dates are local dates at midnight.

export type Season = 'advent' | 'christmas' | 'epiphany' | 'pre-lent' | 'lent' | 'holy-week' | 'easter' | 'whitsun' | 'trinity'

export interface ChurchDay {
  /** The id of the lessons (the 1922 table). */
  id: string
  season: Season
  /** For example "Wednesday after the Second Sunday in Advent". */
  name: string
  /** The 1662 day whose collect is said today. */
  collect: string
  /** The 1662 day whose Epistle and Gospel belong to today, if today has its own. */
  propers?: string
  /** A saint's day of the 1662 calendar on this date, for example "holy-11-30". */
  holyDay?: string
}

const DAY_MS = 86_400_000
const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const ORDINALS = [
  '', 'First', 'Second', 'Third', 'Fourth', 'Fifth', 'Sixth', 'Seventh', 'Eighth', 'Ninth', 'Tenth', 'Eleventh',
  'Twelfth', 'Thirteenth', 'Fourteenth', 'Fifteenth', 'Sixteenth', 'Seventeenth', 'Eighteenth', 'Nineteenth',
  'Twentieth', 'Twenty-first', 'Twenty-second', 'Twenty-third', 'Twenty-fourth', 'Twenty-fifth', 'Twenty-sixth',
]

const ymd = (y: number, m: number, d: number) => new Date(y, m - 1, d)
const addDays = (d: Date, n: number) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
/** Whole days from a to b. Rounding absorbs daylight-saving changes. */
const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS)
const pad = (n: number) => String(n).padStart(2, '0')
const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0

/** Easter Day in the Gregorian calendar (the anonymous Gregorian algorithm). */
export function easter(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day = ((h + l - 7 * m + 114) % 31) + 1
  return ymd(year, month, day)
}

/** Advent Sunday: the fourth Sunday before Christmas Day. */
export function adventSunday(year: number): Date {
  const christmas = ymd(year, 12, 25)
  const lastSunday = addDays(christmas, -(christmas.getDay() || 7))
  return addDays(lastSunday, -21)
}

/** The saints' days of the 1662 calendar, by "MM-DD". */
export const HOLY_DAYS: Record<string, string> = {
  '11-30': 'Saint Andrew', '12-21': 'Saint Thomas the Apostle', '12-26': 'Saint Stephen',
  '12-27': 'Saint John the Evangelist', '12-28': 'The Innocents', '01-25': 'The Conversion of Saint Paul',
  '02-02': 'The Presentation of Christ in the Temple', '02-24': 'Saint Matthias', '03-25': 'The Annunciation',
  '04-25': 'Saint Mark', '05-01': 'Saint Philip and Saint James', '06-11': 'Saint Barnabas',
  '06-24': 'Saint John Baptist', '06-29': 'Saint Peter', '07-25': 'Saint James the Apostle',
  '08-24': 'Saint Bartholomew', '09-21': 'Saint Matthew', '09-29': 'Saint Michael and all Angels',
  '10-18': 'Saint Luke', '10-28': 'Saint Simon and Saint Jude', '11-01': 'All Saints',
}

/** The holy-day id for a date. In a leap year Saint Matthias moves to 25 February. */
function holyDayOn(d: Date): string | undefined {
  let key = `${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  if (isLeap(d.getFullYear())) {
    if (key === '02-24') return undefined
    if (key === '02-25') key = '02-24'
  }
  // Saint Stephen, Saint John and the Innocents are days of Christmas, with their own ids.
  if (['12-26', '12-27', '12-28'].includes(key)) return undefined
  return HOLY_DAYS[key] ? `holy-${key}` : undefined
}

/** Days with a collect that serves the days after them, until the next Sunday. */
const GOVERNING = new Set(['dec-25', 'jan-01', 'jan-06', 'lent-0-3', 'easter-5-4'])

interface Temporal {
  id: string
  season: Season
  name: string
  /** The 1662 propers of this day, if it has its own. */
  own?: string
}

function sundayName(week: string): string {
  const fixed: Record<string, string> = {
    septuagesima: 'Septuagesima', sexagesima: 'Sexagesima', quinquagesima: 'Quinquagesima',
    'holy-week': 'the Sunday next before Easter', 'easter-6': 'the Sunday after Ascension Day',
    whitsun: 'Whitsunday', 'next-before-advent': 'the Sunday next before Advent',
  }
  if (fixed[week]) return fixed[week]
  let m: RegExpMatchArray | null
  if ((m = week.match(/^advent-(\d)$/))) return `the ${ORDINALS[+m[1]]} Sunday in Advent`
  if ((m = week.match(/^epiphany-(\d)$/))) return `the ${ORDINALS[+m[1]]} Sunday after the Epiphany`
  if ((m = week.match(/^lent-(\d)$/))) return `the ${ORDINALS[+m[1]]} Sunday in Lent`
  if ((m = week.match(/^easter-(\d)$/))) return +m[1] === 0 ? 'Easter Day' : `the ${ORDINALS[+m[1]]} Sunday after Easter`
  if ((m = week.match(/^trinity-(\d+)$/))) return +m[1] === 0 ? 'Trinity Sunday' : `the ${ORDINALS[+m[1]]} Sunday after Trinity`
  return week
}

const capitalise = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

function inWeek(week: string, weekday: number, season: Season): Temporal {
  const sunday = sundayName(week)
  const name = weekday === 0 ? capitalise(sunday) : `${WEEKDAYS[weekday]} after ${sunday}`
  return { id: `${week}-${weekday}`, season, name, own: weekday === 0 ? `${week}-0` : undefined }
}

const NAMED: Record<string, [string, Season, boolean]> = {
  'dec-24': ['Christmas Eve', 'advent', false],
  'dec-25': ['Christmas Day', 'christmas', true],
  'dec-26': ["Saint Stephen's Day", 'christmas', true],
  'dec-27': ["Saint John the Evangelist's Day", 'christmas', true],
  'dec-28': ["The Innocents' Day", 'christmas', true],
  'jan-01': ['The Circumcision of Christ', 'christmas', true],
  'jan-06': ['The Epiphany', 'epiphany', true],
  'lent-0-3': ['Ash Wednesday', 'lent', true],
  'holy-week-1': ['Monday before Easter', 'holy-week', true],
  'holy-week-2': ['Tuesday before Easter', 'holy-week', true],
  'holy-week-3': ['Wednesday before Easter', 'holy-week', true],
  'holy-week-4': ['Thursday before Easter', 'holy-week', true],
  'holy-week-5': ['Good Friday', 'holy-week', true],
  'holy-week-6': ['Easter Even', 'holy-week', true],
  'easter-0-1': ['Monday in Easter Week', 'easter', true],
  'easter-0-2': ['Tuesday in Easter Week', 'easter', true],
  'easter-5-4': ['Ascension Day', 'easter', true],
  'whitsun-1': ['Monday in Whitsun Week', 'whitsun', true],
  'whitsun-2': ['Tuesday in Whitsun Week', 'whitsun', true],
}

function named(t: Temporal): Temporal {
  const n = NAMED[t.id]
  return n ? { ...t, name: n[0], season: n[1], own: n[2] ? t.id : t.own } : t
}

/** The day in the church year, before the collect is chosen. */
function temporal(d: Date): Temporal {
  const year = d.getFullYear()
  const month = d.getMonth() + 1
  const date = d.getDate()
  const weekday = d.getDay()

  // When Christmas Day is a Monday, Christmas Eve is the Fourth Sunday in Advent.
  if (month === 12 && date === 24 && weekday === 0) return inWeek('advent-4', 0, 'advent')

  // Christmas Eve to the Epiphany.
  if ((month === 12 && date >= 24) || (month === 1 && date <= 6)) {
    if (weekday === 0 && month === 12 && date >= 29)
      return { id: 'christmas-sunday', season: 'christmas', name: 'The Sunday after Christmas Day', own: 'christmas-sunday' }
    if (weekday === 0 && month === 1 && date >= 2 && date <= 5)
      return { id: 'christmas-2', season: 'christmas', name: 'The Second Sunday after Christmas Day' }
    const id = `${month === 12 ? 'dec' : 'jan'}-${pad(date)}`
    return named({ id, season: 'christmas', name: `${WEEKDAYS[weekday]}, ${date} ${month === 12 ? 'December' : 'January'}` })
  }

  const advent = adventSunday(year)
  if (d >= advent) return inWeek(`advent-${Math.floor(daysBetween(advent, d) / 7) + 1}`, weekday, 'advent')

  const off = daysBetween(easter(year), d)

  if (off < -63) {
    const jan6 = ymd(year, 1, 6)
    const firstSunday = addDays(jan6, 7 - jan6.getDay())
    const week = d < firstSunday ? 0 : Math.floor(daysBetween(firstSunday, d) / 7) + 1
    if (week === 0) return { id: `epiphany-0-${weekday}`, season: 'epiphany', name: `${WEEKDAYS[weekday]} after the Epiphany` }
    return inWeek(`epiphany-${week}`, weekday, 'epiphany')
  }
  if (off < -56) return inWeek('septuagesima', weekday, 'pre-lent')
  if (off < -49) return inWeek('sexagesima', weekday, 'pre-lent')
  if (off < -46) return inWeek('quinquagesima', weekday, 'pre-lent')
  if (off < -42) return named({ id: `lent-0-${weekday}`, season: 'lent', name: `${WEEKDAYS[weekday]} after Ash Wednesday` })
  if (off < -7) return inWeek(`lent-${Math.floor((off + 42) / 7) + 1}`, weekday, 'lent')
  if (off < 0) return named(inWeek('holy-week', weekday, 'holy-week'))
  if (off < 42) return named(inWeek(`easter-${Math.floor(off / 7)}`, weekday, 'easter'))
  if (off < 49) return inWeek('easter-6', weekday, 'easter')
  if (off < 56) return named(inWeek('whitsun', weekday, 'whitsun'))

  // Trinity Sunday and the Sundays after Trinity. The Sunday next before Advent
  // is always the last.
  const week = Math.floor((off - 56) / 7)
  if (daysBetween(d, advent) <= 7) return inWeek('next-before-advent', weekday, 'trinity')
  return inWeek(`trinity-${week}`, weekday, 'trinity')
}

/**
 * The 1662 collect for a Sunday after Trinity. The rubric after the Twenty-fifth
 * Sunday: the last Sunday always takes the Twenty-fifth. If there are more Sundays,
 * they take the services of the Sundays after the Epiphany that were not used.
 */
function trinityCollect(week: string, year: number): string {
  if (week === 'next-before-advent') return 'trinity-25-0'
  const n = +week.split('-')[1]
  const advent = adventSunday(year)
  const trinity = addDays(easter(year), 56)
  const numbered = Math.round(daysBetween(trinity, advent) / 7) - 2 // the Sundays before the last one
  const surplus = numbered - 24
  if (surplus > 0 && n > 24) return `epiphany-${6 - surplus + (n - 24)}-0`
  return `trinity-${n}-0`
}

/** The Sunday or feast whose collect serves this date. */
function collectFor(d: Date): string {
  for (let back = 0; back < 8; back++) {
    const day = addDays(d, -back)
    const t = temporal(day)
    if (t.id === 'christmas-2') return 'jan-01'
    // Saint Stephen, Saint John and the Innocents have their own collects on their
    // own days. They do not serve the days after them, even on a Sunday.
    if (back > 0 && ['dec-26', 'dec-27', 'dec-28'].includes(t.id)) continue
    if (day.getDay() === 0 || GOVERNING.has(t.id)) {
      if (t.id === 'dec-24' || t.id.startsWith('dec-2') || t.id.startsWith('jan-0')) {
        if (t.own) return t.own
        continue
      }
      const week = t.id.replace(/-\d$/, '')
      if (week.startsWith('trinity-') && week !== 'trinity-0') return trinityCollect(week, day.getFullYear())
      if (week === 'next-before-advent') return 'trinity-25-0'
      return t.own ?? `${week}-0`
    }
    // The days of Christmas and the feasts in a week have their own collects. From
    // Monday to Thursday before Easter, the collect of the Sunday serves.
    if (t.own && back === 0 && !/^holy-week-[1-4]$/.test(t.id)) return t.own
  }
  return temporal(d).id
}

export function churchDay(date: Date): ChurchDay {
  const d = ymd(date.getFullYear(), date.getMonth() + 1, date.getDate())
  const t = temporal(d)
  let collect = collectFor(d)
  let propers = t.own
  if (propers?.startsWith('trinity-') && propers !== 'trinity-0-0') propers = trinityCollect(t.id.replace(/-\d$/, ''), d.getFullYear())
  if (propers === 'next-before-advent-0') propers = 'trinity-25-0'
  const holyDay = holyDayOn(d)
  const out: ChurchDay = { id: t.id, season: t.season, name: t.name, collect }
  // A saint's day on a weekday takes its own collect, Epistle and Gospel. On a
  // Sunday the Sunday keeps them.
  if (holyDay && d.getDay() !== 0) {
    collect = holyDay
    propers = holyDay
    out.collect = collect
  }
  if (propers) out.propers = propers
  if (holyDay) out.holyDay = holyDay
  return out
}

/** Every lesson id that a date can map to. */
export function allLessonIds(): string[] {
  const ids: string[] = []
  const week = (w: string, from = 0, to = 6) => {
    for (let wd = from; wd <= to; wd++) ids.push(`${w}-${wd}`)
  }
  for (let n = 1; n <= 3; n++) week(`advent-${n}`)
  // The Saturday after the Fourth Sunday in Advent is always 24 December or later.
  week('advent-4', 0, 5)
  ids.push('dec-24', 'dec-25', 'dec-26', 'dec-27', 'dec-28', 'dec-29', 'dec-30', 'dec-31', 'christmas-sunday')
  ids.push('jan-01', 'jan-02', 'jan-03', 'jan-04', 'jan-05', 'christmas-2', 'jan-06')
  week('epiphany-0', 1, 6)
  for (let n = 1; n <= 6; n++) week(`epiphany-${n}`)
  week('septuagesima')
  week('sexagesima')
  week('quinquagesima', 0, 2)
  week('lent-0', 3, 6)
  for (let n = 1; n <= 5; n++) week(`lent-${n}`)
  week('holy-week')
  for (let n = 0; n <= 6; n++) week(`easter-${n}`)
  week('whitsun')
  for (let n = 0; n <= 26; n++) week(`trinity-${n}`)
  week('next-before-advent')
  return ids
}
