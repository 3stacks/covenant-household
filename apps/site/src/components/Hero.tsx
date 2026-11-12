import Image from 'next/image'

import { Button } from '@/components/Button'
import { GridPattern } from '@/components/GridPattern'
import { APP_URL } from '@/lib/site'
import heroImage from '@/images/screens/day-top.png'

function Verse() {
  return (
    <figure className="relative mx-auto max-w-md text-center lg:mx-0 lg:text-left">
      <blockquote>
        <p className="font-display text-2xl font-medium text-stone-900">
          “It is a good thing to give thanks unto the LORD … to shew forth thy
          lovingkindness in the morning, and thy faithfulness every night.”
        </p>
      </blockquote>
      <figcaption className="mt-2 text-sm text-stone-500">
        <strong className="font-semibold text-brand-600">Psalm 92:1–2</strong>
      </figcaption>
    </figure>
  )
}

export function Hero() {
  return (
    <header className="overflow-hidden bg-stone-100 lg:bg-transparent lg:px-5">
      <div className="mx-auto grid max-w-6xl grid-cols-1 grid-rows-[auto_1fr] gap-y-16 pt-16 md:pt-20 lg:grid-cols-12 lg:gap-y-20 lg:px-3 lg:pt-20 lg:pb-36 xl:py-32">
        <div className="relative flex items-end lg:col-span-5 lg:row-span-2">
          <div className="absolute -top-20 right-1/2 -bottom-12 left-0 z-10 rounded-br-6xl bg-brand-600 text-white/10 md:bottom-8 lg:-inset-y-32 lg:right-full lg:left-[-100vw] lg:-mr-40">
            <GridPattern
              x="100%"
              y="100%"
              patternTransform="translate(112 64)"
            />
          </div>
          <div className="relative z-10 mx-auto flex w-64 overflow-hidden rounded-3xl bg-stone-600 shadow-xl ring-8 ring-stone-900 md:w-72 lg:w-auto lg:max-w-xs">
            <Image
              className="w-full"
              src={heroImage}
              alt="Covenant Household on a phone: the Twenty-fourth Sunday after Trinity, with Psalm 75 from the Scottish Psalter"
              priority
            />
          </div>
        </div>
        <div className="relative px-4 sm:px-6 lg:col-span-7 lg:pr-0 lg:pb-14 lg:pl-16 xl:pl-20">
          <div className="hidden lg:absolute lg:-top-32 lg:right-[-100vw] lg:bottom-0 lg:left-[-100vw] lg:block lg:bg-stone-100" />
          <Verse />
        </div>
        <div className="bg-white pt-16 lg:col-span-7 lg:bg-transparent lg:pt-0 lg:pl-16 xl:pl-20">
          <div className="mx-auto px-4 sm:px-6 md:max-w-2xl md:px-4 lg:px-0">
            <h1 className="font-display text-5xl font-extrabold text-stone-900 sm:text-6xl">
              Pray with the church, every day.
            </h1>
            <p className="mt-4 text-3xl text-stone-600">
              Covenant Household gives you a psalm to sing, two lessons from
              Scripture and a prayer for each day of the church year. Use it
              alone or with your family.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button href={APP_URL} color="blue">
                Open today’s page
              </Button>
              <Button href="#family" variant="outline" color="blue">
                Family worship
              </Button>
            </div>
            <p className="mt-4 text-base tracking-tight text-stone-500">
              Free. No account. Works offline.
            </p>
          </div>
        </div>
      </div>
    </header>
  )
}
