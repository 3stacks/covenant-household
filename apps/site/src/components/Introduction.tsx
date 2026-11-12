import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'
import { APP_URL } from '@/lib/site'

export function Introduction() {
  return (
    <section
      id="introduction"
      aria-label="Introduction"
      className="pt-20 pb-16 sm:pb-20 md:pt-36 lg:py-32"
    >
      <Container className="text-lg tracking-tight text-stone-700">
        <p className="font-display text-4xl font-bold tracking-tight text-stone-900">
          A daily prayer book in the Reformed tradition, with the full text on
          the page.
        </p>
        <p className="mt-4">
          A daily prayer book gives the psalms, the readings and the prayers for
          each day. Most of these books follow the church year, and many of them
          read from the Apocrypha.
        </p>
        <p className="mt-4">
          Daily Prayer keeps the calendar of the Book of Common Prayer. It reads
          only the canonical Scriptures. You sing the psalm from the Scottish
          Psalter of 1650.
        </p>
        <ul role="list" className="mt-8 space-y-3">
          {[
            'The full text of each psalm and each lesson, in the King James Version',
            'Sing the psalm in Precentor, with the tune in four parts',
            'Read each lesson with the notes of the Self-Interpreting Bible',
            'Add a verse to your memory work in Hearers',
            'Works offline, and installs on your phone like an app',
            'No account, no advertisements, no cookies',
          ].map((feature) => (
            <li key={feature} className="flex">
              <CheckIcon className="h-8 w-8 flex-none fill-brand-500" />
              <span className="ml-4">{feature}</span>
            </li>
          ))}
        </ul>
        <p className="mt-10">
          <a
            href={APP_URL}
            className="text-base font-medium text-brand-600 hover:text-brand-800"
          >
            Read today’s page <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
      </Container>
    </section>
  )
}
