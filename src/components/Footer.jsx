import { AtSign, Mail, Phone } from 'lucide-react'
import styles from './Footer.module.css'
import { classNames } from '../classNames'

export default function Footer({ t }) {
  return (
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
  )
}
