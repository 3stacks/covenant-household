import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { SectionHeading } from '@/components/SectionHeading'
import { HEARERS_URL, PRECENTOR_URL, SIB_URL } from '@/lib/site'

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
            <SectionHeading number="6" id="about-title">
              About
            </SectionHeading>
            <p className="mt-8 font-display text-4xl font-extrabold tracking-tight text-pretty text-stone-900 sm:text-6xl">
              <span className="block text-brand-600">Free forever.</span>{' '}
              Your support pays for the upkeep.
            </p>
            <figure className="mt-8 border-l-4 border-brand-300 pl-5">
              <blockquote className="font-display text-2xl text-stone-900">
                “Freely ye have received, freely give.”
              </blockquote>
              <figcaption className="mt-1 text-sm text-stone-500">Matthew 10:8</figcaption>
            </figure>
            <p className="mt-6 text-lg tracking-tight text-stone-700">
              The word of God is a free gift. It is wrong to put it behind a
              payment. So every reading, every psalm and every prayer in
              Covenant Household is free, for every household. There are no
              advertisements, no accounts and no cookies.
            </p>
            <p className="mt-4 text-lg tracking-tight text-stone-700">
              The texts are free to share, too. The Bibles, the psalms and the
              prayers are in the public domain, and the code is open source.
              Anyone can copy them, print them and build on them, so that the
              gospel goes further.
            </p>
            <p className="mt-4 text-lg tracking-tight text-stone-700">
              The server, the new texts and the work on the app cost money. If
              Covenant Household helps your family, you can give a gift. See{' '}
              <a href="#pricing" className="font-medium text-brand-600 hover:text-brand-800">Pricing</a>.
            </p>
            <p className="mt-8 text-lg tracking-tight text-stone-700">
              <a href="https://lukeboyle.com" className="font-medium text-brand-600 hover:text-brand-800">
                Luke Boyle
              </a>{' '}
              makes Covenant Household. It is one of a set of free apps for
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
          </div>
        </div>
      </div>
    </section>
  )
}
