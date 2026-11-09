import { Link } from 'react-router'
import { contacts, mapUrl } from '../data/site'
import styles from './SiteFooter.module.css'

export function SiteFooter({ onSoundHint }: { onSoundHint: () => void }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.top} data-reveal>
        <Link to="/" className={styles.brand}>
          Роща<span>Домики у озера Парное</span>
        </Link>
        <nav aria-label="Навигация в подвале">
          <Link to="/#houses">Выбрать дом</Link>
          <Link to="/#location">Как нас найти</Link>
          <a href={contacts.primary.tel}>Позвонить ↗</a>
          <a href={contacts.whatsapp} target="_blank" rel="noopener noreferrer">
            Написать в WhatsApp ↗
          </a>
        </nav>
        <div className={styles.phones}>
          <a href={contacts.primary.tel}>
            {contacts.primary.phone}
            <span>Основной номер</span>
          </a>
          <a href={contacts.secondary.tel}>
            {contacts.secondary.phone}
            <span>Дополнительный номер</span>
          </a>
        </div>
      </div>
      <div className={styles.bottom} data-reveal>
        <span>© {new Date().getFullYear()} Роща</span>
        <button className={styles.soundHint} onClick={onSoundHint}>
          Подсказка о звуке
        </button>
        <a href={mapUrl} target="_blank" rel="noopener noreferrer">
          Красноярский край, Берендейка, квартал 63 ↗
        </a>
      </div>
    </footer>
  )
}
