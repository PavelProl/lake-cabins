import type { RefObject } from 'react'
import { houses } from '../data/houses'
import { HouseCard } from '../components/HouseCard'
import { Arrow } from '../components/Arrow'
import heroConcept from '../assets/large-house/cover-concept.jpg'
import styles from './HousesPage.module.css'

interface HousesPageProps {
  visualRef: RefObject<HTMLDivElement | null>
  activeHouseId?: string
  busy: boolean
}

export function HousesPage({ visualRef, activeHouseId, busy }: HousesPageProps) {
  return (
    <>
      <section className={styles.intro} aria-labelledby="intro-heading">
        <img
          className={styles.introImage}
          src={heroConcept}
          alt="Сгенерированная концепция бревенчатого дома в лесу у озера"
          width={1672}
          height={941}
          fetchPriority="high"
        />
        <p className={`eyebrow ${styles.location}`}>Красноярский край · Домики у озера</p>
        <h1 id="intro-heading">
          Неспешные
          <br />
          <span>дни у озера.</span>
        </h1>
        <div className={styles.introBottom}>
          <a className={styles.scrollLink} href="#houses" aria-label="Перейти к домам">
            <Arrow direction="down" />
            <span>Найти свой ритм</span>
          </a>
          <p>
            Быть ближе к природе.
            <br />
            Проводить время с близкими.
            <br />И просто никуда не спешить.
          </p>
        </div>
        <p className={styles.concept}>Концепция · сгенерированное изображение</p>
      </section>
      <section id="houses" className={styles.houses} aria-labelledby="houses-heading">
        <div className={styles.sectionHeading}>
          <h2 id="houses-heading">Дома с характером</h2>
          <span>Три типа домов / 01—03</span>
        </div>
        {houses.map((house, index) => (
          <div key={house.id} className={styles.houseEntry}>
            <HouseCard
              house={house}
              visualRef={house.id === activeHouseId ? visualRef : undefined}
              busy={busy}
              hidden={busy && house.id === activeHouseId}
            />
            <p className={styles.caption}>
              <span>
                {String(index + 1).padStart(2, '0')} — {house.name}
              </span>
              <span>
                Открыть и рассмотреть <Arrow />
              </span>
            </p>
          </div>
        ))}
      </section>
      <footer className={styles.footer}>
        <p>
          Меньше суеты.
          <br />
          <span>Больше настоящего.</span>
        </p>
        <div>
          <span>Домики у озера</span>
          <span>Визуальный прототип · 2026</span>
        </div>
      </footer>
    </>
  )
}
