// Links into the other apps in the suite.

import { parsePassage } from './passage.ts'
import type { ConfessionDoc, PassageId, PsalmPortion } from './types.ts'

export const PRECENTOR = 'https://precentor.app'
export const HEARERS_APP = 'https://hearers.app/app/'
export const HADDINGTON = 'https://haddingtonbible.org'

/** The Precentor key for a psalm: 23 → "023", the second version → "023b". */
export const precentorKey = (p: PsalmPortion) => `${String(p.psalm).padStart(3, '0')}${p.secondVersion ? 'b' : ''}`

/** Sing the psalm in Precentor. */
export const singPsalm = (p: PsalmPortion) => `${PRECENTOR}/#/psalm/${precentorKey(p)}`

/** The passage as a Hearers passage id: a whole psalm, or a range of verses. */
export const psalmPassage = (p: PsalmPortion): PassageId =>
  p.verses ? `Ps.${p.psalm}.${p.verses[0]}-${p.verses[1]}` : `Ps.${p.psalm}`

/** Read the passage with John Brown's notes, at the first verse. */
export function readInHaddington(id: PassageId): string | undefined {
  const p = parsePassage(id)
  if (!p) return undefined
  const page = `${HADDINGTON}/${p.book.slug}-${p.c1}`
  return p.v1 ? `${page}#v${p.c1}-${p.v1}` : page
}

/** Add the passage to "My verses" in Hearers. */
export const memoriseInHearers = (id: PassageId) => `${HEARERS_APP}#/add/${id}`

/** Open a confession section or a catechism question in Hearers. */
export const learnInHearers = (doc: ConfessionDoc, unitId: string) => `${HEARERS_APP}#/unit/${doc}/${unitId}`

export const KOFI = 'https://ko-fi.com/lukeboyle'
