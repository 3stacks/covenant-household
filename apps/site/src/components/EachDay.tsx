import Image, { type StaticImageData } from 'next/image'

import { Container } from '@/components/Container'
import { SectionHeading } from '@/components/SectionHeading'
import dayImage from '@/images/screens/day-top.png'
import lessonImage from '@/images/screens/lesson.png'
import propersImage from '@/images/screens/propers.png'
import prayerImage from '@/images/screens/prayer.png'

const parts: { title: string; description: string; image: StaticImageData; alt: string }[] = [
  {
    title: 'The psalm',
    description:
      'Sing one psalm from the Scottish Psalter. Open “More psalms for today” to read the other psalms of the day.',
    image: dayImage,
    alt: 'Psalm 75 from the Scottish Psalter, at the top of the page for the day',
  },
  {
    title: 'The lessons',
    description:
      'Read one lesson from the Old Testament and one from the New Testament. The evening lessons are below them.',
    image: lessonImage,
    alt: 'The Old Testament lesson, Proverbs 8, in the King James Version',
  },
  {
    title: 'The Epistle and Gospel',
    description:
      'On Sundays and feasts, read the Epistle and the Gospel that the church reads on that day.',
    image: propersImage,
    alt: 'The Epistle for the Twenty-fourth Sunday after Trinity, Colossians 1',
  },
  {
    title: 'The collect',
    description:
      'Pray the collect of the week. Then pray for your family, your church and your neighbours in your own words.',
    image: prayerImage,
    alt: 'The collect for the Twenty-fourth Sunday after Trinity',
  },
]

export function EachDay() {
  return (
    <section
      id="each-day"
      aria-labelledby="each-day-title"
      className="scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <Container>
        <SectionHeading number="1" id="each-day-title">
          Each day
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-stone-900">
          A psalm, two lessons and a prayer. About fifteen minutes.
        </p>
        <p className="mt-4 text-lg tracking-tight text-stone-700">
          The text is on the page, so you do not need a second book. Each part
          links to the app that helps you go further with it.
        </p>
      </Container>
      <Container size="lg" className="mt-16">
        <ol
          role="list"
          className="grid grid-cols-1 gap-x-8 gap-y-10 [counter-reset:part] sm:grid-cols-2 lg:grid-cols-4"
        >
          {parts.map((part) => (
            <li key={part.title} className="[counter-increment:part]">
              <div className="relative flex h-56 items-start justify-center overflow-hidden rounded-2xl bg-brand-600 px-6 pt-6 shadow-lg">
                <Image
                  src={part.image}
                  alt={part.alt}
                  className="w-full rounded-t-lg shadow-md"
                  sizes="(min-width: 1024px) 18rem, (min-width: 640px) 50vw, 100vw"
                />
              </div>
              <h3 className="mt-8 text-base font-medium tracking-tight text-stone-900 before:mb-2 before:block before:font-mono before:text-sm before:text-stone-500 before:content-[counter(part,decimal-leading-zero)]">
                {part.title}
              </h3>
              <p className="mt-2 text-sm text-stone-600">{part.description}</p>
            </li>
          ))}
        </ol>
      </Container>
      <Container className="mt-16">
        <div className="rounded-2xl bg-stone-50 px-6 py-6 text-base text-stone-700 ring-1 ring-stone-200">
          <p className="font-medium text-stone-900">More parts will come</p>
          <p className="mt-2">
            We will add a writing from the Reformed tradition, a hymn and a
            part of the Westminster Standards to each day. We choose each text
            with care, and we use only texts that are free to share. These parts
            will come one at a time.
          </p>
        </div>
      </Container>
    </section>
  )
}
