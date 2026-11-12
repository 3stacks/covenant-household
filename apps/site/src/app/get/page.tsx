import { type Metadata } from 'next'

import { GetRedirect } from './GetRedirect'

// One link for a QR code, a printed card or a church bulletin. A phone goes to
// its store. Another device sees the store badges and the web app.
export const metadata: Metadata = {
  title: 'Get the app',
  description: 'Get Covenant Household for iPhone or Android, or open it in your browser.',
  robots: { index: false, follow: true },
}

export default function GetPage() {
  return <GetRedirect />
}
