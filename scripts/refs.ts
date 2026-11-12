// Reads a Bible reference as the 1922 transcription writes it, and returns
// passage ids (src/data/types.ts). One reference can have more than one part:
// "Genesis 19:1-3;12-29" gives ["Gen.19.1-3", "Gen.19.12-29"].
//
// The forms in the transcription:
//   "Isaiah 1:1-20"          verses
//   "Isaiah 5:18"            from verse 18 to the end of the chapter (the table style)
//   "Genesis 25:19-999"      999 is the end of the chapter
//   "Isaiah 2", "Isaiah 2:"  a chapter
//   "Jude", "Philemon"       a book of one chapter
//   "Esther 6;7"             two chapters
//   "Daniel 7:9-10;13-14"    two verse ranges in one chapter
//   "Ezra 1:1-8;3"           a verse range, then a chapter
// It also corrects the typing errors that occur: "Acts 7:35-8.4", "Acts:27:1-26",
// "Philippians1", "2Peter 1", "Colossians 1:21-2:1-7", "2 Corinthians 2:12-3-999".

import { bookFromName } from '../packages/core/src/bookNames.ts'
import { bookByCode } from '../packages/core/src/books.ts'

/** The number of verses in a chapter, or undefined when it is not known (the Apocrypha). */
export type VerseCount = (code: string, chapter: number) => number | undefined

const ABBREVIATIONS: Record<string, string> = {
  Gen: 'Genesis', Exod: 'Exodus', Ex: 'Exodus', Lev: 'Leviticus', Num: 'Numbers', Deut: 'Deuteronomy', Josh: 'Joshua',
  Judg: 'Judges', Sam: 'Samuel', Kgs: 'Kings', Chron: 'Chronicles', Neh: 'Nehemiah', Esth: 'Esther', Ps: 'Psalm',
  Prov: 'Proverbs', Eccles: 'Ecclesiastes', Eccl: 'Ecclesiastes', Isa: 'Isaiah', Jer: 'Jeremiah', Lam: 'Lamentations',
  Ezek: 'Ezekiel', Dan: 'Daniel', Hos: 'Hosea', Obad: 'Obadiah', Mic: 'Micah', Nah: 'Nahum', Hab: 'Habakkuk',
  Zeph: 'Zephaniah', Hag: 'Haggai', Zech: 'Zechariah', Mal: 'Malachi', Matt: 'Matthew', Mk: 'Mark', Lk: 'Luke',
  Jn: 'John', Rom: 'Romans', Cor: 'Corinthians', Gal: 'Galatians', Eph: 'Ephesians', Phil: 'Philippians',
  Col: 'Colossians', Thess: 'Thessalonians', Tim: 'Timothy', Tit: 'Titus', Philem: 'Philemon', Heb: 'Hebrews',
  Jas: 'James', Pet: 'Peter', Rev: 'Revelation', Wisd: 'Wisdom', Ecclus: 'Ecclesiasticus', Macc: 'Maccabees',
  Tob: 'Tobit', Bar: 'Baruch',
}

function normalise(text: string): string {
  let s = text.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim()
  s = s.replace(/(\d)\.(\d)/g, '$1:$2') // "8.4" → "8:4"
  s = s.replace(/^([1-4]?\s?[A-Za-z][A-Za-z. ]*?):(\d)/, '$1 $2') // "Acts:27" → "Acts 27"
  s = s.replace(/^([1-4])([A-Za-z])/, '$1 $2') // "2Peter" → "2 Peter"
  s = s.replace(/([A-Za-z])(\d)/, '$1 $2') // "Philippians1" → "Philippians 1"
  s = s.replace(/(\d+):(\d+)-(\d+):(\d+)-(\d+)$/, '$1:$2-$3:$5') // "1:21-2:1-7" → "1:21-2:7"
  s = s.replace(/(\d+):(\d+)-(\d+)-999$/, '$1:$2-$3:999') // "2:12-3-999" → "2:12-3:999"
  return s
}

function bookCode(name: string): string | undefined {
  const clean = name.replace(/\./g, '').trim()
  const direct = bookFromName(clean)
  if (direct) return direct
  const m = clean.match(/^([1-4] )?(\w+)$/)
  if (!m) return undefined
  const full = ABBREVIATIONS[m[2]]
  return full ? bookFromName(`${m[1] ?? ''}${full}`) : undefined
}

