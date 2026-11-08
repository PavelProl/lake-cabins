import { useRef } from 'react'
import type { RefObject } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import type { Location } from 'react-router'
import type { House } from '../data/houses'
import { HouseVisual } from '../components/HouseVisual'
import { measureVisual } from './geometry'
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
  destinationRef: RefObject<HTMLDivElement | null>
  onComplete: () => void
}

export function HouseTransition({ request, destinationRef, onComplete }: HouseTransitionProps) {
  const frame = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const element = frame.current
      if (!element) return
      const root = document.documentElement
      const previousOverflow = root.style.overflow
      root.style.overflow = 'hidden'
      let active = true
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)')

      if (request.direction === 'closing') {
        if (request.returnScroll !== null)
          window.scrollTo({ top: request.returnScroll, behavior: 'instant' })
        else destinationRef.current?.scrollIntoView({ block: 'center', behavior: 'instant' })
      }

      gsap.set(element, request.from)
      const state = Flip.getState(element, { props: 'borderRadius' })
      const target =
        request.direction === 'closing' && destinationRef.current
          ? measureVisual(destinationRef.current)
          : { left: 0, top: 0, width: root.clientWidth, height: innerHeight, borderRadius: '0px' }

      gsap.set(element, target)
      const animation = Flip.from(state, {
        duration: reducedMotion.matches ? 0 : request.direction === 'opening' ? 0.55 : 0.65,
        ease: request.direction === 'opening' ? 'power1.out' : 'power2.inOut',
        scale: false,
        onComplete: () =>
          queueMicrotask(() => {
            if (active) onComplete()
          }),
      })

      const finish = () => animation.progress(1)
      window.addEventListener('resize', finish)
      reducedMotion.addEventListener('change', finish)
      return () => {
        active = false
        window.removeEventListener('resize', finish)
        reducedMotion.removeEventListener('change', finish)
        root.style.overflow = previousOverflow
      }
    },
    { scope: frame, dependencies: [request, onComplete, destinationRef], revertOnUpdate: true },
  )

  return (
    <div className={styles.layer} aria-hidden="true" data-transition-layer>
      <div ref={frame} className={styles.frame}>
        <HouseVisual house={request.house} heading="div" />
      </div>
    </div>
  )
}
