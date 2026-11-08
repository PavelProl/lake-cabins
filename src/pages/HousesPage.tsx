import type { RefObject } from 'react'
import { houses } from '../data/houses'
import { HouseCard } from '../components/HouseCard'
import { Arrow } from '../components/Arrow'
import styles from './HousesPage.module.css'

interface HousesPageProps {
  visualRef: RefObject<HTMLDivElement | null>
  busy: boolean
}

export function HousesPage({ visualRef, busy }: HousesPageProps) {
  return (
    <>
      <section className={styles.intro} aria-labelledby="intro-heading">
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
      </section>
      <section id="houses" className={styles.houses} aria-labelledby="houses-heading">
        <div className={styles.sectionHeading}>
          <h2 id="houses-heading">Дома с характером</h2>
          <span>Первый взгляд / 01</span>
        </div>
        {houses.map((house) => (
          <HouseCard key={house.id} house={house} visualRef={visualRef} busy={busy} hidden={busy} />
        ))}
        <p className={styles.caption}>
          <span>01 — Большой бревенчатый дом</span>
          <span>
            Открыть и рассмотреть <Arrow />
          </span>
        </p>
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
