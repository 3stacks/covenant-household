// Imports the Collects, Epistles and Gospels of the 1662 Book of Common Prayer
// into content/lectionary/1662.json.
//
//   node scripts/import-1662.ts
//
// The source is the transcription by Lynda Howell
// (http://www.eskimo.com/~lhowell/bcp1662/communion/). The book gives the first
// verse of each Epistle and Gospel and then its text. The importer finds the last
// verse: it matches the last words of the text against the KJV.
//
// Copyright: in the United Kingdom the Crown holds the rights in the 1662 text.
// Outside the United Kingdom the text is in the public domain. The app shows the
// collects. It reads the Epistles and Gospels from the KJV in Hearers.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BOOKS } from '../packages/core/src/books.ts'
import type { Collects, CollectDay } from '../packages/core/src/types.ts'
import { kjvBook } from './cache.ts'
import { parseReference } from './refs.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const cache = join(root, '.cache/1662')
const BASE = 'http://www.eskimo.com/~lhowell/bcp1662/communion'
const PAGES = ['xmas', 'lent', 'easter', 'trinity', 'saints']

async function page(name: string): Promise<string> {
  const file = join(cache, `${name}.html`)
  if (existsSync(file)) return readFileSync(file, 'latin1')
  const r = await fetch(`${BASE}/${name}.html`)
  if (!r.ok) throw new Error(`${name}: ${r.status}`)
  const text = Buffer.from(await r.arrayBuffer()).toString('latin1')
  mkdirSync(cache, { recursive: true })
  writeFileSync(file, text, 'latin1')
  return text
}

const decode = (s: string) =>
  s
    .replace(/<IMG[^>]*ALT\s*=\s*"([^"]*)"[^>]*>/gi, '$1') // drop capitals are images
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n))
    .replace(/\s+/g, ' ')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/^([A-Z]) ([A-Z]+)/, '$1$2') // "A LMIGHTY" → "ALMIGHTY"
    .trim()

/** The church-year id for each heading. The order matters: the first match wins. */
const TITLES: [RegExp, string][] = [
  [/First Sunday of Advent/, 'advent-1-0'],
  [/Second Sunday (of|in) Advent/, 'advent-2-0'],
  [/Third Sunday (of|in) Advent/, 'advent-3-0'],
  [/Fourth Sunday (of|in) Advent/, 'advent-4-0'],
  [/Nativity/, 'dec-25'],
  [/Stephen/, 'dec-26'],
  [/John the Evangelist/, 'dec-27'],
  [/Innocents/, 'dec-28'],
  [/Sunday after Christmas/, 'christmas-sunday'],
  [/Circumcision/, 'jan-01'],
  [/^The Epiphany/, 'jan-06'],
  [/(First|Second|Third|Fourth|Fifth|Sixth) Sunday after the Epiphany/, 'epiphany-N'],
  [/Septuagesima/, 'septuagesima-0'],
  [/Sexagesima/, 'sexagesima-0'],
  [/Quinquagesima/, 'quinquagesima-0'],
  [/First day of Lent/, 'lent-0-3'],
  [/(First|Second|Third|Fourth|Fifth) Sunday in Lent/, 'lent-N'],
  [/Sunday next before Easter/, 'holy-week-0'],
  [/Monday before Easter/, 'holy-week-1'],
  [/Tuesday before Easter/, 'holy-week-2'],
  [/Wednesday before Easter/, 'holy-week-3'],
  [/Thursday before Easter/, 'holy-week-4'],
  [/Good Friday/, 'holy-week-5'],
  [/Easter-Even/, 'holy-week-6'],
  [/^Easter-Day/, 'easter-0-0'],
  [/Monday in Easter/, 'easter-0-1'],
  [/Tuesday in Easter/, 'easter-0-2'],
  [/(First|Second|Third|Fourth|Fifth) Sunday after Easter/, 'easter-N'],
  // Before Ascension Day: "Sunday after Ascension-Day" contains "Ascension-Day".
  [/Sunday after Ascension/, 'easter-6-0'],
  [/Ascension-Day/, 'easter-5-4'],
  [/Whit-Sunday/, 'whitsun-0'],
  [/Monday in Whitsun/, 'whitsun-1'],
  [/Tuesday in Whitsun/, 'whitsun-2'],
  [/Trinity-Sunday/, 'trinity-0-0'],
  [/(\w+(?:-\w+)?) Sunday after Trinity/, 'trinity-N'],
  [/Andrew/, 'holy-11-30'],
  [/Thomas the Apostle/, 'holy-12-21'],
  [/Conversion of Saint Paul/, 'holy-01-25'],
  [/Presentation of Christ/, 'holy-02-02'],
  [/Matthias/, 'holy-02-24'],
  [/Annunciation/, 'holy-03-25'],
  [/Saint Mark/, 'holy-04-25'],
  [/Philip and Saint James/, 'holy-05-01'],
  [/Barnabas/, 'holy-06-11'],
  [/John Baptist/, 'holy-06-24'],
  [/Saint Peter/, 'holy-06-29'],
  [/Saint James the Apostle/, 'holy-07-25'],
  [/Bartholomew/, 'holy-08-24'],
  [/Saint Matthew/, 'holy-09-21'],
  [/Michael/, 'holy-09-29'],
  [/Saint Luke/, 'holy-10-18'],
  [/Simon and Saint Jude/, 'holy-10-28'],
  [/All Saints/, 'holy-11-01'],
]

