import { ArrowRight, Mountain } from 'lucide-react'
import MountainCard from '../components/MountainCard'
import styles from './Home.module.css'
import { classNames } from '../classNames'

export default function Home({ mountains, language, t, goTo, onSelect }) {
  return (
    <>
      <section className={classNames(styles, 'hero')} aria-labelledby="hero-title">
        <div className={classNames(styles, 'hero__image')} />
        <div className={classNames(styles, 'hero__content')}>
          <h1 id="hero-title">Mountains</h1>
          <p className={classNames(styles, 'hero__tagline')}>{t.heroTagline}</p>
        </div>
        <div className={classNames(styles, 'hero__caption')}>
          <span>48°09′ N</span>
          <span>CARPATHIAN MOUNTAINS</span>
          <span>24°30′ E</span>
        </div>
        <div className={classNames(styles, 'hero__scroll')}>
          <span>SCROLL TO EXPLORE</span>
          <span className={classNames(styles, 'hero__scroll-line')} />
        </div>
      </section>

      <section className={classNames(styles, 'intro-strip')}>
        <p>
          «Збирай моменти,
          <br />а не речі»
        </p>
        <div className={classNames(styles, 'intro-strip__stats')}>
          <div>
            <strong>
              2 061<span> м</span>
            </strong>
            <span>{t.highPoint}</span>
          </div>
          <div>
            <strong>4</strong>
            <span>{t.routes}</span>
          </div>
          <div>
            <strong>06—10</strong>
            <span>{t.season}</span>
          </div>
        </div>
        <Mountain className={classNames(styles, 'intro-strip__icon')} size={70} strokeWidth={0.8} />
      </section>

      <section className={classNames(styles, 'featured', 'section-wrap')}>
        <div className={classNames(styles, 'section-heading')}>
          <div>
            <p className={classNames(styles, 'eyebrow')}>
              <span />
              01 / {t.mountains}
            </p>
            <h2>{t.featured}</h2>
            <p>{t.featuredText}</p>
          </div>
          <button
            className={classNames(styles, 'button', 'button--outline')}
            type="button"
            onClick={() => goTo('mountains')}
          >
            {t.allMountains}
            <ArrowRight size={16} />
          </button>
        </div>
        <div className={classNames(styles, 'mountain-grid', 'mountain-grid--featured')}>
          {mountains.slice(0, 3).map((mountain, index) => (
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
    </>
  )
}
