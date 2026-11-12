# Covenant Household

A Reformed daily prayer book for family worship. "As for me and my house, we will serve the LORD" (Joshua 24:15).

Each day has the psalms, two Bible lessons, the collect, and on Sundays and feasts the Epistle and
Gospel. It can also have a proverb, a Reformed writing, a hymn, a prayer and a part of the confession. Each part links to the
other apps in the suite:

| Link | App |
| --- | --- |
| Sing the psalm | [Precentor](https://precentor.app) |
| Read a passage with John Brown's notes | [Haddington Bible](https://haddingtonbible.org) |
| Memorise a passage, or learn a confession section | [Hearers](https://hearers.app) |

## Layout

| Folder | What it holds |
| --- | --- |
| `content/` | The lectionary, the devotions and the commemorations, as JSON |
| `scripts/` | The importers, the seed scripts and the calendar build |
| `packages/core/` | The code that the apps share: the church year, the data model, the checks, the loaders and the links |
| `apps/web/` | The web app, a PWA made with Vite and React |
| `apps/mobile/` | The iOS and Android app, made with Expo (React Native) |
| `apps/site/` | The homepage, made with Next.js |

Each app has its own `package.json` and `node_modules`. The apps get the shared code from
`packages/core` through a `file:` dependency. The shared code has no dependencies.

## Run

The apps need Node 24.

```bash
npm run install:all   # install the root and each app
npm run dev           # the web app, on http://localhost:5181
npm run mobile        # the mobile app, in Expo Go or a simulator
npm test
npm run build         # the web app. Sample text is allowed.
npm run build:release # the web app. Leaves out each file that is not cleared.
npm run site          # the homepage and the web app, in apps/site/out/
```

`npm run calendar` checks the content and writes the calendar of each app:

- `apps/web/public/calendar/`: the web app fetches each file.
- `apps/mobile/calendar/`: the mobile app has each file in its bundle, so it works with no
  connection. `calendar/files.ts` maps each path to a `require()`.

Git does not keep these folders. Read `apps/mobile/README.md` to build the mobile app for the
App Store and Google Play.

## The homepage

The homepage is in `apps/site/`. Next.js builds a static export of it. The `npm run site`
command builds the release web app into `apps/site/out/app/`. The homepage links to the web app
at `/app/`. Read `apps/site/README.md` for more.

A release build leaves out each devotions file and each commemoration file that contains sample
text. The build shows a warning for each file that it leaves out.

## The church year and the lectionary

The readings follow the church year of the 1662 Book of Common Prayer. `packages/core/src/churchYear.ts` maps
each date to a day of that year, for example "Wednesday after the Second Sunday in Advent"
(`advent-2-3`). Each part of the page comes from one source:

| Part | Source | File |
| --- | --- | --- |
| Psalms | The 1662 order, by day of the month, sung from the 1650 Psalter | `content/lectionary/psalter-1662.json` |
| Old and New Testament lessons | The Revised Tables of Lessons (1922) | `content/lectionary/1922.json` |
| Collect, Epistle and Gospel | The Book of Common Prayer (1662) | `content/lectionary/1662.json` |
| Proverb, writing, hymn, prayer, confession | This app | `content/devotions/<church-year id>.json` |
| Commemoration | This app | `content/commemorations/MM-DD.json` |

The morning lessons and psalms are the main readings. The page shows the evening lessons and psalms
closed, below them. The collect of a Sunday or a feast serves the days after it. A saint's day on a
weekday takes its own collect, Epistle and Gospel.

### Import the lectionary

The three lectionary files come from the transcription of the 1662 Prayer Book by Lynda Howell
(http://www.eskimo.com/~lhowell/bcp1662/). The 1922 tables are in the public domain. In the United
Kingdom the Crown holds the rights in the 1662 text. Outside the United Kingdom it is in the public
domain.

```bash
npm run import     # writes content/lectionary/*.json
```

The importers keep the downloaded pages in `.cache/`. They correct a few typing errors in the
transcription. `scripts/import-1922.ts` lists each correction with its reason.

### The Apocrypha

On 83 weekday lessons the 1922 table appoints a lesson from the Apocrypha. The Apocrypha is not part
of the canon of Scripture (Westminster Confession 1.3). The app reads a canonical lesson in its place.
The page shows the canonical lesson, with a note that gives the Apocrypha reference.

`content/lectionary/apocrypha-1922.json` gives each canonical lesson. Each group of lessons comes from
the book that the Apocrypha book copies or describes, and the file gives the reason for each group.
Where possible, a group uses chapters that the 1922 table does not read. Most of these lessons are in
the weeks after the Fifteenth, Sixteenth and Twenty-third to Twenty-sixth Sundays after Trinity, and
in the week before Advent.

`scripts/import-1922.ts` puts the canonical lessons into `1922.json`. If an Apocrypha lesson has no
canonical lesson in the file, the script reports a problem. If the file names a day that has no
Apocrypha lesson, the script also reports a problem.

### Known gaps

- The 1922 lessons for the saints' days (Part X of the table) are not imported.

## The parts of a devotions file

Each part is optional. The page shows the parts in this order:

| Part | Field | Notes |
| --- | --- | --- |
| Proverb | `proverb` | A passage in Proverbs, with an optional note. |
| Writing | `writing` | An extract from a Reformed writer on the topic of the day. |
| Hymn | `hymn` | The words, or a hymnal and number when the words are under copyright. |
| Prayer | `prayer` | A prayer after the collect. |
| Confession | `confession` | A document and a list of Hearers unit ids. |

`packages/core/src/types.ts` gives the full type of each field. `packages/core/src/validate.ts` checks each file.

## The text of the readings

The build adds the text of each reading. It takes the text from the published data of the other
apps, so the ids always match the links:

| Text | Source | Licence |
| --- | --- | --- |
| Bible (KJV) | `https://hearers.app/app/data/kjv/` | Public domain |
| Confessions and catechisms | `https://hearers.app/app/data/docs/` | See the note below |
| 1650 Psalter | `https://precentor.app/corpus/psalms/` | Public domain text, CC0 transcription |

The build keeps a copy of each download in `.cache/sources/`. Use `--offline` to build from that copy
only.

The Heidelberg Catechism and Belgic Confession texts in Hearers look like modern translations under
copyright. The release build rejects a day that uses them. Hearers must replace them first.

## Formats

### Passages

A passage uses the Hearers passage format, with an OSIS book code:

| Passage | Meaning |
| --- | --- |
| `Ps.23` | Psalm 23 |
| `Rom.8.28-30` | Romans 8:28–30 |
| `Gen.1.1-2.3` | Genesis 1:1–2:3 |
| `Heb.8-10` | Hebrews 8–10 |

`packages/core/src/books.ts` lists the codes.

### Confession units

Use the Hearers unit ids: `wcf-1.1`, `wlc-1`, `wsc-1`, `hc-1`, `bc-1`, `dort-1-a1`. Heads III and IV of
the Canons of Dort are one head: `dort-3-4-a1`.

### Sources and licences

Each lectionary, writing, hymn and prayer has a `source` with a `licence`:

- `public-domain`
- `CC0`
- `CC-BY-4.0`
- `permission`, when the owner gives written permission
- `sample`, for text that only shows the layout

The page marks sample text. The release build leaves out each file that contains sample text.

## The seeded content

Run `npm run seed` to write the reading plans into `content/devotions/`. The command keeps the
other parts of each file. It gives the same result each time.

Some church-year days do not occur every year. For example, the Sixth Sunday after the Epiphany
occurs in about one year in sixteen. The plans put the main readings on the 315 days that occur
every year. Then a short year loses no part of them.

| Days | Confession | Proverb |
| --- | --- | --- |
| Sundays that occur every year | The Shorter Catechism, all 107 questions | Two verses |
| Weekdays that occur every year | The Westminster Confession, then the Canons of Dort | Two verses |
| Holy Week, Monday to Friday | The Larger Catechism, questions 46 to 50 | Two verses |
| Other days | The Larger Catechism, in order | None |

The proverbs start at Proverbs 10:1 and continue in order.

`scripts/import-ryle.ts` adds a writing to each day with a Gospel from St. Matthew. The writing is
the section of J. C. Ryle, *Expository Thoughts on the Gospels* (1856), on that Gospel. The text
comes from the edition of the Christian Classics Ethereal Library, which marks it public domain.
That edition has no section for Matthew 22:34-46, so the Eighteenth Sunday after Trinity has no
writing.

`content/commemorations/` holds 47 people. Each file gives the name, the years and a short title.
No file has a writing yet.

## Content to source

1. Writings for the other days. Ryle on Mark, Luke and John exists only as scans of the 1857
   edition on the Internet Archive. Their text needs a check against the scans before use. Record
   the original edition of each extract, because a modern edition can have its own copyright.
2. Hymns: an open Reformed hymnal. The words of *Rejoice!* are under copyright, so the app can give
   only the number from that book.
3. Prayers: for example Matthew Henry, *A Method for Prayer* (1710).
4. Commemorations: a public-domain account of each person.

The research report `research/2026-11-09-landscape-reformed-suite-app-gaps.md` in the personal
workspace lists possible sources.

## License

Copyright © 2026 Luke Boyle.

Licensed under the **GNU Affero General Public License v3.0** (AGPLv3). See [LICENSE](LICENSE). You
can use, self-host, study, change and share Covenant Household. If you run a changed version as a network
service, you must give its users the source of that version. See AGPL section 13.

The texts in the calendar keep their own licences. The section "The text of the readings" gives the
source of each text.
