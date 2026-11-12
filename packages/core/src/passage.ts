import { bookByCode, type Book } from './books.ts'
import type { PassageId } from './types.ts'

/**
 * A parsed passage. A verse of 0 means "the whole chapter".
 * The format is the same as passageFromId in Hearers (src/lib/refs.ts).
 */
export interface Passage {
  book: Book
  c1: number
  v1: number
  c2: number
  v2: number
}

const PATTERN = /^(\w+)\.(\d+)(?:\.(\d+))?(?:-(\d+)(?:\.(\d+))?)?$/

export function parsePassage(id: PassageId): Passage | undefined {
  const m = id.match(PATTERN)
  if (!m) return undefined
  const book = bookByCode(m[1])
  if (!book) return undefined
  const c1 = +m[2]
  const v1 = m[3] ? +m[3] : 0
  let p: Passage
  if (!m[4]) p = { book, c1, v1, c2: c1, v2: v1 }
  else if (!m[3]) p = { book, c1, v1: 0, c2: +m[4], v2: 0 }
  else if (m[5]) p = { book, c1, v1, c2: +m[4], v2: +m[5] }
  else p = { book, c1, v1, c2: c1, v2: +m[4] }
  return isValid(p) ? p : undefined
}

function isValid(p: Passage): boolean {
  const inBook = (c: number) => c >= 1 && c <= p.book.chapters
  if (!inBook(p.c1) || !inBook(p.c2)) return false
  if ((p.v1 === 0) !== (p.v2 === 0)) return false
  if (p.c2 < p.c1) return false
  if (p.c2 === p.c1 && p.v2 < p.v1) return false
  return true
}

/** "Romans 8:28–30", "Genesis 1:1–2:3", "Hebrews 8–10", "Psalm 23". */
export function formatPassage(p: Passage): string {
  const name = p.book.code === 'Ps' && p.c1 === p.c2 ? 'Psalm' : p.book.name
  if (p.v1 === 0) return p.c1 === p.c2 ? `${name} ${p.c1}` : `${name} ${p.c1}–${p.c2}`
  if (p.c1 === p.c2) return p.v1 === p.v2 ? `${name} ${p.c1}:${p.v1}` : `${name} ${p.c1}:${p.v1}–${p.v2}`
  return `${name} ${p.c1}:${p.v1}–${p.c2}:${p.v2}`
}

export function formatPassageId(id: PassageId): string {
  const p = parsePassage(id)
  return p ? formatPassage(p) : id
}
