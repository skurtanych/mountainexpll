import { useMemo, useState } from 'react'
import MountainCard from '../components/MountainCard'
import QueryState from '../components/QueryState'
import styles from './Mountains.module.css'
import { classNames } from '../classNames'

export default function Mountains({ mountains, status, language, t, onSelect }) {
  const [query, setQuery] = useState('')
  const [difficulty, setDifficulty] = useState('all')

  const difficulties = useMemo(
    () => [...new Map(mountains.map((m) => [m.difficulty.ua, m.difficulty[language]]))],
    [mountains, language],
  )

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return mountains.filter(
      (m) =>
        m.name[language].toLowerCase().includes(q) &&
        (difficulty === 'all' || m.difficulty.ua === difficulty),
    )
  }, [mountains, language, query, difficulty])

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
          <strong>{String(filtered.length).padStart(2, '0')}</strong>
          <span>{t.mountains}</span>
        </div>
      </div>

      <div className={classNames(styles, 'filters')}>
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={language === 'ua' ? 'Пошук за назвою' : 'Search by name'}
          aria-label={language === 'ua' ? 'Пошук' : 'Search'}
        />
        <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
          <option value="all">
            {language === 'ua' ? 'Будь-яка складність' : 'Any difficulty'}
          </option>
          {difficulties.map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>
      </div>

      <QueryState
        loading={status.loading}
        error={status.error}
        empty={!filtered.length}
        onRetry={status.refetch}
        language={language}
      >
        <div className={classNames(styles, 'mountain-grid')}>
          {filtered.map((mountain, index) => (
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
      </QueryState>
    </section>
  )
}
