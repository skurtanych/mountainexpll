import { MountainSnow } from 'lucide-react'
import LoginForm from '../components/LoginForm'
import styles from './Login.module.css'
import { classNames } from '../classNames'

export default function Login({ t, notice, onSubmit }) {
  return (
    <section className={classNames(styles, 'account', 'section-wrap', 'account--login')}>
      <div className={classNames(styles, 'login-layout')}>
        <div className={classNames(styles, 'login-aside')}>
          <p className={classNames(styles, 'eyebrow')}>
            <span />
            03 / {t.profile}
          </p>
          <h1>{t.signInTitle}</h1>
          <p>{t.signInSubtitle}</p>
          <div className={classNames(styles, 'login-aside__quote')}>
            “The best view comes after the hardest climb.”
          </div>
          <MountainSnow
            className={classNames(styles, 'login-aside__icon')}
            size={90}
            strokeWidth={0.8}
          />
        </div>
        <LoginForm t={t} notice={notice} onSubmit={onSubmit} />
      </div>
    </section>
  )
}
