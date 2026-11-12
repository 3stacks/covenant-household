import Link from 'next/link'

import { GridPattern } from '@/components/GridPattern'
import { APP_URL, HEARERS_URL, KOFI_URL, PRECENTOR_URL, SIB_URL } from '@/lib/site'

export function Footer() {
  return (
    <footer className="relative pt-5 pb-20 sm:pt-14 sm:pb-32">
      <div className="absolute inset-x-0 top-0 h-32 mask-[linear-gradient(white,transparent)] text-stone-900/10">
        <GridPattern x="50%" />
      </div>
      <div className="relative flex flex-col items-center gap-4 text-center text-sm text-stone-600">
        <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-medium text-stone-900">
          <Link href="/">Home</Link>
          <a href={APP_URL}>Open the app</a>
          <Link href={PRECENTOR_URL}>Precentor</Link>
          <Link href={HEARERS_URL}>Hearers</Link>
          <Link href={SIB_URL}>Self-Interpreting Bible</Link>
          <Link href={KOFI_URL}>Ko-fi</Link>
        </nav>
        <p>Made by Luke Boyle. Free to use.</p>
      </div>
    </footer>
  )
}
