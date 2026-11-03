import { useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation, useNavigate } from 'react-router'
import styles from './App.module.css'
import { API_URL } from './api/config'
import Footer from './components/Footer'
import Header from './components/Header'
import MountainModal from './components/MountainModal'
import ProtectedRoute from './components/ProtectedRoute'
import { copy } from './data/copy'
import { useAuth } from './hooks/useAuth'
import { useFetch } from './hooks/useFetch'
import { useMutation } from './hooks/useMutation'
import Home from './pages/Home'
import Login from './pages/Login'
import Mountains from './pages/Mountains'
import NotFound from './pages/NotFound'
import Profile from './pages/Profile'

function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [language, setLanguage] = useState('ua')
  const [selectedMountain, setSelectedMountain] = useState(null)
  const [notice, setNotice] = useState('')
  const t = copy[language]

  const { user, login } = useAuth()
  const { mutate } = useMutation()
  const mountainsQuery = useFetch(`${API_URL}/mountains`)
  const mountains = mountainsQuery.data ?? []
  const status = {
    loading: mountainsQuery.loading,
    error: mountainsQuery.error,
    refetch: mountainsQuery.refetch,
  }

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

  async function handleBooking(mountain, date) {
    setSelectedMountain(null)
    if (!user) {
      goTo('login')
      return
    }
    try {
      await mutate(`${API_URL}/bookings`, {
        body: { userId: user.id, mountain: mountain.id, date, status: 'pending' },
      })
      setNotice(language === 'ua' ? 'Заявку створено' : 'Booking created')
      navigate('/profile')
    } catch {
      setNotice(language === 'ua' ? 'Не вдалося створити заявку' : 'Booking failed')
    }
  }

  async function handleSignIn(event) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    try {
      await login(form.get('email'), form.get('password'))
      setNotice('')
      navigate('/profile')
    } catch {
      setNotice(t.emailError)
    }
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
                status={status}
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
              <ProtectedRoute>
                <Profile
                  mountains={mountains}
                  language={language}
                  t={t}
                  notice={notice}
                  goTo={goTo}
                />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      {!isLogin && <Footer t={t} />}

      <MountainModal
        key={selectedMountain?.id}
        mountain={selectedMountain}
        language={language}
        t={t}
        user={user}
        onBook={handleBooking}
        onClose={() => setSelectedMountain(null)}
      />
    </div>
  )
}

export default App
