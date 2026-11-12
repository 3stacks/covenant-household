import clsx from 'clsx'

import { Button } from '@/components/Button'
import { CheckIcon } from '@/components/CheckIcon'
import { Container } from '@/components/Container'
import { GridPattern } from '@/components/GridPattern'
import { SectionHeading } from '@/components/SectionHeading'
import { APP_URL, KOFI_URL } from '@/lib/site'

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'always',
    description: 'Everything in the prayer book, for you and your family.',
    features: [
      'Each day of the church year, with the full text',
      'The web app, and the iPhone and Android apps',
      'Works offline',
      'No account, no advertisements, no cookies',
    ],
    action: { href: APP_URL, label: 'Open today’s page', event: 'Open app' },
    featured: false,
  },
  {
    name: 'Supporter',
    price: 'Your choice',
    period: 'one time',
    description: 'The same prayer book. Your gift pays for the server and for new texts.',
    features: [
      'Everything in Free',
      'On the web: give any amount on Ko-fi',
      'In the iPhone and Android apps: one purchase in the app',
      'A supporter badge in the app',
    ],
    action: { href: KOFI_URL, label: 'Support on Ko-fi', event: 'Ko-fi' },
    featured: true,
  },
]

export function Pricing() {
  return (
    <section
      id="pricing"
      aria-labelledby="pricing-title"
      className="relative scroll-mt-14 py-16 sm:scroll-mt-32 sm:py-20 lg:py-32"
    >
      <div className="absolute inset-x-0 top-0 h-1/2 mask-[linear-gradient(white,transparent)] text-stone-900/10">
        <GridPattern x="50%" />
      </div>
      <Container size="md" className="relative">
        <SectionHeading number="5" id="pricing-title">
          Pricing
        </SectionHeading>
        <p className="mt-8 font-display text-4xl font-bold tracking-tight text-stone-900">
          Free for every household. Support from you keeps it free.
        </p>
        <p className="mt-4 text-lg tracking-tight text-stone-700">
          You get every part of Covenant Household for free. If it helps your
          family, you can give a gift. A gift adds no content. It gives a small
          badge in the app as thanks.
        </p>
      </Container>
      <Container size="md" className="relative mt-12">
        <div className="grid gap-8 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={clsx(
                'flex flex-col rounded-4xl px-6 py-8 sm:px-8',
                plan.featured ? 'bg-brand-600 text-white shadow-xl' : 'bg-white ring-1 ring-stone-200',
              )}
            >
              <h3 className={clsx('font-display text-2xl font-bold', plan.featured ? 'text-white' : 'text-stone-900')}>
                {plan.name}
              </h3>
              <p className={clsx('mt-2 text-base', plan.featured ? 'text-brand-100' : 'text-stone-600')}>
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-2">
                <span className={clsx('font-display text-4xl font-extrabold', plan.featured ? 'text-white' : 'text-stone-900')}>
                  {plan.price}
                </span>
                <span className={clsx('text-sm', plan.featured ? 'text-brand-100' : 'text-stone-500')}>{plan.period}</span>
              </p>
              <ul role="list" className="mt-6 flex-auto space-y-3 text-base">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex">
                    <CheckIcon className={clsx('h-8 w-8 flex-none', plan.featured ? 'fill-white' : 'fill-brand-500')} />
                    <span className="ml-3">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                href={plan.action.href}
                color={plan.featured ? 'white' : 'blue'}
                className="mt-8"
                data-event={plan.action.event}
                data-event-label="pricing"
              >
                {plan.action.label}
              </Button>
            </div>
          ))}
        </div>
      </Container>
    </section>
  )
}
