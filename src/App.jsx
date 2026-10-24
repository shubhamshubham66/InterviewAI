import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import { Footer } from './components/Sections.jsx'
import Landing from './pages/Landing.jsx'

const Interview = lazy(() => import('./pages/Interview.jsx'))
const Practice = lazy(() => import('./pages/Practice.jsx'))

export default function App() {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-64">
        <main>
          <Suspense fallback={<p className="px-5 py-14 text-muted">Loading…</p>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/practice" element={<Practice />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
