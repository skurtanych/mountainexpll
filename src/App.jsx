import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import styles from './App.module.css'
import Footer from './components/Footer'
import Header from './components/Header'
import MountainModal from './components/MountainModal'
import { copy } from './data/copy'
import { demoBookings } from './data/demoBookings'
import { mountains } from './data/mountains'
import Home from './pages/Home'
import Login from './pages/Login'
import Mountains from './pages/Mountains'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'

const demoUser = { email: 'traveler@mountains.ua', name: 'traveler' }

function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [language, setLanguage] = useState('ua')
  const [selectedMountain, setSelectedMountain] = useState(null)
  const [notice, setNotice] = useState('')
  const t = copy[language]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])

  useEffect(() => {
    if (!selectedMountain) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') setSelectedMountain(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedMountain])

  function resetView() {
    setNotice('')
    setSelectedMountain(null)
  }

  function goTo(nextPage) {
    resetView()
    navigate(`/${nextPage}`)
  }

  function handleBooking() {
    setSelectedMountain(null)
    goTo('login')
  }

  function handleSignIn(event) {
    event.preventDefault()
    setNotice(t.authUnavailable)
  }

  const isLogin = pathname === '/login'

  return (
    <div className={styles['site-shell']}>
      <Header language={language} setLanguage={setLanguage} onNavigate={resetView} t={t} />

      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route
            path="/home"
            element={
              <Home
                mountains={mountains}
                language={language}
                t={t}
                goTo={goTo}
                onSelect={setSelectedMountain}
              />
            }
          />
          <Route
            path="/mountains"
            element={
              <Mountains
                mountains={mountains}
                language={language}
                t={t}
                onSelect={setSelectedMountain}
              />
            }
          />
          <Route path="/login" element={<Login t={t} notice={notice} onSubmit={handleSignIn} />} />
          <Route
            path="/profile"
            element={
              <Profile
                user={demoUser}
                bookings={demoBookings}
                mountains={mountains}
                language={language}
                t={t}
                notice=""
                goTo={goTo}
                onSignOut={() => goTo('login')}
              />
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isLogin && <Footer t={t} />}

      <MountainModal
        mountain={selectedMountain}
        language={language}
        t={t}
        user={null}
        onBook={handleBooking}
        onClose={() => setSelectedMountain(null)}
      />
    </div>
  )
}

export default App
