import { Link } from 'react-router'
import styles from './NotFound.module.css'

export default function NotFound() {
  return (
    <main className={styles.page}>
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <h2 className={styles.title}>Сторінку не знайдено</h2>
        <p className={styles.subtitle}>
          Схоже, ти зійшов зі стежки. Такої сторінки не існує або її було переміщено.
        </p>

        <Link to="/" className={styles.button}>
          Повернутись на головну
        </Link>
      </div>
    </main>
  )
}
