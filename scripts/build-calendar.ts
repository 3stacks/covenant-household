// Checks the content, adds the text of each reading, and writes the calendar for
// each app:
//   apps/web/public/calendar/   the web app fetches each file
//   apps/mobile/calendar/       the mobile app has each file in its bundle.
//                               files.ts maps each path to a require().
//
//   node scripts/build-calendar.ts             sample text is allowed
//   node scripts/build-calendar.ts --release   leave out each file that is not cleared for release
//   node scripts/build-calendar.ts --offline   use only .cache/sources/
//
// The text comes from the published data of the other apps, so the ids and keys
// always match the links:
//   KJV and confession text: https://hearers.app/app/data/
//   BSB and Statenvertaling: see scripts/bibles.ts
//   1650 Psalter text:       https://precentor.app/corpus/psalms/
// Downloads stay in .cache/sources/ (not in git).
//
// Node 24 runs this TypeScript file directly.

import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { resolveCollects, resolveDevotions, resolveLessons, resolvePsalter, type Sources } from '../packages/core/src/resolve.ts'
import type { CalendarIndex, Collects, Commemoration, Devotions, Lectionary, Psalter } from '../packages/core/src/types.ts'
import { validateCommemoration, validateDevotions, type Problem } from '../packages/core/src/validate.ts'
import { BIBLES, bibleDir } from '../packages/core/src/bibles.ts'
import { bibleBook } from './bibles.ts'
import { getJson, HEARERS_DATA, kjvBook, PRECENTOR_CORPUS } from './cache.ts'

const root = fileURLToPath(new URL('..', import.meta.url))
const targets = [join(root, 'apps/web/public/calendar'), join(root, 'apps/mobile/calendar')]
const release = process.argv.includes('--release')

const sources: Sources = {
  book: kjvBook,
  doc: (id) => getJson(`${HEARERS_DATA}/docs/${id}.json`) as ReturnType<Sources['doc']>,
  psalm: (key) => getJson(`${PRECENTOR_CORPUS}/psalms/${key}.json`) as ReturnType<Sources['psalm']>,
}

const readJson = <T>(...path: string[]) => JSON.parse(readFileSync(join(root, ...path), 'utf8')) as T
const lectionary = readJson<Lectionary>('content/lectionary/1922.json')
const collects = readJson<Collects>('content/lectionary/1662.json')
const psalter = readJson<Psalter>('content/lectionary/psalter-1662.json')

let errors = 0
let samples = 0

let left = 0

type Check = (v: unknown, opts: { release?: boolean }) => Problem[]

/**
 * Read and check each file in content/<dir>/. A file with a problem is an error.
 * A release leaves out a file that is correct but not cleared, for example sample text.
 */
function readDir<T>(dir: string, check: Check, key: (v: T) => unknown): [string, T][] {
  const full = join(root, 'content', dir)
  const out: [string, T][] = []
  for (const file of readdirSync(full).filter((f) => f.endsWith('.json')).sort()) {
    const name = file.replace(/\.json$/, '')
    let value: unknown
    try {
      value = JSON.parse(readFileSync(join(full, file), 'utf8'))
    } catch (e) {
      console.error(`${dir}/${file}: not valid JSON. ${(e as Error).message}`)
      errors++
      continue
    }
    const problems = check(value, {})
    if (problems.length === 0 && key(value as T) !== name) problems.push({ path: '', message: `The id or date must be "${name}", the same as the file name.` })
    for (const p of problems) console.error(`${dir}/${file}: ${p.path}: ${p.message}`)
    if (problems.length) {
      errors++
      continue
    }
    if (release) {
      const held = check(value, { release: true })
      if (held.length) {
        console.warn(`${dir}/${file}: left out of the release. ${held[0].path}: ${held[0].message}`)
        left++
        continue
      }
    }
    if (JSON.stringify(value).includes('"licence":"sample"')) samples++
    out.push([name, value as T])
  }
  return out
}

const devotions = readDir<Devotions>('devotions', validateDevotions, (d) => d.id)
const commemorations = readDir<Commemoration>('commemorations', validateCommemoration, (c) => c.date)

const outputs: [string, unknown][] = []
async function add(path: string, make: () => Promise<unknown>) {
  try {
    outputs.push([path, await make()])
  } catch (e) {
    console.error(`${path}: ${(e as Error).message}`)
    errors++
  }
}

// The readings, once in each translation. The KJV files are at the root.
for (const bible of BIBLES) {
  const dir = bibleDir(bible.id)
  const s: Sources = bible.id === 'kjv' ? sources : { ...sources, book: (code) => bibleBook(bible.id as 'bsb' | 'sv', code), translation: `the ${bible.abbr}` }
  for (const [id, day] of Object.entries(lectionary.days)) await add(`${dir}lessons/${id}.json`, () => resolveLessons(id, day, s))
  for (const [id, day] of Object.entries(collects.days)) await add(`${dir}collects/${id}.json`, () => resolveCollects(id, day, s))
  for (const [id, d] of devotions) await add(`${dir}devotions/${id}.json`, () => resolveDevotions(d, s))
}
for (const [day, psalms] of Object.entries(psalter.days)) await add(`psalter/${day}.json`, () => resolvePsalter(+day, psalms, sources))
for (const [date, c] of commemorations) await add(`commemorations/${date}.json`, async () => c)

if (errors) {
  console.error(`\n${errors} problems.`)
  process.exit(1)
}

const index: CalendarIndex = {
  lessons: Object.keys(lectionary.days),
  collects: Object.keys(collects.days),
  devotions: devotions.map(([id]) => id),
  commemorations: commemorations.map(([date]) => date),
  sources: { lessons: lectionary.source, collects: collects.source, psalter: psalter.source },
}

outputs.push(['index.json', index])
for (const target of targets) {
  rmSync(target, { recursive: true, force: true })
  for (const [path, value] of outputs) {
    const file = join(target, path)
    mkdirSync(join(file, '..'), { recursive: true })
    writeFileSync(file, JSON.stringify(value))
  }
}

// Metro puts a file in the bundle only when a require() names it.
const requires = outputs.map(([path]) => `  '${path}': () => require('./${path}'),`).join('\n')
writeFileSync(
  join(root, 'apps/mobile/calendar/files.ts'),
  `// Written by scripts/build-calendar.ts. Do not edit.\n/* eslint-disable */\nexport const files: Record<string, () => unknown> = {\n${requires}\n}\n`,
)

console.log(
  `Calendar: ${index.lessons.length} lesson days, ${index.collects.length} collects, 30 psalter days, ` +
    `${devotions.length} devotions and ${commemorations.length} commemorations.` +
    (samples ? ` ${samples} files contain sample text.` : '') +
    (left ? ` ${left} files are left out of the release.` : ''),
)
