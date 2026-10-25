import { useEffect, useState } from 'react'
import { AtSign, Mail, Phone } from 'lucide-react'
import Header from './components/Header'
import MountainModal from './components/MountainModal'
import Home from './pages/Home'
import Login from './pages/Login'
import MountainsPage from './pages/Mountains'
import Profile from './pages/Profile'
import { copy, mountains } from './data'
import styles from './App.module.css'
import { classNames } from './classNames'

const demoUser = { email: 'traveler@mountains.ua', name: 'traveler' }
const demoBookings = [
  { id: 'b1', mountain: mountains[0].id, date: '2026-07-12', status: 'confirmed' },
  { id: 'b2', mountain: mountains[1].id, date: '2026-08-03', status: 'pending' },
  { id: 'b3', mountain: mountains[2].id, date: '2026-05-20', status: 'complete' },
]

function App() {
  const [page, setPage] = useState('home')
  const [language, setLanguage] = useState('ua')
  const [selectedMountain, setSelectedMountain] = useState(null)
  const [notice, setNotice] = useState('')
  const t = copy[language]

  useEffect(() => {
    if (!selectedMountain) return undefined
    const handleEscape = (event) => {
      if (event.key === 'Escape') setSelectedMountain(null)
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [selectedMountain])

  function goTo(nextPage) {
    setPage(nextPage)
    setSelectedMountain(null)
    setNotice('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleSignIn(event) {
    event.preventDefault()
    setNotice(t.authUnavailable)
  }

  return (
    <div className={classNames(styles, 'site-shell')}>
      <Header page={page} language={language} setLanguage={setLanguage} goTo={goTo} t={t} />

      <main>
        {page === 'home' && (
          <Home
            mountains={mountains}
            language={language}
            t={t}
            goTo={goTo}
            onSelect={setSelectedMountain}
          />
        )}
        {page === 'mountains' && (
          <MountainsPage
            mountains={mountains}
            language={language}
            t={t}
            onSelect={setSelectedMountain}
          />
        )}
        {page === 'login' && <Login t={t} notice={notice} onSubmit={handleSignIn} />}
        {page === 'profile' && (
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
        )}
      </main>

      {page !== 'login' && (
        <footer className={classNames(styles, 'site-footer')}>
          <div className={classNames(styles, 'site-footer__top')}>
            <span className={classNames(styles, 'brand__word')}>
              MOUNTAINS<span>.</span>
            </span>
            <p>{t.contact}</p>
            <span className={classNames(styles, 'site-footer__coords')}>48°09′ N · 24°30′ E</span>
          </div>
          <div className={classNames(styles, 'site-footer__details')}>
            <a href="tel:+380777777777">
              <Phone size={15} />
              <span>{t.phone}</span>
              <strong>+38 (077) 777-77-77</strong>
            </a>
            <a href="mailto:info@mountains.ua">
              <Mail size={15} />
              <span>Email</span>
              <strong>info@mountains.ua</strong>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noreferrer">
              <AtSign size={15} />
              <span>{t.social}</span>
              <strong>Instagram | Facebook</strong>
            </a>
          </div>
          <div className={classNames(styles, 'site-footer__bottom')}>
            <span>© 2026 MOUNTAINS EXPEDITIONS</span>
            <span>MADE FOR THE MOMENTS THAT MATTER</span>
          </div>
        </footer>
      )}

      <MountainModal
        mountain={selectedMountain}
        language={language}
        t={t}
        onClose={() => setSelectedMountain(null)}
      />
    </div>
  )
}

export default App
