// The seasons of the church year, for the pages /readings/<season>/.

import type { Season } from '@daily-prayer/core/churchYear'
import { SEASON_NAMES } from '@daily-prayer/core/labels'

import { readingDays, type ReadingDay } from '@/lib/readings'

export interface SeasonInfo {
  slug: Season
  name: string
  /** One sentence for search results. */
  summary: string
  /** The text at the top of the page. */
  intro: string[]
}

const TEXT: Record<Season, { summary: string; intro: string[] }> = {
  advent: {
    summary: 'The four Sundays before Christmas, when the church looks for the coming of Christ.',
    intro: [
      'Advent is the first season of the church year. It has four Sundays. It starts on the Sunday nearest to 30 November.',
      'The lessons tell of the first coming of Christ, and of his second coming to judge the world. The prophet Isaiah gives most of the Old Testament lessons.',
    ],
  },
  christmas: {
    summary: 'The twelve days from the birth of Christ to the eve of the Epiphany.',
    intro: [
      'Christmas Day, 25 December, is the feast of the birth of Christ. The season continues to 5 January.',
      'The lessons tell how the Word became flesh. The days after Christmas also remember Stephen, John and the children of Bethlehem.',
    ],
  },
  epiphany: {
    summary: 'The Epiphany and the Sundays after it, which show the glory of Christ to the nations.',
    intro: [
      'The Epiphany is on 6 January. On that day the church remembers the wise men who came to worship the child Jesus.',
      'The Sundays after the Epiphany show the glory of Christ in his miracles and in his words. A year has one to six of these Sundays. The number changes with the date of Easter.',
    ],
  },
  'pre-lent': {
    summary: 'Septuagesima, Sexagesima and Quinquagesima: the three Sundays before Lent.',
    intro: [
      'Septuagesima, Sexagesima and Quinquagesima are the three Sundays before Lent. In round numbers, their names count down to Easter: seventy, sixty and fifty days.',
      'The lessons start the book of Genesis: the creation, the fall and the flood.',
    ],
  },
  lent: {
    summary: 'The forty days from Ash Wednesday, a season of repentance and faith in Christ.',
    intro: [
      'Lent starts on Ash Wednesday. It has forty days before Easter, without the Sundays.',
      'The lessons call the church to repentance and to faith in Christ. The Gospels show Christ in his temptation and in his conflict with his enemies.',
    ],
  },
  'holy-week': {
    summary: 'The last week before Easter: the entry into Jerusalem, the cross and the grave.',
    intro: [
      'Holy Week starts on the Sunday next before Easter, when Christ came into Jerusalem. It ends on Easter Eve.',
      'Each day reads a part of the account of the last days of Christ. On Good Friday the church reads of his death, and on Easter Eve of his burial.',
    ],
  },
  easter: {
    summary: 'Easter Day to the Sunday after the Ascension: the resurrection and the ascension of Christ.',
    intro: [
      'Easter Day is the feast of the resurrection of Christ. The season continues for six weeks, to the Sunday after Ascension Day.',
      'Ascension Day is forty days after Easter. The three days before it are the Rogation Days, days of prayer for the harvest.',
    ],
  },
  whitsun: {
    summary: 'Whitsunday and its week: the gift of the Holy Spirit at Pentecost.',
    intro: [
      'Whitsunday is fifty days after Easter. It is the feast of the gift of the Holy Spirit at Pentecost.',
      'The lessons of the week tell of the work of the Spirit. The week ends on the eve of Trinity Sunday.',
    ],
  },
  trinity: {
    summary: 'Trinity Sunday and the Sundays after it, which teach the Christian life until Advent.',
    intro: [
      'Trinity Sunday is the Sunday after Whitsunday. The Sundays after Trinity fill about half the year, to Advent. A year has 22 to 27 of these Sundays.',
      'The collects and the Gospels of these Sundays teach the Christian life. The Old Testament lessons follow the history of Israel from Joshua to Nehemiah. Then they read Proverbs.',
    ],
  },
}

export const SEASONS: SeasonInfo[] = (Object.keys(SEASON_NAMES) as Season[]).map((slug) => ({
  slug,
  name: SEASON_NAMES[slug],
  ...TEXT[slug],
}))

export const seasonInfo = (slug: string) => SEASONS.find((s) => s.slug === slug)

export const seasonDays = (slug: Season): ReadingDay[] => readingDays().filter((d) => d.season === slug)

/**
 * The dates of the season in the next years, as runs of days. A run that
 * touches the edge of the three years in the data can be part of a season
 * only, so the list leaves it out.
 */
export function seasonDates(slug: Season): { from: string; to: string }[] {
  const all = readingDays().flatMap((d) => d.dates)
  const first = all.reduce((a, b) => (a < b ? a : b))
  const last = all.reduce((a, b) => (a > b ? a : b))
  const dates = seasonDays(slug)
    .flatMap((d) => d.dates)
    .sort()
  const runs: { from: string; to: string }[] = []
  const next = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number)
    const t = new Date(Date.UTC(y, m - 1, d + 1))
    return t.toISOString().slice(0, 10)
  }
  for (const iso of dates) {
    const run = runs[runs.length - 1]
    if (run && next(run.to) === iso) run.to = iso
    else runs.push({ from: iso, to: iso })
  }
  return runs.filter((r) => r.from !== first && r.to !== last)
}
