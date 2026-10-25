import { ArrowRight, UserRound } from 'lucide-react'
import styles from './LoginForm.module.css'
import { classNames } from '../classNames'

export default function LoginForm({ t, notice, onSubmit }) {
  return (
    <form className={classNames(styles, 'login-form')} onSubmit={onSubmit}>
      <div className={classNames(styles, 'login-form__symbol')}>
        <UserRound size={23} />
      </div>
      <h1>{t.loginTitle}</h1>
      <p>{t.loginSubtitle}</p>
      {notice && <p className={classNames(styles, 'notice')}>{notice}</p>}
      <label htmlFor="email">{t.email}</label>
      <input
        id="email"
        name="email"
        type="email"
        autoComplete="email"
        placeholder="traveler@mountains.ua"
        defaultValue="traveler@mountains.ua"
      />
      <label htmlFor="password">{t.password}</label>
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        defaultValue="mountainpass"
      />
      <button
        className={classNames(styles, 'button', 'button--lime', 'login-form__submit')}
        type="submit"
      >
        {t.signIn}
        <ArrowRight size={17} />
      </button>
    </form>
  )
}
