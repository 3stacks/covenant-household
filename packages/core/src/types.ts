// The data model.
//
// A date maps to a day of the church year (churchYear.ts). Each part of the page
// comes from one source:
//   lessons        the Revised Tables of Lessons (1922)   content/lectionary/1922.json
//   collect, Epistle and Gospel   the 1662 Prayer Book   content/lectionary/1662.json
//   psalms         the 1662 order, by day of the month    content/lectionary/psalter-1662.json
//   devotions      the proverb, writing, hymn, prayer and confession that this app
//                  adds, by church-year id                content/devotions/<id>.json
//   commemorations a person that the church remembers    content/commemorations/MM-DD.json
//
// scripts/build-calendar.ts checks the content, adds the text of each reading,
// and writes public/calendar/.

/**
 * A Bible passage in the Hearers passage format, so a reading can open in
 * Hearers without a conversion:
 *   "Ps.23"          a whole chapter
 *   "Rom.8.28-30"    verses in one chapter
 *   "Gen.1.1-2.3"    verses across chapters
 *   "Heb.8-10"       whole chapters
 * The book is an OSIS code (see books.ts).
 */
export type PassageId = string

/** A calendar key: "MM-DD", for example "11-10". */
export type DateKey = string

/**
 * What this app adds to a church-year day. Each part is optional. The order of
 * the fields is the order of the page.
 */
export interface Devotions {
  /** The church-year id (see churchYear.ts). It must be the same as the file name. */
  id: string
  /** A proverb that relates to the lessons or to the writing. */
  proverb?: ProverbReading
  /** A writing from the Reformed tradition on the topic of the day. */
  writing?: Writing
  hymn?: Hymn
  /** A prayer for the day, after the collect. */
  prayer?: Prayer
  /** A reading from the Westminster Standards or the Three Forms of Unity. */
  confession?: ConfessionReading
}

/** A person that the church remembers on a fixed date. */
export interface Commemoration {
  /** "MM-DD". It must be the same as the file name. */
  date: DateKey
  /** A stable id, for example "john-knox". The same person keeps the same id each year. */
  id: string
  name: string
  /** For example "1514–1572". */
  years?: string
  /** A short description, for example "Reformer of Scotland". */
  title?: string
  /** A writing about the person. The page shows it after the confession reading. */
  writing?: Writing
}

/** A psalm, or a part of a psalm, from the 1650 Scottish Psalter. */
export interface PsalmPortion {
  psalm: number
  /** The second version in the 1650 Psalter, for psalms that have two. */
  secondVersion?: boolean
  /** First and last verse. No range means the whole psalm. */
  verses?: [number, number]
}

export interface ProverbReading {
  /** Must be a passage in Proverbs. */
  passage: PassageId
  /** One sentence on how the proverb relates to the day. */
  note?: string
}

/** A paragraph of plain text. Blank lines are not used. */
export type Paragraph = string

export interface Writing {
  /** The heading on the page. */
  title: string
  author: string
  /** The book, sermon or letter that the extract comes from. */
  work: string
  year?: string
  /** The topic, for example "Assurance". */
  topic?: string
  text: Paragraph[]
  source: Source
}

export interface Hymn {
  title: string
  author?: string
  tune?: string
  /** For example "8.6.8.6". */
  metre?: string
  /** The hymn in a printed hymnal, for example Rejoice! number 123. */
  hymnal?: { name: string; number: number }
  /**
   * The words, as stanzas of lines. Leave this out when the words are under
   * copyright. The page then shows the hymnal and number only.
   */
  stanzas?: string[][]
  source: Source
}

export interface Prayer {
  title?: string
  text: Paragraph[]
  source: Source
}

/** The documents that Hearers holds. The ids are the Hearers document ids. */
export type ConfessionDoc = 'wcf' | 'wlc' | 'wsc' | 'hc' | 'bc' | 'dort'

export interface ConfessionReading {
  doc: ConfessionDoc
  /** Hearers unit ids, in order. For example ["wcf-1.1", "wcf-1.2"]. */
  units: string[]
}

export interface Source {
  /** For example "The Works of John Owen, vol. 6 (Goold, 1851)". */
  name: string
  url?: string
  licence: Licence
  /** A note on the licence, for example a limit in one country. */
  note?: string
}

