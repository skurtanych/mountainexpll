import { useState } from 'react'
import { ArrowRight, CalendarDays, MapPin, Mountain, MountainSnow, X } from 'lucide-react'
import styles from './MountainModal.module.css'
import { classNames } from '../classNames'

function dateInDays(days) {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 10)
}

export default function MountainModal({ mountain, language, t, user, onBook, onClose }) {
  const [minDate] = useState(() => dateInDays(1))
  const [date, setDate] = useState(() => dateInDays(14))

  if (!mountain) return null

  const canBook = !user || (date && date >= minDate)

  return (
    <div
      className={classNames(styles, 'modal-backdrop')}
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <section
        className={classNames(styles, 'mountain-modal')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <button
          className={classNames(styles, 'icon-button', 'mountain-modal__close')}
          type="button"
          onClick={onClose}
          aria-label={t.close}
        >
          <X size={20} />
        </button>
        <div
          className={classNames(styles, 'mountain-modal__image')}
          style={{ backgroundImage: `url("${mountain.image}")` }}
        />
        <div className={classNames(styles, 'mountain-modal__content')}>
          <p className={classNames(styles, 'eyebrow')}>
            <span />
            CARPATHIAN EXPEDITION
          </p>
          <h2 id="modal-title">{mountain.name[language]}</h2>
          <p className={classNames(styles, 'mountain-modal__description')}>
            {mountain.description[language]}
          </p>
          <div className={classNames(styles, 'mountain-modal__facts')}>
            <div>
              <Mountain size={16} />
              <span>{t.altitude}</span>
              <strong>{mountain.altitude}</strong>
            </div>
            <div>
              <MapPin size={16} />
              <span>{t.location}</span>
              <strong>{mountain.range[language].split(' · ')[1]}</strong>
            </div>
            <div>
              <MountainSnow size={16} />
              <span>{t.difficulty}</span>
              <strong>{mountain.difficulty[language]}</strong>
            </div>
            <div>
              <CalendarDays size={16} />
              <span>{t.bestSeason}</span>
              <strong>{mountain.season[language]}</strong>
            </div>
          </div>

          {user && (
            <div className={classNames(styles, 'mountain-modal__date')}>
              <label htmlFor="departure-date">{t.departure}</label>
              <input
                id="departure-date"
                type="date"
                lang="en"
                value={date}
                min={minDate}
                onChange={(event) => setDate(event.target.value)}
              />
            </div>
          )}

          <button
            className={classNames(styles, 'button', 'button--lime', 'mountain-modal__book')}
            type="button"
            disabled={!canBook}
            onClick={() => onBook(mountain, date)}
          >
            {user ? t.book : t.loginToBook}
            <ArrowRight size={17} />
          </button>
          {!user && <p className={classNames(styles, 'mountain-modal__note')}>{t.demoNote}</p>}
        </div>
      </section>
    </div>
  )
}
