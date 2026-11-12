import Link from 'next/link'

import { Button } from '@/components/Button'
import { APP_URL } from '@/lib/site'

/** The bar at the top of each page other than the homepage. */
export function PageHeader() {
  return (
    <header className="border-b border-stone-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 font-display text-xl font-bold text-stone-900">
          {/* eslint-disable-next-line @next/next/no-img-element -- a small SVG icon */}
          <img src="/icon.svg" alt="" width={32} height={32} className="h-8 w-8" />
          Covenant Household
        </Link>
        <nav className="flex items-center gap-6 text-sm font-medium text-stone-700">
          <Link href="/readings/" className="hidden hover:text-stone-900 sm:inline">
            Readings
          </Link>
          <Link href="/#pricing" className="hidden hover:text-stone-900 sm:inline">
            Pricing
          </Link>
          <Button href={APP_URL} color="blue">
            Open the app
          </Button>
        </nav>
      </div>
    </header>
  )
}