/**
 * "sample" marks text that only shows the layout. The release build rejects
 * a day that contains sample text.
 */
export type Licence = 'public-domain' | 'CC0' | 'CC-BY-4.0' | 'permission' | 'sample'

// The text that the build adds.

export interface VerseText {
  chapter: number
  verse: number
  text: string
}

export interface PassageText {
  passage: PassageId
  verses: VerseText[]
}

export interface PsalmStanza {
  number: number
  /** The Bible verses that the stanza covers. */
  verses: number[]
  lines: string[]
}

export interface PsalmText {
  stanzas: PsalmStanza[]
}

export interface ConfessionUnitText {
  id: string
  /** For example "1.1" or "Q. 1". */
  ref: string
  /** The question, or the article title. */
  prompt?: string
  text: string
}

/** A lesson as the app loads it. */
export interface LessonText {
  /** The parts of the lesson, with their text. Empty for an Apocrypha lesson. */
  parts: PassageText[]
  /** For a lesson that the table appoints from the Apocrypha: its reference. */
  apocrypha?: string
}

/** public/calendar/lessons/<id>.json */
export interface LessonsFile {
  id: string
  label: string
  morning?: { first: LessonText; second: LessonText }
  evening?: { first: LessonText; second: LessonText }
}

/** public/calendar/collects/<id>.json */
export interface CollectsFile {
  id: string
  title: string
  collects?: string[]
  epistle?: PassageText
  gospel?: PassageText
}

export interface PsalmReading {
  portion: PsalmPortion
  text: PsalmText
}

/** public/calendar/psalter/<day>.json, for days 1 to 30 */
export interface PsalterFile {
  day: number
  morning: PsalmReading[]
  evening: PsalmReading[]
}

/** public/calendar/devotions/<id>.json */
export interface DevotionsFile extends Devotions {
  texts: { proverb?: PassageText; confession?: ConfessionUnitText[] }
}

/** public/calendar/index.json */
export interface CalendarIndex {
  lessons: string[]
  collects: string[]
  devotions: string[]
  commemorations: DateKey[]
  /** The sources, for the credits on the page. */
  sources: { lessons: Source; collects: Source; psalter: Source }
}

// A lectionary: the lessons for each church-year day.

export interface Lesson {
  /** The passages of the lesson. Most lessons have one. "Genesis 19:1-3, 12-29" has two. */
  passages: PassageId[]
  /** The "or" lessons that the table also allows. */
  alternatives: PassageId[][]
  /**
   * The table appoints a lesson from the Apocrypha here, for example "Ecclesiasticus 2".
   * The app does not read the Apocrypha (WCF 1.3). When the table gives a canonical
   * "or" lesson, `passages` holds it. Otherwise `passages` is empty.
   */
  apocrypha?: string
}

export interface OfficeLessons {
  /** The first lesson: Old Testament (or Apocrypha). */
  first: Lesson
  /** The second lesson: New Testament. */
  second: Lesson
}

export interface LessonDay {
  /** The label in the source table, for example "Advent Sunday" or "Tuesday". */
  label: string
  morning?: OfficeLessons
  evening?: OfficeLessons
  /** A note from the importer, for example on a correction. */
  note?: string
}

export interface Lectionary {
  name: string
  source: Source
  /** The lessons by church-year id (see churchYear.ts). */
  days: Record<string, LessonDay>
}

/** The Collect, Epistle and Gospel of one day in the 1662 Book of Common Prayer. */
export interface CollectDay {
  /** The heading in the book, for example "The First Sunday of Advent." */
  title: string
  /** Most days have one collect. Good Friday has three. */
  collects?: string[]
  epistle?: PassageId
  gospel?: PassageId
}

export interface Collects {
  name: string
  source: Source
  /** By church-year id for the Sundays and feasts, and "holy-MM-DD" for the saints' days. */
  days: Record<string, CollectDay>
}

/** The psalms for each day of the month, at Morning and Evening Prayer. */
export interface Psalter {
  name: string
  source: Source
  /** By day of the month, "1" to "30". The 31st day repeats the 30th. */
  days: Record<string, { morning: PsalmPortion[]; evening: PsalmPortion[] }>
}
