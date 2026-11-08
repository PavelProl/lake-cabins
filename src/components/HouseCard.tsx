import { useRef } from 'react'
import type { RefObject } from 'react'
import { Link } from 'react-router'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import type { House } from '../data/houses'
import { Arrow } from './Arrow'
import { HouseVisual } from './HouseVisual'
import styles from './HouseCard.module.css'

gsap.registerPlugin(useGSAP)

interface HouseCardProps {
  house: House
  visualRef: RefObject<HTMLDivElement | null>
  busy: boolean
  hidden: boolean
}

export function HouseCard({ house, visualRef, busy, hidden }: HouseCardProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const hover = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      const media = gsap.matchMedia()
      media.add(
        '(min-width: 900px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)',
        () => {
          hover.current = gsap
            .timeline({ paused: true })
            .fromTo(
              '[data-title-line]',
              { yPercent: 115, rotation: 5 },
              { yPercent: 0, rotation: 0, duration: 0.9, stagger: 0.1, ease: 'circ.out' },
            )
          return () => {
            hover.current = null
          }
        },
      )
      return () => media.revert()
    },
    { scope: linkRef },
  )

  return (
    <Link
      ref={linkRef}
      id={`house-${house.id}`}
      to={`/houses/${house.id}`}
      className={styles.card}
      aria-label={`Открыть: ${house.name}`}
      aria-disabled={busy || undefined}
      onMouseEnter={() => hover.current?.play()}
      onMouseLeave={() => {
        if (!busy) hover.current?.reverse()
      }}
      onFocus={() => hover.current?.play()}
      onBlur={() => {
        if (!busy) hover.current?.reverse()
      }}
      onClick={(event) => {
        if (busy) {
          event.preventDefault()
          return
        }
        if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey)
          hover.current?.progress(1)
      }}
      data-house-card
    >
      <HouseVisual house={house} heading="h2" visualRef={visualRef} hidden={hidden} />
      <span className={styles.open} aria-hidden="true">
        <Arrow />
      </span>
      <span className={styles.mobileLink} aria-hidden="true">
        Смотреть дом <Arrow />
      </span>
    </Link>
  )
}
