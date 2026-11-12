import { type Metadata } from 'next'
import { EB_Garamond, Inter } from 'next/font/google'
import clsx from 'clsx'

import { SITE_URL } from '@/lib/site'
import '@/styles/tailwind.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const garamond = EB_Garamond({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-garamond',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Covenant Household: a Reformed daily prayer book',
    template: '%s | Covenant Household',
  },
  description:
    'A psalm to sing, two lessons from Scripture and a prayer for each day of the church year. Use it alone or with your family. Free, with no account.',
  icons: { icon: '/app/icon.svg' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="en-AU"
      className={clsx(
        'h-full scroll-smooth bg-white antialiased',
        inter.variable,
        garamond.variable,
      )}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
