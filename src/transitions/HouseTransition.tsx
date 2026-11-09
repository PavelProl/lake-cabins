import { useRef } from 'react'
import gsap from 'gsap'
import { Flip } from 'gsap/Flip'
import { useGSAP } from '@gsap/react'
import type { Location } from 'react-router'
import type { House } from '../data/houses'
import { HouseVisual } from '../components/HouseVisual'
import { lockPageScroll } from './scrollLock'
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
  onCovered: () => void
  onComplete: () => void
}

export function HouseTransition({ request, onCovered, onComplete }: HouseTransitionProps) {
  const frame = useRef<HTMLDivElement>(null)
  const destination = useRef<HTMLDivElement>(null)

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
      const initialWidth = root.clientWidth
      if (request.direction === 'closing') {
        let target = request.from
        gsap.set(element, { ...request.from, opacity: 0 })
        animation = gsap
          .timeline({ onComplete: complete })
          .to(element, { opacity: 1, duration: reducedMotion.matches ? 0 : 0.2 })
          .call(() => {
            onCovered()
            const card = document
              .getElementById(`house-${request.house.id}`)
              ?.querySelector<HTMLElement>('[data-house-visual]')
            if (card) target = measureVisual(card)
          })
          .to(element, {
            left: () => target.left,
            top: () => target.top,
            width: () => target.width,
            height: () => target.height,
            borderRadius: () => target.borderRadius,
            duration: reducedMotion.matches ? 0 : 0.65,
            ease: 'power2.inOut',
          })
      } else {
        gsap.set(element, request.from)
        const state = Flip.getState(element, { props: 'borderRadius' })
        gsap.set(element, {
          left: 0,
          top: 0,
          width: root.clientWidth,
          height: destination.current!.offsetHeight,
          borderRadius: '0px',
        })
        const ease = gsap.parseEase('power2.inOut')
        animation = Flip.from(state, {
          duration: reducedMotion.matches ? 0 : 0.65,
          ease: 'power2.inOut',
          scale: false,
          onUpdate: () => {
            if (!animation) return
            // Browser panels can change the visible height during the morph.
            // Use the same dynamic viewport as the destination hero, without ending early.
            const height = destination.current!.offsetHeight
            element.style.minHeight = '0px'
            element.style.maxHeight = 'none'
            element.style.height = `${request.from.height + (height - request.from.height) * ease(animation.progress())}px`
          },
          onComplete: complete,
        })
      }

      const finish = () => animation.progress(1)
      const resize = () => {
        if (root.clientWidth !== initialWidth) finish()
      }
      window.addEventListener('resize', resize)
      reducedMotion.addEventListener('change', finish)
      return () => {
        active = false
        window.removeEventListener('resize', resize)
        reducedMotion.removeEventListener('change', finish)
        releaseScroll()
      }
    },
    { scope: frame, dependencies: [request, onComplete, onCovered], revertOnUpdate: true },
  )

  return (
    <div className={styles.layer} aria-hidden="true" data-transition-layer>
      <div ref={destination} className={styles.destination} />
      <div ref={frame} className={styles.frame}>
        <HouseVisual house={request.house} heading="div" />
      </div>
    </div>
  )
}
