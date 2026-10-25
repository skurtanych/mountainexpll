import { ArrowRight, CalendarDays, MapPin, Mountain, MountainSnow, X } from 'lucide-react'
import styles from './MountainModal.module.css'
import { classNames } from '../classNames'

export default function MountainModal({ mountain, language, t, onClose }) {
  if (!mountain) return null

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
          <button
            className={classNames(styles, 'button', 'button--lime', 'mountain-modal__book')}
            type="button"
          >
            {t.book}
            <ArrowRight size={17} />
          </button>
          <p className={classNames(styles, 'mountain-modal__note')}>{t.demoNote}</p>
        </div>
      </section>
    </div>
  )
}
