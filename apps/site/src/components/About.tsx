import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { SectionHeading } from '@/components/SectionHeading'
import { HEARERS_URL, KOFI_URL, PRECENTOR_URL, SIB_URL } from '@/lib/site'

function CupIcon(props: React.ComponentPropsWithoutRef<'svg'>) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 8h13v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V8Z" />
      <path d="M17 9h1.5a2.5 2.5 0 0 1 0 5H17M8 3v2M12 3v2" />
    </svg>
  )
}

const apps = [
  { name: 'Precentor', href: PRECENTOR_URL, text: 'Sing the Scottish Psalter, with a player that follows each syllable.' },
  { name: 'Hearers', href: HEARERS_URL, text: 'Learn the catechisms, the creeds and Scripture by heart.' },
  { name: 'The Self-Interpreting Bible', href: SIB_URL, text: 'The Bible with the notes of John Brown of Haddington.' },
]

export function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-title"
      className="relative scroll-mt-14 pt-8 pb-3 sm:scroll-mt-32 sm:pt-10 sm:pb-16 lg:pt-16"
    >
      <div className="absolute inset-x-0 top-1/2 bottom-0 mask-[linear-gradient(transparent,white)] text-stone-900/10">
        <GridPattern x="50%" y="100%" />
      </div>
      <div className="relative mx-auto max-w-5xl sm:px-6">
        <div className="bg-stone-50 sm:rounded-6xl">
          <div className="px-4 py-10 sm:px-10 sm:py-16 md:py-20 lg:px-20 lg:py-32">
            <SectionHeading number="5" id="about-title">
              About
            </SectionHeading>
            <p className="mt-8 font-display text-4xl font-extrabold tracking-tight text-pretty text-stone-900 sm:text-6xl">
              <span className="block text-brand-600">Free, and it stays free.</span>{' '}
              No advertisements, no accounts, no cookies.
            </p>
            <p className="mt-4 text-lg tracking-tight text-stone-700">
              Luke Boyle makes Daily Prayer. It is one of a set of free apps for
              the Reformed churches:
            </p>
            <ul role="list" className="mt-6 space-y-4">
              {apps.map((app) => (
                <li key={app.name} className="text-lg tracking-tight text-stone-700">
                  <Link href={app.href} className="font-medium text-brand-600 hover:text-brand-800">
                    {app.name}
                  </Link>
                  . {app.text}
                </li>
              ))}
            </ul>
            <p className="mt-6 text-lg tracking-tight text-stone-700">
              If Daily Prayer helps you, you can support it on Ko-fi. The support
              pays for the server and for the time to add more texts.
            </p>
            <p className="mt-8">
              <Link
                href={KOFI_URL}
                className="inline-flex items-center text-base font-medium tracking-tight text-stone-900"
              >
                <CupIcon className="h-10 w-10" />
                <span className="ml-4">Support Daily Prayer on Ko-fi</span>
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
