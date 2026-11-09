import type { Ref } from 'react'
import type { House } from '../data/houses'
import styles from './HouseVisual.module.css'

interface HouseVisualProps {
  house: House
  heading: 'h1' | 'h2' | 'div'
  visualRef?: Ref<HTMLDivElement>
  className?: string
  hidden?: boolean
}

export function HouseVisual({
  house,
  heading: Heading,
  visualRef,
  className = '',
  hidden,
}: HouseVisualProps) {
  return (
    <div
      ref={visualRef}
      className={`${styles.visual} ${className}`}
      style={{ visibility: hidden ? 'hidden' : undefined }}
      data-house-visual
    >
      <img
        className={styles.image}
        src={house.cover}
        style={{ objectPosition: `${house.coverPosition}% center` }}
        alt={`Сгенерированная концепция: ${house.name} в лесу, не фотография базы`}
        fetchPriority="high"
        decoding="async"
        width="1672"
        height="941"
      />
      <div className={styles.shade} data-shade />
      <span className={styles.concept}>Сгенерированная концепция</span>
      <Heading
        className={styles.title}
        aria-label={house.name}
        tabIndex={Heading === 'h1' ? -1 : undefined}
        data-visual-title
      >
        {house.titleLines.map((line) => (
          <span key={line} className={styles.lineMask} aria-hidden="true">
            <span className={styles.titleLine} data-title-line>
              {line}
            </span>
          </span>
        ))}
      </Heading>
      <div className={styles.caption}>
        <span className={styles.category}>{house.category}</span>
        <span className={styles.captionText}>
          Ближе к природе.
          <br />
          Ближе друг к другу.
        </span>
      </div>
    </div>
  )
}
