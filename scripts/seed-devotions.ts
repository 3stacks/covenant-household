// Writes the reading plans into content/devotions/<id>.json for every church-year id.
//
//   node scripts/seed-devotions.ts
//
// The script sets only the "confession" and "proverb" parts. It keeps every other
// part of a file that exists, but it removes parts that contain sample text.
// Run it again after a change to the plans. It gives the same result each time.
//
// Some ids do not occur every year. For example, the Sixth Sunday after the
// Epiphany occurs in about one year in sixteen. A plan that runs through those
// days would lose parts in a short year. So the plans have two parts:
//
//   Days that occur every year ("core" days):
//     Sundays:    the Shorter Catechism, all 107 questions in a year.
//     Weekdays:   the Westminster Confession (172 sections), then the Canons of Dort (93 units).
//     Holy Week:  Monday to Friday read the Larger Catechism on the humiliation of Christ (Q. 46-50).
//     Proverbs:   Proverbs 10 onwards, about two verses each day.
//   Days that do not occur every year:
//     The Larger Catechism, in order, about two questions each day. No proverb.
//
// Node 24 runs this TypeScript file directly.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { allLessonIds, churchDay } from '../packages/core/src/churchYear.ts'
import type { ConfessionDoc, Devotions } from '../packages/core/src/types.ts'
import { validateDevotions } from '../packages/core/src/validate.ts'
import { getJson, HEARERS_DATA, kjvBook } from './cache.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const dir = join(root, 'content/devotions')

/** The ids that occur in each of the 400 years of the Gregorian cycle. */
function coreIds(): Set<string> {
  const years = new Map<string, Set<number>>()
  for (let y = 2000; y < 2400; y++) {
    for (let d = new Date(y, 0, 1); d.getFullYear() === y; d = new Date(y, d.getMonth(), d.getDate() + 1)) {
      const id = churchDay(d).id
      if (!years.has(id)) years.set(id, new Set())
      years.get(id)!.add(y)
    }
  }
  return new Set([...years].filter(([, ys]) => ys.size === 400).map(([id]) => id))
}

/** Split the list into n runs in order, with lengths that differ by one at most. */
function chunks<T>(list: T[], n: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < n; i++) out.push(list.slice(Math.round((i * list.length) / n), Math.round(((i + 1) * list.length) / n)))
  return out
}

const unitIds = async (doc: ConfessionDoc) => ((await getJson(`${HEARERS_DATA}/docs/${doc}.json`)) as { units: { id: string }[] }).units.map((u) => u.id)

const isSunday = (id: string) => /-0$/.test(id) || id === 'christmas-sunday' || id === 'christmas-2'
const HOLY_WEEK = ['holy-week-1', 'holy-week-2', 'holy-week-3', 'holy-week-4', 'holy-week-5']
const HUMILIATION = ['wlc-46', 'wlc-47', 'wlc-48', 'wlc-49', 'wlc-50']

const ids = allLessonIds()
const core = coreIds()
const coreSundays = ids.filter((id) => core.has(id) && isSunday(id))
const coreWeekdays = ids.filter((id) => core.has(id) && !isSunday(id) && !HOLY_WEEK.includes(id))
const other = ids.filter((id) => !core.has(id))

const plan = new Map<string, Pick<Devotions, 'confession' | 'proverb'>>()
const set = (id: string, part: Pick<Devotions, 'confession' | 'proverb'>) => plan.set(id, { ...plan.get(id), ...part })

// The Shorter Catechism on the Sundays.
const wsc = await unitIds('wsc')
chunks(wsc, coreSundays.length).forEach((units, i) => set(coreSundays[i], { confession: { doc: 'wsc', units } }))

// The Westminster Confession, then the Canons of Dort, on the weekdays: one unit each day.
const weekdayUnits: [ConfessionDoc, string][] = [...(await unitIds('wcf')).map((u): [ConfessionDoc, string] => ['wcf', u]), ...(await unitIds('dort')).map((u): [ConfessionDoc, string] => ['dort', u])]
if (weekdayUnits.length > coreWeekdays.length) throw new Error(`${weekdayUnits.length} units for ${coreWeekdays.length} weekdays`)
chunks(weekdayUnits, coreWeekdays.length).forEach((units, i) => {
  if (units.length) set(coreWeekdays[i], { confession: { doc: units[0][0], units: units.map(([, u]) => u) } })
})

// The humiliation of Christ in Holy Week.
HOLY_WEEK.forEach((id, i) => set(id, { confession: { doc: 'wlc', units: [HUMILIATION[i]] } }))

// The Larger Catechism on the days that do not occur every year.
const wlc = (await unitIds('wlc')).filter((u) => !HUMILIATION.includes(u))
chunks(wlc, other.length).forEach((units, i) => set(other[i], { confession: { doc: 'wlc', units } }))

// Proverbs from chapter 10, in portions of two verses inside one chapter, on the core days.
const prov = await kjvBook('Prov')
const portions: string[] = []
for (let c = 10; c <= prov.length; c++) {
  const n = prov[c - 1].length
  for (let v = 1; v <= n; v += 2) portions.push(v + 1 <= n ? `Prov.${c}.${v}-${v + 1}` : `Prov.${c}.${v}`)
}
const coreDays = ids.filter((id) => core.has(id))
coreDays.forEach((id, i) => {
  if (i < portions.length) set(id, { proverb: { passage: portions[i] } })
})

// Write the files. Keep the other parts, but drop sample text.
mkdirSync(dir, { recursive: true })
let problems = 0
for (const id of ids) {
  const file = join(dir, `${id}.json`)
  const old: Devotions = existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : { id }
  for (const k of ['writing', 'hymn', 'prayer'] as const) {
    if (old[k] && (old[k] as { source: { licence: string } }).source.licence === 'sample') delete old[k]
  }
  const day: Devotions = { id, ...plan.get(id), ...Object.fromEntries(Object.entries(old).filter(([k]) => !['id', 'confession', 'proverb'].includes(k))) }
  for (const p of validateDevotions(day, { release: true })) {
    console.error(`${id}: ${p.path}: ${p.message}`)
    problems++
  }
  writeFileSync(file, JSON.stringify(day, null, 2) + '\n')
}

const count = (doc: string) => [...plan.values()].filter((p) => p.confession?.doc === doc).length
console.log(
  `${ids.length} days: ${core.size} occur every year. ` +
    `Shorter Catechism on ${count('wsc')} Sundays, Confession on ${count('wcf')} days, Dort on ${count('dort')} days, ` +
    `Larger Catechism on ${count('wlc')} days, a proverb on ${Math.min(portions.length, coreDays.length)} days ` +
    `(${portions.length} portions from Proverbs 10).`,
)
if (problems) process.exit(1)
