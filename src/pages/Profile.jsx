import { useState } from 'react'
import { ArrowRight, CalendarDays, Check, LogOut, Mountain, Trash2, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router'
import { API_URL } from '../api/config'
import ConfirmDialog from '../components/ConfirmDialog'
import QueryState from '../components/QueryState'
import { useAuth } from '../hooks/useAuth'
import { useFetch } from '../hooks/useFetch'
import { useMutation } from '../hooks/useMutation'
import styles from './Profile.module.css'
import { classNames } from '../classNames'

export default function Profile({ mountains, language, t, notice, goTo }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const { data, loading, error, refetch } = useFetch(`${API_URL}/bookings`)
  const bookings = data ?? []
  const { mutate, loading: deleting } = useMutation()
  const [pendingCancel, setPendingCancel] = useState(null)

  function handleSignOut() {
    logout()
    navigate('/login')
  }

  async function confirmCancel() {
    try {
      await mutate(`${API_URL}/bookings/${pendingCancel.id}`, { method: 'DELETE' })
      refetch()
    } catch {
      // помилку зберігає useMutation в error, окремо обробляти не обов'язково
    } finally {
      setPendingCancel(null)
    }
  }

  const dateFormat = new Intl.DateTimeFormat(language === 'ua' ? 'uk-UA' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <section className={classNames(styles, 'account', 'section-wrap')}>
      <div className={classNames(styles, 'account-heading')}>
        <div>
          <p className={classNames(styles, 'eyebrow')}>
            <span />
            03 / {t.profile}
          </p>
          <h1>{t.accountTitle}</h1>
          <p>{t.accountSubtitle}</p>
        </div>
        <button
          className={classNames(styles, 'button', 'button--outline')}
          type="button"
          onClick={handleSignOut}
        >
          <LogOut size={16} />
          {t.signOut}
        </button>
      </div>
      <div className={classNames(styles, 'account-user')}>
        <span className={classNames(styles, 'account-user__avatar')}>
          <UserRound size={20} />
        </span>
        <span>{user.name}</span>
        <span className={classNames(styles, 'account-user__email')}>{user.email}</span>
      </div>
      {notice && (
        <div className={classNames(styles, 'notice', 'notice--success')} role="status">
          <Check size={16} />
          {notice}
        </div>
      )}
      <section className={classNames(styles, 'booking-panel')}>
        <div className={classNames(styles, 'booking-panel__title')}>
          <div>
            <CalendarDays size={18} />
            <h2>{t.bookings}</h2>
          </div>
          <span>{bookings.length.toString().padStart(2, '0')}</span>
        </div>
        <QueryState loading={loading} error={error} onRetry={refetch} language={language}>
          {bookings.length ? (
            <div className={classNames(styles, 'table-scroll')}>
              <table>
                <thead>
                  <tr>
                    <th>{t.expedition}</th>
                    <th>{t.departure}</th>
                    <th>{t.status}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => {
                    const mountain = mountains.find((item) => item.id === booking.mountain)
                    return (
                      <tr key={booking.id}>
                        <td>
                          <strong>{mountain?.name[language] || booking.mountain}</strong>
                          <span>{mountain?.range[language]}</span>
                        </td>
                        <td>{dateFormat.format(new Date(`${booking.date}T12:00:00`))}</td>
                        <td>
                          <span
                            className={classNames(styles, 'status', `status--${booking.status}`)}
                          >
                            {t[booking.status]}
                          </span>
                        </td>
                        <td>
                          <button
                            className={classNames(styles, 'text-button')}
                            type="button"
                            disabled={deleting}
                            onClick={() =>
                              setPendingCancel({
                                id: booking.id,
                                name: mountain?.name[language] || booking.mountain,
                              })
                            }
                            aria-label={`Скасувати: ${mountain?.name[language] || booking.mountain}`}
                          >
                            <Trash2 size={15} />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className={classNames(styles, 'empty-bookings')}>
              <Mountain size={27} />
              <p>{t.noBookings}</p>
              <button
                className={classNames(styles, 'text-button')}
                type="button"
                onClick={() => goTo('mountains')}
              >
                {t.firstVisit}
                <ArrowRight size={15} />
              </button>
            </div>
          )}
        </QueryState>
        <p className={classNames(styles, 'booking-panel__note')}>{t.demoNote}</p>
      </section>

      {pendingCancel && (
        <ConfirmDialog
          title={language === 'ua' ? 'Скасувати бронювання?' : 'Cancel booking?'}
          message={
            language === 'ua'
              ? `Заявку на ${pendingCancel.name} буде видалено.`
              : `Your booking for ${pendingCancel.name} will be deleted.`
          }
          confirmLabel={language === 'ua' ? 'Так, скасувати' : 'Yes, cancel'}
          cancelLabel={language === 'ua' ? 'Залишити' : 'Keep it'}
          busy={deleting}
          onConfirm={confirmCancel}
          onCancel={() => setPendingCancel(null)}
        />
      )}
    </section>
  )
}
