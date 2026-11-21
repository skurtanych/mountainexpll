import styles from './QueryState.module.css'

const labels = {
  ua: {
    loading: 'Завантаження…',
    error: 'Не вдалося завантажити дані',
    retry: 'Спробувати ще раз',
    empty: 'Нічого не знайдено',
  },
  en: {
    loading: 'Loading…',
    error: 'Could not load data',
    retry: 'Try again',
    empty: 'Nothing found',
  },
}

export default function QueryState({ loading, error, empty, onRetry, language, children }) {
  const l = labels[language]
  if (loading) {
    return (
      <p className={styles.state} role="status">
        {l.loading}
      </p>
    )
  }
  if (error) {
    return (
      <div className={styles.state} role="alert">
        <p>{l.error}</p>
        {onRetry && (
          <button type="button" onClick={onRetry}>
            {l.retry}
          </button>
        )}
      </div>
    )
  }
  if (empty) return <p className={styles.state}>{l.empty}</p>
  return children
}
