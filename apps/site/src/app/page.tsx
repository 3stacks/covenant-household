import { About } from '@/components/About'
import { ChurchYear } from '@/components/ChurchYear'
import { EachDay } from '@/components/EachDay'
import { Family } from '@/components/Family'
import { Footer } from '@/components/Footer'
import { Hero } from '@/components/Hero'
import { Introduction } from '@/components/Introduction'
import { NavBar } from '@/components/NavBar'
import { Sources } from '@/components/Sources'

export default function Home() {
  return (
    <>
      <Hero />
      <Introduction />
      <NavBar />
      <EachDay />
      <ChurchYear />
      <Family />
      <Sources />
      <About />
      <Footer />
    </>
  )
}
