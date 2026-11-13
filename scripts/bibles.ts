// The text of the translations other than the KJV, in KJV verse numbers.
// The KJV comes from Hearers (cache.ts). The sources are in bibles.ts of the
// shared code.
//
//   BSB: https://bereanbible.com/bsb.txt, one verse on each line.
//   SV:  STV.xml of github.com/Isidore-Guild/statenvertaling, OSIS with KJV
//        verse numbers. The script removes the notes (the Kanttekeningen), the
//        Strong's numbers and the original verse numbers in brackets.

import { bookFromName } from '../packages/core/src/bookNames.ts'
import { BOOKS } from '../packages/core/src/books.ts'
import { getText } from './cache.ts'

export const BSB_URL = 'https://bereanbible.com/bsb.txt'
export const SV_URL = 'https://raw.githubusercontent.com/Isidore-Guild/statenvertaling/master/STV.xml'

type Bible = Map<string, string[][]>

function put(bible: Bible, code: string, c: number, v: number, text: string) {
  const book = bible.get(code) ?? []
  bible.set(code, book)
  const chapter = (book[c - 1] ??= [])
  chapter[v - 1] = text
}

/** Fill each gap with "", so that each index is a string. */
function finish(bible: Bible): Bible {
  for (const book of bible.values()) {
    for (let c = 0; c < book.length; c++) {
      book[c] ??= []
      for (let v = 0; v < book[c].length; v++) book[c][v] ??= ''
    }
  }
  return bible
}

export function parseBsb(text: string): Bible {
  const bible: Bible = new Map()
  for (const line of text.replace(/^﻿/, '').split(/\r?\n/)) {
    const m = line.match(/^(.+?) (\d+):(\d+)\t(.*)$/)
    if (!m) continue
    const code = bookFromName(m[1])
    if (!code) throw new Error(`BSB: unknown book "${m[1]}"`)
    put(bible, code, +m[2], +m[3], m[4].trim())
  }
  return finish(bible)
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }

export function parseOsis(xml: string): Bible {
  const bible: Bible = new Map()
  const codes = new Set(BOOKS.map((b) => b.code))
  const verse = /<verse osisID="([1-3]?[A-Za-z]+)\.(\d+)\.(\d+)"[^>]*>([\s\S]*?)<\/verse>/g
  for (const m of xml.matchAll(verse)) {
    if (!codes.has(m[1])) continue
    const text = m[4]
      .replace(/<note[\s\S]*?<\/note>/g, '')
      .replace(/<[^>]+>/g, '')
      .replace(/\[\d+:\d+\]\s*/g, '')
      .replace(/&(\w+);/g, (all, name: string) => ENTITIES[name] ?? all)
      .replace(/\s+/g, ' ')
      .trim()
    put(bible, m[1], +m[2], +m[3], text)
  }
  return finish(bible)
}

const loaded = new Map<string, Promise<Bible>>()

function load(id: 'bsb' | 'sv'): Promise<Bible> {
  let p = loaded.get(id)
  if (!p) {
    p = id === 'bsb' ? getText(BSB_URL).then(parseBsb) : getText(SV_URL).then(parseOsis)
    loaded.set(id, p)
  }
  return p
}

/** A book of the translation: chapters, then verses, in KJV verse numbers. */
export async function bibleBook(id: 'bsb' | 'sv', code: string): Promise<string[][]> {
  const book = (await load(id)).get(code)
  if (!book) throw new Error(`${id.toUpperCase()} has no book ${code}`)
  return book
}
