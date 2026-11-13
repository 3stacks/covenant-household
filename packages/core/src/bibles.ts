// The Bible translations that a reader can choose. Each one is public domain.
// The calendar has a copy of each reading in each translation:
//   kjv   the files at the root of the calendar
//   other bible/<id>/lessons/, bible/<id>/collects/ and bible/<id>/devotions/

import { bookByCode } from './books.ts'
import { parsePassage } from './passage.ts'
import type { PassageId } from './types.ts'

export type BibleId = 'kjv' | 'bsb' | 'sv'
export type Language = 'en' | 'nl'

export interface Bible {
  id: BibleId
  abbr: string
  name: string
  language: Language
  /** One or two sentences for the choice of Bible, in the language of the Bible. */
  blurb: string
  /** The source and the licence, for the About page. */
  source: { name: string; url: string; licence: string }
}

export const BIBLES: Bible[] = [
  {
    id: 'kjv',
    abbr: 'KJV',
    name: 'King James Version',
    language: 'en',
    blurb: 'The Authorised Version of 1611, in the text of 1769. For three hundred years it was the Bible of the English-speaking Reformed churches.',
    source: { name: 'King James Version (1769 text), from Hearers', url: 'https://hearers.app', licence: 'Public domain. In the United Kingdom the Crown holds the rights.' },
  },
  {
    id: 'bsb',
    abbr: 'BSB',
    name: 'Berean Standard Bible',
    language: 'en',
    blurb: 'A modern translation in plain English, from the Hebrew and Greek texts that most modern translations use.',
    source: { name: 'The Holy Bible, Berean Standard Bible, BSB', url: 'https://berean.bible', licence: 'Dedicated to the public domain on 30 April 2023.' },
  },
  {
    id: 'sv',
    abbr: 'SV',
    name: 'Statenvertaling',
    language: 'nl',
    blurb: 'De vertaling van 1637, op last van de Synode van Dordrecht, in de tekst van 1888.',
    source: { name: 'Statenvertaling (1637), the text of the 1888 edition. Transcription by the Isidore Guild.', url: 'https://github.com/Isidore-Guild/statenvertaling', licence: 'Public domain. The transcription is CC0.' },
  },
]

/** The name of each language, in that language. */
export const LANGUAGE_NAMES: Record<Language, string> = { en: 'English', nl: 'Nederlands' }

/** The languages that have a Bible, in the order of BIBLES. */
export const LANGUAGES = [...new Set(BIBLES.map((b) => b.language))]

export const biblesIn = (language: Language) => BIBLES.filter((b) => b.language === language)

/** The text of the welcome, in each language. The rest of the app is in English. */
export const WELCOME_TEXT: Record<Language, { chooseBible: string; note?: string; start: string; back: string }> = {
  en: { chooseBible: 'Choose a Bible', start: 'Start', back: 'Language' },
  nl: {
    chooseBible: 'Kies een bijbelvertaling',
    note: 'De app is in het Engels. De lessen, de Epistel, het Evangelie en de spreuk zijn in de Statenvertaling. De psalmen en de gebeden zijn in het Engels.',
    start: 'Beginnen',
    back: 'Taal',
  },
}

export const DEFAULT_BIBLE: BibleId = 'kjv'

export const bibleById = (id: string): Bible | undefined => BIBLES.find((b) => b.id === id)

/** The folder of the calendar that holds the readings in this translation: "" or "bible/bsb/". */
export const bibleDir = (id: BibleId) => (id === DEFAULT_BIBLE ? '' : `bible/${id}/`)

/** The book names in Dutch, as the Statenvertaling tradition writes them. */
const DUTCH: Record<string, string> = {
  Gen: 'Genesis', Exod: 'Exodus', Lev: 'Leviticus', Num: 'Numeri', Deut: 'Deuteronomium', Josh: 'Jozua',
  Judg: 'Richteren', Ruth: 'Ruth', '1Sam': '1 Samuël', '2Sam': '2 Samuël', '1Kgs': '1 Koningen', '2Kgs': '2 Koningen',
  '1Chr': '1 Kronieken', '2Chr': '2 Kronieken', Ezra: 'Ezra', Neh: 'Nehemia', Esth: 'Esther', Job: 'Job',
  Ps: 'Psalmen', Prov: 'Spreuken', Eccl: 'Prediker', Song: 'Hooglied', Isa: 'Jesaja', Jer: 'Jeremia',
  Lam: 'Klaagliederen', Ezek: 'Ezechiël', Dan: 'Daniël', Hos: 'Hosea', Joel: 'Joël', Amos: 'Amos',
  Obad: 'Obadja', Jonah: 'Jona', Mic: 'Micha', Nah: 'Nahum', Hab: 'Habakuk', Zeph: 'Sefanja', Hag: 'Haggaï',
  Zech: 'Zacharia', Mal: 'Maleachi', Matt: 'Mattheüs', Mark: 'Markus', Luke: 'Lukas', John: 'Johannes',
  Acts: 'Handelingen', Rom: 'Romeinen', '1Cor': '1 Korinthe', '2Cor': '2 Korinthe', Gal: 'Galaten', Eph: 'Efeze',
  Phil: 'Filippenzen', Col: 'Kolossenzen', '1Thess': '1 Thessalonicenzen', '2Thess': '2 Thessalonicenzen',
  '1Tim': '1 Timotheüs', '2Tim': '2 Timotheüs', Titus: 'Titus', Phlm: 'Filemon', Heb: 'Hebreeën', Jas: 'Jakobus',
  '1Pet': '1 Petrus', '2Pet': '2 Petrus', '1John': '1 Johannes', '2John': '2 Johannes', '3John': '3 Johannes',
  Jude: 'Judas', Rev: 'Openbaring',
}

/** "Isaiah 1:1–20" in English, "Jesaja 1:1–20" in Dutch. */
export function passageTitle(id: PassageId, language: Language = 'en'): string {
  const p = parsePassage(id)
  if (!p) return id
  const english = bookByCode(p.book.code)?.name ?? p.book.name
  const book = language === 'nl' ? (p.book.code === 'Ps' && p.c1 === p.c2 ? 'Psalm' : (DUTCH[p.book.code] ?? english)) : p.book.code === 'Ps' && p.c1 === p.c2 ? 'Psalm' : english
  if (p.v1 === 0) return p.c1 === p.c2 ? `${book} ${p.c1}` : `${book} ${p.c1}–${p.c2}`
  if (p.c1 === p.c2) return p.v1 === p.v2 ? `${book} ${p.c1}:${p.v1}` : `${book} ${p.c1}:${p.v1}–${p.v2}`
  return `${book} ${p.c1}:${p.v1}–${p.c2}:${p.v2}`
}
