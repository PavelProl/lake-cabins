import type { RefObject } from 'react'
import type { House } from '../data/houses'
import { RevealHeading } from '../components/RevealHeading'
import { HouseVisual } from '../components/HouseVisual'
import { HouseGallery } from '../components/HouseGallery'
import { ContactLinks } from '../components/ContactLinks'
import { AmenitiesRibbon } from '../components/AmenitiesRibbon'
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
      <AmenitiesRibbon />
      <HouseGallery house={house} />
    </article>
  )
}
