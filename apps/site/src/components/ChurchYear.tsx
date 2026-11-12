import Image from 'next/image'

import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import calendarImage from '@/images/screens/calendar.png'

const seasons = [
  ['Advent', 'Four Sundays before Christmas. The church waits for the coming of Christ.'],
  ['Christmas and Epiphany', 'The birth of Christ, and his revelation to the nations.'],
  ['Before Lent', 'Septuagesima, Sexagesima and Quinquagesima: three Sundays before Lent.'],
  ['Lent and Holy Week', 'Forty days of repentance, to the death of Christ.'],
  ['Easter and Whitsun', 'The resurrection, the ascension and the gift of the Holy Spirit.'],
  ['Trinity', 'Half the year. The Sundays teach the Christian life.'],
]

export function ChurchYear() {
  return (
    <section
      id="church-year"
      aria-labelledby="church-year-title"
      className="scroll-mt-14 bg-stone-50 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container size="md">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading number="2" id="church-year-title">
              Church year
            </SectionHeading>
            <p className="mt-8 font-display text-4xl font-bold tracking-tight text-stone-900">
              The readings follow the life of Christ through the year.
            </p>
            <p className="mt-4 text-lg tracking-tight text-stone-700">
              Each Sunday has a name, a collect, an Epistle and a Gospel. The
              lessons of the week go with that Sunday. Tap the date in the app to
              see the month, with each Sunday and each feast.
            </p>
            <p className="mt-4 text-lg tracking-tight text-stone-700">
              This is not a plan to read the whole Bible in a year. If you use
              such a plan, Daily Prayer goes well with it.
            </p>
            <dl className="mt-8 space-y-4">
              {seasons.map(([name, text]) => (
                <div key={name}>
                  <dt className="font-medium text-stone-900">{name}</dt>
                  <dd className="text-sm text-stone-600">{text}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="mx-auto w-64 overflow-hidden rounded-3xl shadow-xl ring-8 ring-stone-900 md:w-72 lg:mt-20">
            <Image
              src={calendarImage}
              alt="The calendar for November 2026, with each week named after its Sunday"
              className="w-full"
              sizes="18rem"
            />
          </div>
        </div>
      </Container>
    </section>
  )
}
