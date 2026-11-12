// The 66 books of the Bible: OSIS code, name, Haddington Bible URL slug, and
// number of chapters. The codes and slugs come from the Haddington Bible book
// list, so links to haddingtonbible.org match its pages.

export interface Book {
  code: string
  name: string
  slug: string
  chapters: number
}

const ROWS: [string, string, string, number][] = [
  ['Gen', 'Genesis', 'genesis', 50],
  ['Exod', 'Exodus', 'exodus', 40],
  ['Lev', 'Leviticus', 'leviticus', 27],
  ['Num', 'Numbers', 'numbers', 36],
  ['Deut', 'Deuteronomy', 'deuteronomy', 34],
  ['Josh', 'Joshua', 'joshua', 24],
  ['Judg', 'Judges', 'judges', 21],
  ['Ruth', 'Ruth', 'ruth', 4],
  ['1Sam', '1 Samuel', '1-samuel', 31],
  ['2Sam', '2 Samuel', '2-samuel', 24],
  ['1Kgs', '1 Kings', '1-kings', 22],
  ['2Kgs', '2 Kings', '2-kings', 25],
  ['1Chr', '1 Chronicles', '1-chronicles', 29],
  ['2Chr', '2 Chronicles', '2-chronicles', 36],
  ['Ezra', 'Ezra', 'ezra', 10],
  ['Neh', 'Nehemiah', 'nehemiah', 13],
  ['Esth', 'Esther', 'esther', 10],
  ['Job', 'Job', 'job', 42],
  ['Ps', 'Psalms', 'psalms', 150],
  ['Prov', 'Proverbs', 'proverbs', 31],
  ['Eccl', 'Ecclesiastes', 'ecclesiastes', 12],
  ['Song', 'Song of Solomon', 'song-of-solomon', 8],
  ['Isa', 'Isaiah', 'isaiah', 66],
  ['Jer', 'Jeremiah', 'jeremiah', 52],
  ['Lam', 'Lamentations', 'lamentations', 5],
  ['Ezek', 'Ezekiel', 'ezekiel', 48],
  ['Dan', 'Daniel', 'daniel', 12],
  ['Hos', 'Hosea', 'hosea', 14],
  ['Joel', 'Joel', 'joel', 3],
  ['Amos', 'Amos', 'amos', 9],
  ['Obad', 'Obadiah', 'obadiah', 1],
  ['Jonah', 'Jonah', 'jonah', 4],
  ['Mic', 'Micah', 'micah', 7],
  ['Nah', 'Nahum', 'nahum', 3],
  ['Hab', 'Habakkuk', 'habakkuk', 3],
  ['Zeph', 'Zephaniah', 'zephaniah', 3],
  ['Hag', 'Haggai', 'haggai', 2],
  ['Zech', 'Zechariah', 'zechariah', 14],
  ['Mal', 'Malachi', 'malachi', 4],
  ['Matt', 'Matthew', 'matthew', 28],
  ['Mark', 'Mark', 'mark', 16],
  ['Luke', 'Luke', 'luke', 24],
  ['John', 'John', 'john', 21],
  ['Acts', 'Acts', 'acts', 28],
  ['Rom', 'Romans', 'romans', 16],
  ['1Cor', '1 Corinthians', '1-corinthians', 16],
  ['2Cor', '2 Corinthians', '2-corinthians', 13],
  ['Gal', 'Galatians', 'galatians', 6],
  ['Eph', 'Ephesians', 'ephesians', 6],
  ['Phil', 'Philippians', 'philippians', 4],
  ['Col', 'Colossians', 'colossians', 4],
  ['1Thess', '1 Thessalonians', '1-thessalonians', 5],
  ['2Thess', '2 Thessalonians', '2-thessalonians', 3],
  ['1Tim', '1 Timothy', '1-timothy', 6],
  ['2Tim', '2 Timothy', '2-timothy', 4],
  ['Titus', 'Titus', 'titus', 3],
  ['Phlm', 'Philemon', 'philemon', 1],
  ['Heb', 'Hebrews', 'hebrews', 13],
  ['Jas', 'James', 'james', 5],
  ['1Pet', '1 Peter', '1-peter', 5],
  ['2Pet', '2 Peter', '2-peter', 3],
  ['1John', '1 John', '1-john', 5],
  ['2John', '2 John', '2-john', 1],
  ['3John', '3 John', '3-john', 1],
  ['Jude', 'Jude', 'jude', 1],
  ['Rev', 'Revelation', 'revelation', 22],
]

export const BOOKS: Book[] = ROWS.map(([code, name, slug, chapters]) => ({ code, name, slug, chapters }))

const byCode = new Map(BOOKS.map((b) => [b.code, b]))

export const bookByCode = (code: string): Book | undefined => byCode.get(code)
