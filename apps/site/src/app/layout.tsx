import { type Metadata, type Viewport } from 'next'
import { EB_Garamond, Inter } from 'next/font/google'
import clsx from 'clsx'

import { ANALYTICS_LOADER } from '@daily-prayer/core/analytics'
import { APP_STORE_ID, OG_IMAGE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from '@/lib/site'
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
  applicationName: SITE_NAME,
  title: {
    default: 'Covenant Household: a Reformed daily prayer book for family worship',
    template: '%s | Covenant Household',
  },
  description: SITE_DESCRIPTION,
  keywords: [
    'family worship',
    'daily prayer',
    'Reformed',
    'Book of Common Prayer',
    '1662 collects',
    'daily lectionary',
    'Scottish Psalter',
    'church year',
    'family devotions',
  ],
  authors: [{ name: 'Luke Boyle' }],
  creator: 'Luke Boyle',
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'en_AU',
    url: '/',
    title: 'Covenant Household: a Reformed daily prayer book',
    description: SITE_DESCRIPTION,
    images: [OG_IMAGE],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true },
  // The Smart App Banner in Safari on iPhone, when the app is in the App Store.
  ...(APP_STORE_ID ? { itunes: { appId: APP_STORE_ID } } : {}),
}

export const viewport: Viewport = {
  themeColor: '#5a3e1b',
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
      <head>
        {/* Anonymous visit counts. See functions/_lib/analytics.ts. */}
        <script dangerouslySetInnerHTML={{ __html: ANALYTICS_LOADER }} />
      </head>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  )
}