const ORDINAL: Record<string, number> = {
  First: 1, Second: 2, Third: 3, Fourth: 4, Fifth: 5, Sixth: 6, Seventh: 7, Eighth: 8, Ninth: 9, Tenth: 10,
  Eleventh: 11, Twelfth: 12, Thirteenth: 13, Fourteenth: 14, Fifteenth: 15, Sixteenth: 16, Seventeenth: 17,
  Eighteenth: 18, Nineteenth: 19, Twentieth: 20, 'Twenty-first': 21, 'Twenty-second': 22, 'Twenty-third': 23,
  'Twenty-fourth': 24, 'Twenty-fifth': 25,
}

function idFor(title: string): string | undefined {
  for (const [re, id] of TITLES) {
    const m = title.match(re)
    if (!m) continue
    if (!id.endsWith('-N')) return id
    const n = ORDINAL[m[1]]
    if (!n) return undefined
    const week = id.replace(/-N$/, '')
    return `${week}-${n}-0`
  }
  return undefined
}

// The KJV, for the last verse of each Epistle and Gospel.
const kjv = new Map<string, string[][]>()
for (const b of BOOKS) kjv.set(b.code, await kjvBook(b.code))
const verseCount = (code: string, chapter: number) => kjv.get(code)?.[chapter - 1]?.length

// "cast-away" in the book is "castaway" in the KJV, so a hyphen joins the parts.
const words = (s: string) => s.toLowerCase().replace(/(\w)-(\w)/g, '$1$2').replace(/[^a-z ]+/g, ' ').split(/\s+/).filter(Boolean)

/** "Rom. 13, 8." or "St. Matth. 21. 1." → the code, chapter and verse. */
function startOf(ref: string): { code: string; chapter: number; verse: number } | undefined {
  const clean = ref
    .replace(/\bSt\.\s*|\bSaint\s+/g, '')
    .replace(/\bMatth\b/, 'Matthew')
    .replace(/\bEphes\b/, 'Ephesians')
    .replace(/\bApoc\b/, 'Revelation')
    .replace(/\bColoss\b/, 'Colossians')
    .replace(/[.,]\s*$/, '')
  let m = clean.match(/^(.+?)\s*(\d+)\s*[.,]\s*(\d+)/)
  // A book of one chapter: "Jude 1" is verse 1.
  const one = clean.match(/^(.+?)\s*(\d+)$/)
  if (!m && one) m = [one[0], one[1], '1', one[2]] as unknown as RegExpMatchArray
  if (!m) return undefined
  const parts = parseReference(`${m[1].trim()} ${m[2]}:${m[3]}-${m[3]}`, verseCount)
  if (!parts) return undefined
  const [code] = parts[0].split('.')
  return { code, chapter: +m[2], verse: +m[3] }
}

/** The passage id from the first verse to the verse where the text ends. */
function passageFor(ref: string, text: string): string | undefined {
  const start = startOf(ref)
  if (!start) return undefined
  const book = kjv.get(start.code)
  if (!book) return undefined
  // Find the verse that ends with the last words of the text. Try 5 words, then 3,
  // then 2: the spelling can differ ("Judaea" in the book, "Judea" in the KJV).
  const all = words(text)
  const tests: ((verse: string) => boolean)[] = [5, 3, 2].map((n) => (v) => v.endsWith(all.slice(-n).join(' ')))
  // Last, a verse that contains the last 4 words: some lessons end part of the way
  // through a verse.
  tests.push((v) => v.includes(all.slice(-4).join(' ')))
  for (const test of tests) {
    // Look through the rest of the chapter and the next chapter.
    for (let c = start.chapter; c <= Math.min(start.chapter + 1, book.length); c++) {
      const first = c === start.chapter ? start.verse : 1
      for (let v = first; v <= book[c - 1].length; v++) {
        if (!test(words(book[c - 1][v - 1]).join(' '))) continue
        if (c === start.chapter) return v === start.verse ? `${start.code}.${c}.${v}` : `${start.code}.${c}.${start.verse}-${v}`
        return `${start.code}.${start.chapter}.${start.verse}-${c}.${v}`
      }
    }
  }
  return undefined
}

