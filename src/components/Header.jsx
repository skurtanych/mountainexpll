import { Languages, MountainSnow, UserRound } from 'lucide-react'
import { Link, NavLink } from 'react-router'
import styles from './Header.module.css'
import { classNames } from '../classNames'

const navItems = [
  { to: '/home', label: 'Home' },
  { to: '/mountains', label: 'Mountains' },
]

export default function Header({ language, setLanguage, onNavigate, t }) {
  return (
    <header className={classNames(styles, 'site-header')}>
      <Link
        to="/home"
        className={classNames(styles, 'brand')}
        onClick={onNavigate}
        aria-label="Home"
      >
        <span className={classNames(styles, 'brand__mark')}>
          <MountainSnow size={24} strokeWidth={1.7} />
        </span>
      </Link>
      <nav className={classNames(styles, 'main-nav')} aria-label="Main navigation">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              classNames(styles, 'main-nav__link', isActive && 'is-active')
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
      <div className={classNames(styles, 'header-tools')}>
        <button
          className={classNames(styles, 'language-button')}
          type="button"
          onClick={() => setLanguage((current) => (current === 'ua' ? 'en' : 'ua'))}
          aria-label={t.language}
          title={t.language}
        >
          <Languages size={16} />
          <span>{language.toUpperCase()}</span>
        </button>
        <Link to="/login" className={classNames(styles, 'profile-link')} onClick={onNavigate}>
          Profile
        </Link>
        <Link
          to="/login"
          className={classNames(styles, 'profile-shortcut')}
          onClick={onNavigate}
          aria-label="Profile"
        >
          <UserRound size={19} />
        </Link>
      </div>
    </header>
  )
}
