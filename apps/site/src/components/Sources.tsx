import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'

const sources = [
  ['The lessons', 'The Revised Tables of Lessons (1922), for the Book of Common Prayer.'],
  ['The collects, Epistles and Gospels', 'The Book of Common Prayer (1662).'],
  ['The order of the psalms', 'The Book of Common Prayer (1662). It reads all 150 psalms in a month.'],
  ['The psalms to sing', 'The Scottish Psalter (1650), from the open-1650 data.'],
  ['The Scripture text', 'The King James Version.'],
]

export function Sources() {
  return (
    <section
      id="sources"
      aria-labelledby="sources-title"
      className="scroll-mt-14 bg-stone-50 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="4" id="sources-title">
          Sources
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-stone-900">
          Old texts, which are free to share.
        </p>
        <dl className="mt-8 divide-y divide-stone-200 border-y border-stone-200">
          {sources.map(([what, from]) => (
            <div key={what} className="grid grid-cols-1 gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="font-medium text-stone-900">{what}</dt>
              <dd className="text-stone-600 sm:col-span-2">{from}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-8 text-lg tracking-tight text-stone-700">
          The Prayer Book tables also give lessons from the Apocrypha. The
          Westminster Confession (1.3) says that these books are not part of the
          canon of Scripture. Daily Prayer uses the canonical lesson that the
          tables give in their place. When the tables give no such lesson, the
          page shows a note.
        </p>
      </Container>
    </section>
  )
}
