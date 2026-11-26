import { type Metadata } from 'next'

import { Container } from '@/components/Container'
import { Footer } from '@/components/Footer'
import { PageHeader } from '@/components/PageHeader'

export const metadata: Metadata = {
  title: 'Terms',
  description: 'The terms of use of Covenant Household. Covenant Household is free, and we supply it as it is.',
  alternates: { canonical: '/terms/' },
}

const ISSUES = 'https://github.com/3stacks/daily-prayer/issues'

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mt-10 font-display text-3xl font-bold text-stone-900">{children}</h2>
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="mt-4 text-lg tracking-tight text-stone-700">{children}</p>
}

export default function TermsPage() {
  return (
    <>
      <PageHeader />
      <main className="flex-auto py-12 sm:py-16">
        <Container size="sm">
          <h1 className="font-display text-5xl font-extrabold tracking-tight text-stone-900">Terms</h1>
          <p className="mt-2 text-sm text-stone-500">Last change: 26 November 2026</p>
          <P>Covenant Household is free. These terms tell what you can expect from Covenant Household and from us.</P>

          <H2>Who we are</H2>
          <P>
            Alpine Hills Consulting Pty Ltd publishes Covenant Household. The company is in Australia. In these terms,
            “we” and “us” mean this company.
          </P>

          <H2>Use of Covenant Household</H2>
          <P>You can use Covenant Household at no cost. You need no account.</P>
          <P>
            If you use Covenant Household, you agree to these terms. If you do not agree, do not use Covenant Household.
          </P>

          <H2>No warranty</H2>
          <P>
            We supply Covenant Household as it is. We do not promise that it has no errors, or that it is always
            available.
          </P>
          <P>
            To the extent that the law permits, we are not liable for loss or damage from your use of Covenant
            Household.
          </P>
          <P>
            These terms do not remove rights that you have under the Australian Consumer Law, or under other law that an
            agreement cannot remove.
          </P>

          <H2>Links to other sites</H2>
          <P>Covenant Household links to other sites and apps. We do not control them. Their own terms apply.</P>

          <H2>Privacy</H2>
          <P>
            The{' '}
            <a href="/privacy/" className="text-brand-600 hover:text-brand-800">
              privacy policy
            </a>{' '}
            tells what Covenant Household keeps, and where.
          </P>

          <H2>The law</H2>
          <P>The law of Australia applies to these terms.</P>

          <H2>Changes and contact</H2>
          <P>
            If these terms change, this page shows the new terms and the date of the change. For a question, open an
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
