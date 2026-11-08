import type { RefObject } from 'react'
import { Link } from 'react-router'
import type { House } from '../data/houses'
import { HouseVisual } from '../components/HouseVisual'
import { HouseGallery } from '../components/HouseGallery'
import { Arrow } from '../components/Arrow'
import styles from './HousePage.module.css'

interface HousePageProps {
  house: House
  visualRef: RefObject<HTMLDivElement | null>
  hidden: boolean
}

export function HousePage({ house, visualRef, hidden }: HousePageProps) {
  return (
    <article>
      <section className={styles.hero} aria-label={house.name}>
        <HouseVisual house={house} heading="h1" visualRef={visualRef} hidden={hidden} />
        <a href="#about-house" className={styles.down} aria-label="Читать о доме">
          <Arrow direction="down" />
        </a>
      </section>
      <section id="about-house" className={styles.about} aria-labelledby="about-heading">
        <p className="eyebrow">{house.category}</p>
        <div className={styles.aboutBody}>
          <h2 id="about-heading">
            Пространство
            <br />
            для своих.
          </h2>
          <div>
            <p>{house.description}</p>
            <p className={styles.pending}>
              Вместимость, стоимость и условия проживания уточняются у владельцев.
            </p>
          </div>
        </div>
      </section>
      <HouseGallery house={house} />
      <footer className={styles.footer}>
        <span className="eyebrow">Домики у озера</span>
        <Link to="/" className={styles.return}>
          Вернуться
          <br />к домам <Arrow direction="left" />
        </Link>
        <p>
          Временная обложка сгенерирована.
          <br />В галерее — реальные фотографии дома.
        </p>
      </footer>
    </article>
  )
}
