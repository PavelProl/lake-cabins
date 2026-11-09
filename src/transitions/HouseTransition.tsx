import { useRef } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import type { Location } from 'react-router'
import type { House } from '../data/houses'
import { HouseVisual } from '../components/HouseVisual'
import { lockPageScroll } from './scrollLock'
import type { Box } from './geometry'
import styles from './HouseTransition.module.css'

gsap.registerPlugin(Flip, useGSAP)

export interface TransitionRequest {
  direction: 'opening' | 'closing'
  house: House
  from: Box
  destination: Location
  returnScroll: number | null
}

interface HouseTransitionProps {
  request: TransitionRequest
  onCovered: () => void
  onComplete: () => void
}

export function HouseTransition({ request, onCovered, onComplete }: HouseTransitionProps) {
  const frame = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const element = frame.current
      if (!element) return
      const root = document.documentElement
      const releaseScroll = lockPageScroll()
      let active = true
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

      const complete = () =>
        queueMicrotask(() => {
          if (active) onComplete()
        })
      let animation: gsap.core.Animation
      if (request.direction === 'closing') {
        let covered = false
        const cover = () => {
          if (!covered && active) {
            covered = true
            onCovered()
          }
        }
        animation = gsap
          .timeline({ onComplete: complete })
          .to(element, { duration: 0.01 })
          .call(cover)
      } else {
        gsap.set(element, request.from)
        const state = Flip.getState(element, { props: 'borderRadius' })
        gsap.set(element, {
          left: 0,
          top: 0,
          width: root.clientWidth,
          height: innerHeight,
          borderRadius: '0px',
        })
        animation = Flip.from(state, {
          duration: reducedMotion.matches ? 0 : 0.65,
          ease: 'power2.inOut',
          scale: false,
          onComplete: complete,
        })
      }

      const finish = () => animation.progress(1)
      window.addEventListener('resize', finish)
      reducedMotion.addEventListener('change', finish)
      return () => {
        active = false
        window.removeEventListener('resize', finish)
        reducedMotion.removeEventListener('change', finish)
        releaseScroll()
      }
    },
    { scope: frame, dependencies: [request, onComplete, onCovered], revertOnUpdate: true },
  )

  return (
    <div className={styles.layer} aria-hidden="true" data-transition-layer>
      {request.direction === 'closing' ? (
        <div ref={frame} className={styles.returnFrame} />
      ) : (
        <div ref={frame} className={styles.frame}>
          <HouseVisual house={request.house} heading="div" />
        </div>
      )}
    </div>
  )
}
