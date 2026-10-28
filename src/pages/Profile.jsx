import { ArrowRight, CalendarDays, Check, LogOut, Mountain, UserRound } from 'lucide-react'
import styles from './Profile.module.css'
import { classNames } from '../classNames'

export default function Profile({
  user,
  bookings,
  mountains,
  language,
  t,
  notice,
  goTo,
  onSignOut,
}) {
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
          onClick={onSignOut}
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
        {bookings.length ? (
          <div className={classNames(styles, 'table-scroll')}>
            <table>
              <thead>
                <tr>
                  <th>{t.expedition}</th>
                  <th>{t.departure}</th>
                  <th>{t.status}</th>
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
                        <span className={classNames(styles, 'status', `status--${booking.status}`)}>
                          {t[booking.status]}
                        </span>
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
        <p className={classNames(styles, 'booking-panel__note')}>{t.demoNote}</p>
      </section>
    </section>
  )
}
