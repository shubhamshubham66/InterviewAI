import Nav from './components/Nav.jsx'
import { Hero, HowItWorks, Features, ReportPreview, FAQ, CTA, Footer } from './components/Sections.jsx'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <ReportPreview />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </>
  )
}
