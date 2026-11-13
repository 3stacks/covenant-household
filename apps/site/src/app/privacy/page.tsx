import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'Covenant Household collects no personal data. The apps have no account, no advertisements and no tracking.',
  alternates: { canonical: '/privacy/' },
}

const ISSUES = 'https://github.com/3stacks/daily-prayer/issues'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-display text-3xl font-bold text-stone-900">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-lg tracking-tight text-stone-700">{children}</p>
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader />
      <main className="flex-auto py-12 sm:py-16">
        <Container size="sm">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-stone-900">Privacy</h1>
          <p className="mt-2 text-sm text-stone-500">Last change: 13 November 2026</p>
          <P>
            Covenant Household collects no personal data. It has no account, no advertisements and no tracking. This page
            tells what each part of Covenant Household keeps, and where.
          </P>

          <H2>The iPhone and Android apps</H2>
          <P>
            The apps send no data to us or to another company. They have no analytics. Your settings, for example your
            choice of Bible, stay on your device. When you delete the app, you delete them.
          </P>
          <P>
            The readings are in the app, so the app works with no connection. The app connects to the internet only
            when you open a link, for example to Precentor, to Hearers or to the Self-Interpreting Bible. Those sites
            have their own privacy policies.
          </P>

          <H2>The website and the web app</H2>
          <P>
            The website counts visits with Umami. Umami uses no cookies and does not identify you. It records the page,
            the site that sent you, the type of browser and device, and the country. It does not keep your IP address.
            Analytics counts only the public site, covenanthousehold.app.
          </P>
          <P>
            The web app keeps your settings in the storage of your browser, on your device. We do not receive them.
          </P>
          <P>
            Cloudflare hosts the website. Cloudflare processes each visit, as each web host does, to deliver the page
            and to protect the site. Read the{' '}
            <a href="https://www.cloudflare.com/privacypolicy/" className="text-brand-600 hover:text-brand-800">
              privacy policy of Cloudflare
            </a>
            .
          </P>

          <H2>Gifts</H2>
          <P>
            On the web, you can give a gift on Ko-fi. Ko-fi and its payment provider process the gift. We receive your
            name and your message only if you give them to Ko-fi.
          </P>

          <H2>Children</H2>
          <P>Covenant Household is for families. It collects no data from anyone, so it collects no data from children.</P>

          <H2>Changes and contact</H2>
          <P>
            If this policy changes, this page shows the new policy and the date of the change. For a question, open an
            issue on{' '}
            <a href={ISSUES} className="text-brand-600 hover:text-brand-800">
              GitHub
            </a>
            .
          </P>
        </Container>
      </main>
      <Footer />
    </>
  )
}
