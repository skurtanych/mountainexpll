import { ArrowRight, Mountain, MountainSnow } from 'lucide-react'
import styles from './MountainCard.module.css'
import { classNames } from '../classNames'

export default function MountainCard({ mountain, index, language, t, onSelect }) {
  return (
    <article className={classNames(styles, 'mountain-card')} style={{ '--card-order': index }}>
      <button
        className={classNames(styles, 'mountain-card__image')}
        data-testid="mountain-card-image"
        type="button"
        style={{ backgroundImage: `url("${mountain.image}")` }}
        onClick={() => onSelect(mountain)}
        aria-label={`${t.discover}: ${mountain.name[language]}`}
      >
        <span className={classNames(styles, 'mountain-card__height')}>
          <Mountain size={14} /> {mountain.altitude}
        </span>
      </button>
      <div className={classNames(styles, 'mountain-card__body')}>
        <p className={classNames(styles, 'mountain-card__range')}>{mountain.range[language]}</p>
        <h3>{mountain.name[language]}</h3>
        <div className={classNames(styles, 'mountain-card__meta')}>
          <span>
            <MountainSnow size={15} /> {mountain.difficulty[language]}
          </span>
          <button
            type="button"
            className={classNames(styles, 'text-button')}
            onClick={() => onSelect(mountain)}
          >
            {t.discover} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </article>
  )
}
