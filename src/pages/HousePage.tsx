import type { RefObject } from 'react'
import type { House } from '../data/houses'
import { RevealHeading } from '../components/RevealHeading'
import { HouseVisual } from '../components/HouseVisual'
import { HouseGallery } from '../components/HouseGallery'
import { ContactLinks } from '../components/ContactLinks'
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
        <p className="eyebrow" data-reveal>
          {house.category}
        </p>
        <div className={styles.aboutBody}>
          <RevealHeading id="about-heading" lines={['Пространство', 'для своих.']} />
          <div>
            <p data-reveal>{house.description}</p>
            <p className={styles.pending} data-reveal>
              Позвоните нам: подскажем, подойдёт ли дом для вашей компании, уточним стоимость,
              свободные даты и условия проживания.
            </p>
            <ContactLinks houseName={house.name} />
          </div>
        </div>
      </section>
      <div className={styles.divider} role="separator">
        <svg
          viewBox="0 0 480 48"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M8 24C72 4 120 44 184 24C198 20 210 20 222 24M258 24C270 28 282 28 296 24C360 4 408 44 472 24" />
          <path d="M240 9C224 19 224 29 240 39C256 29 256 19 240 9ZM240 17V31" />
        </svg>
      </div>
      <HouseGallery house={house} />
    </article>
  )
}
