import type { RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export function useScrollReveal(
  scope: RefObject<HTMLDivElement | null>,
  ready: boolean,
  route: string,
) {
  useGSAP(
    () => {
      if (!ready || !scope.current) return
      const media = gsap.matchMedia()
      media.add('(prefers-reduced-motion: no-preference)', () => {
        const root = scope.current!
        const groups = [...root.querySelectorAll<HTMLElement>('[data-reveal]')]
        const animations = new Map<HTMLElement, gsap.core.Tween>()

        function reveal(group: HTMLElement, instant = false) {
          if (group.dataset.revealed === 'true') {
            if (instant) animations.get(group)?.progress(1)
            return
          }
          group.dataset.revealed = 'true'
          observer.unobserve(group)
          const lines = group.querySelectorAll<HTMLElement>('[data-reveal-line]')
          animations.set(
            group,
            gsap.to(lines.length ? lines : group, {
              yPercent: 0,
              y: 0,
              opacity: 1,
              duration: instant ? 0 : 1.15,
              stagger: lines.length ? 0.12 : 0,
              ease: 'power3.out',
            }),
          )
        }

        const observer = new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) reveal(entry.target as HTMLElement)
            })
          },
          { rootMargin: '0px', threshold: 0 },
        )

        groups.forEach((group) => {
          if (group.dataset.revealed === 'true') return
          if (group.getBoundingClientRect().bottom < 0) {
            group.dataset.revealed = 'true'
            return
          }
          const lines = group.querySelectorAll('[data-reveal-line]')
          if (lines.length) gsap.set(lines, { yPercent: 115 })
          else gsap.set(group, { y: 36, opacity: 0 })
          observer.observe(group)
        })

        const focus = (event: FocusEvent) => {
          const group = (event.target as HTMLElement)?.closest<HTMLElement>('[data-reveal]')
          if (group && (event.target as HTMLElement).matches(':focus-visible')) reveal(group, true)
        }
        root.addEventListener('focusin', focus)
        return () => {
          animations.forEach((animation) => animation.kill())
          observer.disconnect()
          root.removeEventListener('focusin', focus)
        }
      })
      return () => media.revert()
    },
    { scope, dependencies: [ready, route], revertOnUpdate: true },
  )
}
