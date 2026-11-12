// Book names as other sources write them, mapped to OSIS codes.

import { BOOKS } from './books.ts'

/** The books of the Apocrypha. WCF 1.3: they "are no part of the canon of the Scripture". */
const APOCRYPHA: Record<string, string> = {
  Wisdom: 'Wis',
  'Wisdom of Solomon': 'Wis',
  Sirach: 'Sir',
  Ecclesiasticus: 'Sir',
  Baruch: 'Bar',
  Tobit: 'Tob',
  Judith: 'Jdt',
  '1 Maccabees': '1Macc',
  '2 Maccabees': '2Macc',
  '1 Esdras': '1Esd',
  '2 Esdras': '2Esd',
  'Prayer of Manasseh': 'PrMan',
  'Song of Three Youths': 'SgThree',
  'Song of the Three Young Men': 'SgThree',
  Susanna: 'Sus',
  'Bel and the Dragon': 'Bel',
}

const APOCRYPHA_CODES = new Set(Object.values(APOCRYPHA))

const OTHER_NAMES: Record<string, string> = {
  Psalm: 'Ps',
  'Song of Songs': 'Song',
  Canticles: 'Song',
}

const byName = new Map<string, string>()
for (const b of BOOKS) byName.set(b.name.toLowerCase(), b.code)
for (const [name, code] of Object.entries({ ...OTHER_NAMES, ...APOCRYPHA })) byName.set(name.toLowerCase(), code)

export const bookFromName = (name: string): string | undefined => byName.get(name.trim().replace(/\s+/g, ' ').toLowerCase())

const NT_START = BOOKS.findIndex((b) => b.code === 'Matt')
const NT_CODES = new Set(BOOKS.slice(NT_START).map((b) => b.code))

const codeOf = (passage: string) => passage.split('.')[0]

export const isNewTestament = (passage: string) => NT_CODES.has(codeOf(passage))
export const isApocrypha = (passage: string) => APOCRYPHA_CODES.has(codeOf(passage))
