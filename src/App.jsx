import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar.jsx'
import { Footer } from './components/Sections.jsx'
import Landing from './pages/Landing.jsx'
import Interview from './pages/Interview.jsx'

export default function App() {
  return (
    <>
      <Sidebar />
      <div className="lg:pl-64">
        <main>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/interview" element={<Interview />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </>
  )
}
