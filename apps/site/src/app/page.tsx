import { About } from '@/components/About'
import { ChurchYear } from '@/components/ChurchYear'
import { EachDay } from '@/components/EachDay'
import { Family } from '@/components/Family'
import { Footer } from '@/components/Footer'
import { GetTheApp } from '@/components/GetTheApp'
import { Hero } from '@/components/Hero'
import { Introduction } from '@/components/Introduction'
import { JsonLd } from '@/components/JsonLd'
import { NavBar } from '@/components/NavBar'
import { Pricing } from '@/components/Pricing'
import { Sources } from '@/components/Sources'
import { homeStructuredData } from '@/lib/structuredData'

export default function Home() {
  return (
    <>
      <JsonLd data={homeStructuredData()} />
      <Hero />
      <Introduction />
      <NavBar />
      <EachDay />
      <ChurchYear />
      <Family />
      <Sources />
      <Pricing />
      <About />
      <GetTheApp />
      <Footer />
    </>
  )
}
