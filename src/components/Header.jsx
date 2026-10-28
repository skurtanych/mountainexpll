import { Languages, MountainSnow, UserRound } from 'lucide-react'
import styles from './Header.module.css'
import { classNames } from '../classNames'

export default function Header({ page, language, setLanguage, goTo, t }) {
  return (
    <header className={classNames(styles, 'site-header')}>
      <button
        className={classNames(styles, 'brand')}
        type="button"
        onClick={() => goTo('home')}
        aria-label="Home"
      >
        <span className={classNames(styles, 'brand__mark')}>
          <MountainSnow size={24} strokeWidth={1.7} />
        </span>
      </button>
      <nav className={classNames(styles, 'main-nav')} aria-label="Main navigation">
        {[
          { item: 'home', label: 'Home' },
          { item: 'mountains', label: 'Mountains' },
        ].map(({ item, label }) => (
          <button
            className={classNames(styles, 'main-nav__link', page === item && 'is-active')}
            type="button"
            key={item}
            onClick={() => goTo(item)}
            aria-current={page === item ? 'page' : undefined}
          >
            {label}
          </button>
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
        <button
          className={classNames(styles, 'profile-link')}
          type="button"
          onClick={() => goTo('login')}
        >
          Profile
        </button>
        <button
          className={classNames(styles, 'profile-shortcut')}
          type="button"
          onClick={() => goTo('login')}
          aria-label="Profile"
        >
          <UserRound size={19} />
        </button>
      </div>
    </header>
  )
}
