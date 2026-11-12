// Imports the 1662 order for reading the Psalter into content/lectionary/psalter-1662.json.
//
//   node scripts/import-psalter.ts
//
// The 1662 Book of Common Prayer reads the Psalter through each month: a part for
// Morning Prayer and a part for Evening Prayer on each of 30 days. The 31st day of
// a month repeats the 30th. The importer reads the day and office headings from
// the transcription by Lynda Howell, and the verse numbers of Psalm 119.
// The app sings these psalms from the 1650 Scottish Psalter, which keeps the same
// psalm and verse numbers.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { PsalmPortion, Psalter } from '../packages/core/src/types.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const cache = join(root, '.cache/1662')
const BASE = 'http://www.eskimo.com/~lhowell/bcp1662/psalter'

async function page(n: number): Promise<string> {
  const file = join(cache, `psalms_${n}.html`)
  if (existsSync(file)) return readFileSync(file, 'latin1')
  const r = await fetch(`${BASE}/psalms_${n}.html`)
  if (!r.ok) throw new Error(`psalms_${n}: ${r.status}`)
  const text = Buffer.from(await r.arrayBuffer()).toString('latin1')
  mkdirSync(cache, { recursive: true })
  writeFileSync(file, text, 'latin1')
  return text
}

// The text as a list of pieces between tags.
const pieces = (html: string) =>
  html
    .replace(/&#160;|&nbsp;/g, ' ')
    .split(/<[^>]+>/)
    .map((s) => s.replace(/\s+/g, ' ').trim())
    .filter(Boolean)

const days: Psalter['days'] = {}
let day = 0
let office: 'morning' | 'evening' = 'morning'
let current: PsalmPortion | undefined
// The last psalm heading. An office can start part of the way through Psalm 119,
// with no heading of its own.
let lastPsalm = 0

for (let n = 1; n <= 5; n++) {
  for (const p of pieces(await page(n))) {
    let m: RegExpMatchArray | null
    if ((m = p.match(/^Day (\d+)(?: \(and 31\))?\.?$/))) {
      day = +m[1]
      current = undefined
    } else if ((m = p.match(/^(Morning|Evening) Prayer\.?$/))) {
      office = m[1] === 'Morning' ? 'morning' : 'evening'
      current = undefined
    } else if ((m = p.match(/^Psalm (\d+)$/)) && day) {
      current = { psalm: +m[1] }
      lastPsalm = current.psalm
      const entry = (days[String(day)] ??= { morning: [], evening: [] })
      entry[office].push(current)
    } else if (!current && lastPsalm === 119 && day && (m = p.match(/^(\d+)\. /))) {
      // An office that continues Psalm 119.
      current = { psalm: 119, verses: [+m[1] - 1, +m[1]] }
      const entry = (days[String(day)] ??= { morning: [], evening: [] })
      entry[office].push(current)
    } else if (current?.psalm === 119 && (m = p.match(/^(\d+)\. /))) {
      // Psalm 119 spans several offices. Keep the first and last verse in each.
      const v = +m[1]
      const [first, last] = current.verses ?? [v - 1, v]
      current.verses = [Math.min(first, v - 1), Math.max(last, v)]
    }
  }
}

// An office that starts a new part of Psalm 119 begins at the verse before the
// first numbered verse. The first part begins at verse 1.
for (const entry of Object.values(days)) {
  for (const portion of [...entry.morning, ...entry.evening]) {
    if (portion.psalm === 119 && portion.verses && portion.verses[0] < 1) portion.verses[0] = 1
  }
}

const count = Object.keys(days).length
if (count !== 30) throw new Error(`Expected 30 days, found ${count}.`)

const psalter: Psalter = {
  name: 'The Psalter, as it is appointed to be read (1662)',
  source: {
    name: 'The Book of Common Prayer (1662). Transcription by Lynda Howell.',
    url: 'http://www.eskimo.com/~lhowell/bcp1662/info/reading_psalt.html',
    licence: 'public-domain',
  },
  days,
}
writeFileSync(join(root, 'content/lectionary/psalter-1662.json'), JSON.stringify(psalter, null, 1) + '\n')
for (const [d, e] of Object.entries(days)) {
  const show = (ps: PsalmPortion[]) => ps.map((p) => (p.verses ? `${p.psalm}:${p.verses[0]}-${p.verses[1]}` : p.psalm)).join(' ')
  console.log(`day ${d}: morning ${show(e.morning)} | evening ${show(e.evening)}`)
}
