import { Button } from '@/components/Button'
import { Container } from '@/components/Container'
import { GridPattern } from '@/components/GridPattern'
import { StoreButtons } from '@/components/StoreButtons'
import { APP_URL } from '@/lib/site'

/** The call to install the app, at the end of the homepage and of each readings page. */
export function GetTheApp({ title = 'Pray with your household tonight.' }: { title?: string }) {
  return (
    <section id="get-the-app" aria-labelledby="get-the-app-title" className="relative scroll-mt-14 overflow-hidden bg-brand-600 py-16 sm:py-20">
      <div className="absolute inset-0 text-white/10 mask-[linear-gradient(transparent,white)]">
        <GridPattern x="50%" y="100%" />
      </div>
      <Container size="md" className="relative text-center">
        <h2 id="get-the-app-title" className="font-display text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg tracking-tight text-brand-100">
          Install Covenant Household on your phone, or open it in your browser. It is free, and it works offline.
        </p>
        <StoreButtons dark className="mt-8 justify-center" />
        <Button href={APP_URL} color="white" className="mt-8" data-event="Open app" data-event-label="get-the-app">
          Open the web app
        </Button>
      </Container>
    </section>
  )
}
