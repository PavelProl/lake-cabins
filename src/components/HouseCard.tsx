import { useEffect, useRef } from 'react'
import type { MouseEvent, RefObject } from 'react'
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
  visualRef?: RefObject<HTMLDivElement | null>
  busy: boolean
  hidden: boolean
}

export function HouseCard({ house, visualRef, busy, hidden }: HouseCardProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const hover = useRef<gsap.core.Timeline | null>(null)

  useEffect(() => {
    let pointer: { x: number; y: number } | null = null
    const rememberPointer = (event: PointerEvent) => {
      if (event.pointerType === 'mouse') pointer = { x: event.clientX, y: event.clientY }
    }
    const followScroll = () => {
      const link = linkRef.current
      const cursor = cursorRef.current
      if (!pointer || !link || !cursor) return
      const box = link.getBoundingClientRect()
      if (
        pointer.x < box.left ||
        pointer.x > box.right ||
        pointer.y < box.top ||
        pointer.y > box.bottom
      )
        return
      cursor.style.transition = 'opacity 0.25s'
      cursor.style.setProperty('--cursor-x', `${pointer.x - box.left}px`)
      cursor.style.setProperty('--cursor-y', `${pointer.y - box.top}px`)
    }
    window.addEventListener('pointermove', rememberPointer, { passive: true })
    window.addEventListener('scroll', followScroll, { passive: true, capture: true })
    return () => {
      window.removeEventListener('pointermove', rememberPointer)
      window.removeEventListener('scroll', followScroll, true)
    }
  }, [])

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

  function positionCursor(event: MouseEvent<HTMLAnchorElement>, immediate = false) {
    const cursor = cursorRef.current
    if (!cursor) return
    const box = event.currentTarget.getBoundingClientRect()
    const x = Math.min(box.width - 36, Math.max(36, event.clientX - box.left))
    const y = Math.min(box.height - 36, Math.max(36, event.clientY - box.top))
    cursor.style.transition = immediate ? 'opacity 0.25s' : ''
    cursor.style.setProperty('--cursor-x', `${x}px`)
    cursor.style.setProperty('--cursor-y', `${y}px`)
  }

  return (
    <Link
      ref={linkRef}
      id={`house-${house.id}`}
      to={`/houses/${house.id}`}
      className={styles.card}
      aria-label={`Открыть: ${house.name}`}
      aria-disabled={busy || undefined}
      onMouseEnter={(event) => {
        positionCursor(event, true)
        hover.current?.play()
      }}
      onMouseMove={(event) => positionCursor(event)}
      onMouseLeave={() => {
        if (!busy) hover.current?.reverse()
      }}
      onFocus={() => {
        hover.current?.play()
      }}
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
      <span ref={cursorRef} className={styles.open} data-card-cursor aria-hidden="true">
        <span className={styles.cursorFace}>
          <Arrow />
        </span>
      </span>
      <span className={styles.mobileLink} aria-hidden="true">
        Смотреть дом <Arrow />
      </span>
    </Link>
  )
}
