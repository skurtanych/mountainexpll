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
  const [bookingError, setBookingError] = useState('')
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
      if (event.key === 'Escape') {
        setSelectedMountain(null)
        setBookingError('')
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedMountain])

  function resetView() {
    setNotice('')
    setBookingError('')
    setSelectedMountain(null)
  }

  function goTo(nextPage) {
    resetView()
    navigate(`/${nextPage}`)
  }

  async function handleBooking(mountain, date) {
    if (!user) {
      goTo('login')
      return
    }
    setBookingError('')
    try {
      await mutate(`${API_URL}/bookings`, {
        body: { mountain: mountain.id, date },
      })
      setSelectedMountain(null)
      setNotice(language === 'ua' ? 'Заявку створено' : 'Booking created')
      navigate('/profile')
    } catch (err) {
      const isDuplicate = err.message.includes('already booked')
      if (language === 'ua') {
        setBookingError(
          isDuplicate
            ? 'Ви вже забронювали цю гору на цю дату. Оберіть іншу дату.'
            : 'Не вдалося створити заявку. Спробуй ще раз.',
        )
      } else {
        setBookingError(
          isDuplicate
            ? 'You already booked this mountain for this date. Choose another date.'
            : 'Booking failed. Please try again.',
        )
      }
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
        error={bookingError}
        onBook={handleBooking}
        onClose={() => {
          setSelectedMountain(null)
          setBookingError('')
        }}
      />
    </div>
  )
}

export default App