export function parseReference(text: string, verses: VerseCount): string[] | undefined {
  const s = normalise(text)
  const m = s.match(/^((?:[1-4] )?[A-Za-z][A-Za-z. ]*?)\s*(\d.*)?$/)
  if (!m) return undefined
  const code = bookCode(m[1])
  if (!code) return undefined
  const rest = (m[2] ?? '').replace(/\s/g, '').replace(/:$/, '')

  // A book of one chapter, with no chapter number.
  if (!rest) return bookByCode(code)?.chapters === 1 ? [`${code}.1`] : undefined

  const end = (c: number) => verses(code, c)
  const out: string[] = []
  let chapter = 0
  let lastWasVerses = false
  let lastEnd = 0
  const parts = rest.split(';').filter(Boolean)

  for (let i = 0; i < parts.length; i++) {
    // A later part can repeat the book: "Deuteronomy 32:48-999;Deuteronomy 34".
    const part = parts[i].replace(/^[1-4]?[A-Za-z.]+/, '').replace(/:$/, '')
    const next = parts[i + 1]
    let r: RegExpMatchArray | null

    if ((r = part.match(/^(\d+)-(\d+):(\d+)$/))) {
      // c1-c2:v2, for example "Galatians 4-5:1"
      const [c1, c2, v2] = [+r[1], +r[2], +r[3]]
      out.push(`${code}.${c1}.1-${c2}.${v2}`)
      ;[chapter, lastEnd, lastWasVerses] = [c2, v2, true]
    } else if ((r = part.match(/^(\d+):(\d+)-(\d+):(\d+)$/))) {
      // c1:v1-c2:v2
      const [c1, v1, c2] = [+r[1], +r[2], +r[3]]
      const v2 = +r[4] === 999 ? end(c2) : +r[4]
      if (!v2) return undefined
      out.push(`${code}.${c1}.${v1}-${c2}.${v2}`)
      ;[chapter, lastEnd, lastWasVerses] = [c2, v2, true]
    } else if ((r = part.match(/^(\d+):(\d+)(?:-(\d+))?$/))) {
      // c:v or c:v-v2
      const [c, v1] = [+r[1], +r[2]]
      let v2: number | undefined
      if (r[3] && +r[3] < v1 && +r[3] > c) {
        // "3:13-4" is from 3:13 to the end of chapter 4.
        const c2 = +r[3]
        const last = end(c2)
        if (!last) return undefined
        out.push(`${code}.${c}.${v1}-${c2}.${last}`)
        ;[chapter, lastEnd, lastWasVerses] = [c2, last, true]
        continue
      }
      if (r[3]) v2 = +r[3] === 999 ? end(c) : +r[3]
      else {
        // A start verse alone runs to the end of the chapter, unless the next
        // part is more verses in the same chapter.
        const nextIsVerses = next !== undefined && /^\d+(-\d+)?$/.test(next) && +next.split('-')[0] > v1
        v2 = nextIsVerses ? v1 : end(c)
      }
      if (!v2) return undefined
      out.push(v2 === v1 ? `${code}.${c}.${v1}` : `${code}.${c}.${v1}-${v2}`)
      ;[chapter, lastEnd, lastWasVerses] = [c, v2, true]
    } else if ((r = part.match(/^(\d+)(?:-(\d+))?$/))) {
      const [a, b] = [+r[1], r[2] ? +r[2] : undefined]
      if (lastWasVerses && a > lastEnd) {
        // More verses in the same chapter.
        const v2 = b === undefined ? (next === undefined ? end(chapter) : a) : b === 999 ? end(chapter) : b
        if (!v2) return undefined
        out.push(v2 === a ? `${code}.${chapter}.${a}` : `${code}.${chapter}.${a}-${v2}`)
        lastEnd = v2
      } else {
        // Chapters.
        out.push(b && b !== a ? `${code}.${a}-${b}` : `${code}.${a}`)
        ;[chapter, lastWasVerses] = [b ?? a, false]
      }
    } else return undefined
  }
  return out
}
