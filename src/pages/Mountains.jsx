import MountainCard from '../components/MountainCard'
import styles from './Mountains.module.css'
import { classNames } from '../classNames'

export default function Mountains({ mountains, language, t, onSelect }) {
  return (
    <section className={classNames(styles, 'catalog', 'section-wrap')}>
      <div className={classNames(styles, 'catalog__heading')}>
        <div>
          <p className={classNames(styles, 'eyebrow')}>
            <span />
            02 / UKRAINIAN CARPATHIANS
          </p>
          <h1>{t.catalogTitle}</h1>
          <p>{t.catalogText}</p>
        </div>
        <div className={classNames(styles, 'catalog__count')}>
          <strong>0{mountains.length}</strong>
          <span>{t.mountains}</span>
        </div>
      </div>
      <div className={classNames(styles, 'mountain-grid')}>
        {mountains.map((mountain, index) => (
          <MountainCard
            key={mountain.id}
            mountain={mountain}
            index={index}
            language={language}
            t={t}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  )
}
