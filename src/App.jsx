import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import { Footer } from './components/Sections.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

const Interview = lazy(() => import('./pages/Interview.jsx'))
const Practice = lazy(() => import('./pages/Practice.jsx'))
const Peer = lazy(() => import('./pages/Peer.jsx'))
const Admin = lazy(() => import('./pages/Admin.jsx'))
const Settings = lazy(() => import('./pages/Settings.jsx'))
const Reports = lazy(() => import('./pages/Reports.jsx'))

export default function App() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-signal focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <Sidebar />
      <div className="lg:pl-64">
        <main id="main">
          <Suspense fallback={<p className="px-5 py-14 text-muted">Loading…</p>}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/interview" element={<Interview />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/peer" element={<Peer />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/reports" element={<Reports />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
            </Routes>
          </Suspense>
        </main>
        <Footer />
      </div>
    </>
  )
}