const days: Record<string, CollectDay> = {}
const problems: string[] = []
let lastId: string | undefined

for (const name of PAGES) {
  const html = await page(name)
  // Each day starts with a centred heading in bold.
  const blocks = html.split(/<CENTER>\s*<STRONG>/i).slice(1)
  for (const block of blocks) {
    let title = decode(block.split(/<\/STRONG>/i)[0])
    // Ascension Day prints its Gospel under a heading of its own.
    if (/^The Gospel\.?$/.test(title) && lastId) {
      const ref = decode(block.split(/<\/STRONG>/i)[1].split(/<\/CENTER>/i)[0])
      const body = decode(block.split(/<\/CENTER>/i).slice(1).join(' ').split(/<CENTER>/i)[0])
      const passage = passageFor(ref, body)
      if (passage) days[lastId].gospel = passage
      else problems.push(`${lastId}: cannot find the Gospel "${ref}"`)
      continue
    }
    const id = idFor(title)
    if (!id) {
      if (!/Epistle|Gospel|Collect|^Next/.test(title)) problems.push(`${name}: no id for "${title}"`)
      continue
    }
    if (days[id]) continue // Sexagesima has two headings.

    // The parts of the day, in order: the collect(s), the Epistle, the Gospel.
    const sections = block.split(/<CENTER>\s*(?:<A[^>]*>\s*)?<(?:I|EM)>/i).slice(1)
    const collects: string[] = []
    const day: CollectDay = { title }
    for (const section of sections) {
      const [headingHtml, ...restParts] = section.split(/<\/(?:I|EM)>/i)
      const heading = decode(headingHtml)
      const rest = restParts.join('</EM>')
      // The rubrics are red. Leave them out of the text.
      // The text runs from the end of the reference line to the next centred line.
      // A rubric after the last Gospel of the Trinity season is not part of it.
      const body = decode(rest.split(/<\/CENTER>/i).slice(1).join(' ').split(/<CENTER>/i)[0]).replace(/\bIf there be any more Sundays[\s\S]*$/, '')
      const ref = decode(rest.split(/<\/CENTER>/i)[0])
      if (/^The Collects?\.?$/.test(heading)) {
        const text = decode(rest.split(/<CENTER>/i)[0].replace(/^[\s\S]*?<\/CENTER>/i, ''))
        if (text) collects.push(text)
      } else if (/Epistle/.test(heading)) {
        const passage = passageFor(ref, body)
        if (passage) day.epistle = passage
        else problems.push(`${id}: cannot find the Epistle "${ref}"`)
      } else if (/Gospel/.test(heading)) {
        const passage = passageFor(ref, body)
        if (passage) day.gospel = passage
        else problems.push(`${id}: cannot find the Gospel "${ref}"`)
      }
    }
    if (collects.length) day.collects = collects
    // In Holy Week the collect of Palm Sunday serves Monday to Thursday.
    else if (!/^holy-week-[1-4]$/.test(id)) problems.push(`${id}: no collect`)
    days[id] = day
    lastId = id
  }
}

const out: Collects = {
  name: 'The Collects, Epistles and Gospels (1662)',
  source: {
    name: 'The Book of Common Prayer (1662). Transcription by Lynda Howell.',
    url: 'http://www.eskimo.com/~lhowell/bcp1662/communion/',
    licence: 'public-domain',
    note: 'In the United Kingdom the Crown holds the rights in the 1662 text. Outside the United Kingdom it is in the public domain.',
  },
  days,
}

mkdirSync(join(root, 'content/lectionary'), { recursive: true })
writeFileSync(join(root, 'content/lectionary/1662.json'), JSON.stringify(out, null, 1) + '\n')
console.log(`1662: ${Object.keys(days).length} days.`)
for (const p of problems) console.warn(`problem: ${p}`)
