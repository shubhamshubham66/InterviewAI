import Sidebar from './components/Sidebar.jsx'
import { Hero, HowItWorks, Features, ReportPreview, FAQ, CTA, Footer } from './components/Sections.jsx'

export default function App() {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-64">
        <main>
          <Hero />
          <HowItWorks />
          <Features />
          <ReportPreview />
          <FAQ />
          <CTA />
        </main>
        <Footer />
      </div>
    </>
  )
}
