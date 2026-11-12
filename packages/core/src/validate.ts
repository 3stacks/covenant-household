// Checks one devotions file or one commemoration file. The build script and the
// tests use this module. It has no imports from the browser, so Node can run it.

import { allLessonIds } from './churchYear.ts'
import { parsePassage } from './passage.ts'
import type { ConfessionDoc, Licence } from './types.ts'

export interface Problem {
  path: string
  message: string
}

const LICENCES: Licence[] = ['public-domain', 'CC0', 'CC-BY-4.0', 'permission', 'sample']
const DOCS: ConfessionDoc[] = ['wcf', 'wlc', 'wsc', 'hc', 'bc', 'dort']
// The Heidelberg Catechism and Belgic Confession texts in Hearers look like modern
// translations under copyright. Hearers must replace them before a release can use them.
const NOT_FOR_RELEASE: ConfessionDoc[] = ['hc', 'bc']
const LESSON_IDS = new Set(allLessonIds())
const DAYS_IN_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]

// Hearers unit ids: "wcf-1.1", "wsc-1", "dort-1-a1", "dort-1-r1". Heads III and IV
// of the Canons of Dort are one head: "dort-3-4-a1".
const UNIT_ID: Record<ConfessionDoc, RegExp> = {
  wcf: /^wcf-\d+\.\d+$/,
  wlc: /^wlc-\d+$/,
  wsc: /^wsc-\d+$/,
  hc: /^hc-\d+$/,
  bc: /^bc-\d+$/,
  dort: /^dort-(1|2|3-4|5)-[ar]\d+$/,
}

type Obj = Record<string, unknown>
const isObj = (v: unknown): v is Obj => typeof v === 'object' && v !== null && !Array.isArray(v)
const isText = (v: unknown): v is string => typeof v === 'string' && v.trim().length > 0

export function isDateKey(key: string): boolean {
  const m = key.match(/^(\d{2})-(\d{2})$/)
  if (!m) return false
  const month = +m[1]
  const day = +m[2]
  return month >= 1 && month <= 12 && day >= 1 && day <= DAYS_IN_MONTH[month - 1]
}

type Fail = (path: string, message: string) => void

function checkers(fail: Fail, opts: { release?: boolean }) {
  const source = (v: unknown, path: string) => {
    if (!isObj(v)) return fail(path, 'A source is necessary.')
    if (!isText(v.name)) fail(`${path}.name`, 'Give the name of the source.')
    if (!LICENCES.includes(v.licence as Licence)) fail(`${path}.licence`, `Use one of: ${LICENCES.join(', ')}.`)
    if (opts.release && v.licence === 'sample') fail(`${path}.licence`, 'A release must not contain sample text.')
    if (v.url !== undefined && !(typeof v.url === 'string' && /^https?:\/\//.test(v.url))) fail(`${path}.url`, 'Use a full URL.')
  }

  const paragraphs = (v: unknown, path: string) => {
    if (!Array.isArray(v) || v.length === 0 || !v.every(isText)) fail(path, 'Give at least one paragraph of text.')
  }

  const passage = (v: unknown, path: string, book?: string) => {
    if (typeof v !== 'string') return fail(path, 'A passage is necessary.')
    const p = parsePassage(v)
    if (!p) return fail(path, `"${v}" is not a valid passage. Use the form "Rom.8.28-30".`)
    if (book && p.book.code !== book) fail(path, `The passage must be in ${book}.`)
  }

  const writing = (v: unknown, path: string) => {
    if (!isObj(v)) return fail(path, 'A writing must be an object.')
    for (const k of ['title', 'author', 'work'] as const) if (!isText(v[k])) fail(`${path}.${k}`, `Give the ${k}.`)
    paragraphs(v.text, `${path}.text`)
    source(v.source, `${path}.source`)
  }

  return { source, paragraphs, passage, writing }
}

/** Returns the problems in a devotions file. An empty list means the file is valid. */
export function validateDevotions(day: unknown, opts: { release?: boolean } = {}): Problem[] {
  const out: Problem[] = []
  const fail: Fail = (path, message) => out.push({ path, message })
  if (!isObj(day)) return [{ path: '', message: 'The devotions must be an object.' }]
  const { source, paragraphs, passage, writing } = checkers(fail, opts)

  if (typeof day.id !== 'string' || !LESSON_IDS.has(day.id)) fail('id', 'Use a church-year id, for example "advent-2-3" (see churchYear.ts).')

  if (day.proverb !== undefined) {
    if (!isObj(day.proverb)) fail('proverb', 'A proverb must be an object.')
    else passage(day.proverb.passage, 'proverb.passage', 'Prov')
  }

  if (day.writing !== undefined) writing(day.writing, 'writing')

  if (day.hymn !== undefined) {
    const h = day.hymn
    if (!isObj(h)) fail('hymn', 'A hymn must be an object.')
    else {
      if (!isText(h.title)) fail('hymn.title', 'Give the title.')
      const hasWords = Array.isArray(h.stanzas) && h.stanzas.length > 0 && h.stanzas.every((s) => Array.isArray(s) && s.length > 0 && s.every(isText))
      if (h.stanzas !== undefined && !hasWords) fail('hymn.stanzas', 'Give each stanza as a list of lines.')
      if (h.stanzas === undefined && !isObj(h.hymnal)) fail('hymn', 'Give the words or a hymnal and number.')
      source(h.source, 'hymn.source')
    }
  }

  if (day.prayer !== undefined) {
    if (!isObj(day.prayer)) fail('prayer', 'A prayer must be an object.')
    else {
      paragraphs(day.prayer.text, 'prayer.text')
      source(day.prayer.source, 'prayer.source')
    }
  }

  if (day.confession !== undefined) {
    const c = day.confession
    if (!isObj(c)) fail('confession', 'A confession reading must be an object.')
    else {
      const doc = c.doc as ConfessionDoc
      if (!DOCS.includes(doc)) fail('confession.doc', `Use one of: ${DOCS.join(', ')}.`)
      const units = c.units
      if (!Array.isArray(units) || units.length === 0) fail('confession.units', 'Give at least one unit id.')
      else if (DOCS.includes(doc)) {
        units.forEach((u, i) => {
          if (typeof u !== 'string' || !UNIT_ID[doc].test(u)) fail(`confession.units[${i}]`, `"${u}" is not a ${doc} unit id.`)
        })
      }
      if (opts.release && NOT_FOR_RELEASE.includes(doc)) fail('confession.doc', 'The Hearers text of this document is not cleared for release yet.')
    }
  }

  return out
}

/** Returns the problems in a commemoration file. An empty list means the file is valid. */
export function validateCommemoration(c: unknown, opts: { release?: boolean } = {}): Problem[] {
  const out: Problem[] = []
  const fail: Fail = (path, message) => out.push({ path, message })
  if (!isObj(c)) return [{ path: '', message: 'The commemoration must be an object.' }]
  const { writing } = checkers(fail, opts)
  if (typeof c.date !== 'string' || !isDateKey(c.date)) fail('date', 'Use "MM-DD", for example "11-24".')
  if (typeof c.id !== 'string' || !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)) fail('id', 'Use a lowercase id, for example "john-knox".')
  if (!isText(c.name)) fail('name', 'Give the name.')
  if (c.writing !== undefined) writing(c.writing, 'writing')
  return out
}
