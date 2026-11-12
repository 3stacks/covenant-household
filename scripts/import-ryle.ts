// Adds a writing to each day whose Gospel (1662) is in St. Matthew: the section of
// J. C. Ryle's "Expository Thoughts on the Gospels" on that Gospel.
//
//   node scripts/import-ryle.ts
//
// Ryle wrote these sections "for family and private use". The text is public
// domain. It comes from the CCEL edition (ThML), which marks it "Public Domain".
// The download stays in .cache/sources/. The script keeps the other parts of each
// devotions file. It replaces only a writing that it wrote before.
//
// Only St. Matthew is on CCEL. Mark, Luke and John exist only as scans of the
// 1856-1873 editions, so their days have no writing yet.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { Collects, Devotions, Writing } from '../packages/core/src/types.ts'
import { parsePassage } from '../packages/core/src/passage.ts'
import { validateDevotions } from '../packages/core/src/validate.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const URL_XML = 'https://ccel.org/ccel/r/ryle/matthew.xml'
const WORK = 'Expository Thoughts on the Gospels: St. Matthew'
const SOURCE_NAME = 'Expository Thoughts on Matthew, Christian Classics Ethereal Library'

async function getText(url: string): Promise<string> {
  const file = join(root, '.cache/sources', url.replace(/^https?:\/\//, ''))
  if (existsSync(file)) return readFileSync(file, 'utf8')
  const r = await fetch(url)
  if (!r.ok) throw new Error(`${url}: ${r.status}`)
  const text = await r.text()
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
  return text
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' }
const plain = (html: string) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&(#\d+|\w+);/g, (m, e: string) => (e.startsWith('#') ? String.fromCodePoint(+e.slice(1)) : (ENTITIES[e] ?? m)))
    .replace(/\s+/g, ' ')
    // Inline tags leave spaces inside quotes and brackets: "“ the bridegroom ”".
    .replace(/([“‘(]) /g, '$1')
    .replace(/ ([”’),.;:!?])/g, '$1')
    .trim()

interface Section {
  id: string
  chapter: number
  from: number
  toChapter: number
  to: number
  paragraphs: string[]
}

const xml = await getText(URL_XML)
const sections: Section[] = []
for (const m of xml.matchAll(/<div2 title="Matthew (\d+):(\d+)-(?:(\d+):)?(\d+)" id="([^"]+)"[^>]*>([\s\S]*?)<\/div2>/g)) {
  const [, c, v1, c2, v2, id, body] = m
  const paragraphs = [...body.matchAll(/<p\b[^>]*>([\s\S]*?)<\/p>/g)].map((p) => plain(p[1])).filter(Boolean)
  sections.push({ id, chapter: +c, from: +v1, toChapter: c2 ? +c2 : +c, to: +v2, paragraphs })
}
if (sections.length < 90) throw new Error(`Only ${sections.length} sections found in ${URL_XML}`)

// A verse as one number, so that two ranges can be compared. No chapter has 1000 verses.
const at = (c: number, v: number) => c * 1000 + v
/** The number of verses that the Gospel and the section have in common (same chapter only). */
function overlap(s: Section, c1: number, v1: number, c2: number, v2: number) {
  const from = Math.max(at(s.chapter, s.from), at(c1, v1))
  const to = Math.min(at(s.toChapter, s.to), at(c2, v2))
  return to >= from && Math.floor(from / 1000) === Math.floor(to / 1000) ? to - from + 1 : 0
}

const collects = JSON.parse(readFileSync(join(root, 'content/lectionary/1662.json'), 'utf8')) as Collects
let written = 0
for (const [id, day] of Object.entries(collects.days)) {
  if (!day.gospel?.startsWith('Matt.')) continue
  const file = join(root, 'content/devotions', `${id}.json`)
  if (!existsSync(file)) continue // Saints' days have no devotions file.
  const p = parsePassage(day.gospel)
  if (!p) throw new Error(`${id}: ${day.gospel}`)
  // Use the section that has the most verses of the Gospel. The CCEL edition has
  // no section for some passages, for example Matthew 22:34-46. Those days get no
  // writing: a section that shares one or two verses is about something else.
  const scored = sections.map((s) => ({ s, n: overlap(s, p.c1, p.v1, p.c2, p.v2) })).sort((a, b) => b.n - a.n)
  const length = p.c1 === p.c2 ? p.v2 - p.v1 + 1 : 3
  if (scored[0].n < Math.min(3, length)) {
    console.log(`${id}: ${day.gospel} has no section in the CCEL edition`)
    continue
  }
  const s = scored[0].s

  const range = s.toChapter === s.chapter ? `${s.chapter}:${s.from}–${s.to}` : `${s.chapter}:${s.from}–${s.toChapter}:${s.to}`
  const writing: Writing = {
    title: `On Matthew ${range}`,
    author: 'J. C. Ryle',
    work: WORK,
    year: '1856',
    topic: 'The Gospel for the day',
    text: s.paragraphs,
    source: { name: SOURCE_NAME, url: `https://ccel.org/ccel/ryle/matthew/matthew.${s.id}.html`, licence: 'public-domain' },
  }
  const old = JSON.parse(readFileSync(file, 'utf8')) as Devotions
  if (old.writing && old.writing.work !== WORK) {
    console.log(`${id}: keeps its writing "${old.writing.title}"`)
    continue
  }
  const out = { ...old, writing }
  const problems = validateDevotions(out, { release: true })
  if (problems.length) throw new Error(`${id}: ${problems.map((x) => `${x.path}: ${x.message}`).join('; ')}`)
  writeFileSync(file, JSON.stringify(out, null, 2) + '\n')
  written++
  console.log(`${id}: ${day.gospel} → Ryle on Matthew ${range} (${s.paragraphs.length} paragraphs)`)
}
console.log(`${written} days have a writing by Ryle.`)
