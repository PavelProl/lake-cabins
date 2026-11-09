import { useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import type { House } from '../data/houses'
import { lockPageScroll } from '../transitions/scrollLock'
import { Arrow } from './Arrow'
import styles from './PhotoViewer.module.css'

type Photo = House['gallery'][number]

interface PhotoViewerProps {
  photos: readonly Photo[]
  initialIndex: number
  sourceAt: (index: number) => HTMLButtonElement | undefined
  onClose: () => void
}

export function PhotoViewer({ photos, initialIndex, sourceAt, onClose }: PhotoViewerProps) {
  const [index, setIndex] = useState(initialIndex)
  const dialog = useRef<HTMLDialogElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const background = useRef<HTMLDivElement>(null)
  const controls = useRef<HTMLDivElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const footer = useRef<HTMLDivElement>(null)
  const controller = useRef<{ close: () => void; move: (step: number) => void } | null>(null)
  const photo = photos[index]

  useLayoutEffect(() => {
    const modal = dialog.current!
    const picture = image.current!
    const shade = background.current!
    const toolbar = controls.current!
    const body = document.body
    const scroll = { x: scrollX, y: scrollY }
    const bodyStyles = {
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    }
    const viewport = window.visualViewport
    const motion = matchMedia('(prefers-reduced-motion: reduce)')
    let current = initialIndex
    let phase: 'opening' | 'idle' | 'switching' | 'closing' = 'opening'
    let disposed = false
    let loading = false
    let pendingIndex: number | null = null
    let animation: gsap.core.Timeline | null = null
    let hiddenSource: HTMLButtonElement | undefined
    let previousVisibility = ''

    function setPhase(next: typeof phase) {
      phase = next
      modal.setAttribute('aria-busy', String(next !== 'idle'))
    }

    function revealSource() {
      if (hiddenSource) hiddenSource.style.visibility = previousVisibility
      hiddenSource = undefined
    }

    function hideSource() {
      revealSource()
      hiddenSource = sourceAt(current)
      if (hiddenSource) {
        previousVisibility = hiddenSource.style.visibility
        hiddenSource.style.visibility = 'hidden'
      }
    }

    function syncViewport() {
      // A zoomed mobile page has a smaller visible viewport than its layout viewport.
      if (!viewport) return
      Object.assign(modal.style, {
        left: `${viewport.offsetLeft}px`,
        top: `${viewport.offsetTop}px`,
        width: `${viewport.width}px`,
        height: `${viewport.height}px`,
        right: 'auto',
        bottom: 'auto',
      })
    }

    function fit() {
      const origin = modal.getBoundingClientRect()
      const top = closeButton.current!.getBoundingClientRect().bottom - origin.top + 16
      const bottom = footer.current!.getBoundingClientRect().top - origin.top - 16
      const sideSpace = matchMedia('(min-width: 701px)').matches ? 176 : 40
      const availableWidth = Math.max(1, modal.clientWidth - sideSpace)
      const availableHeight = Math.max(1, bottom - top)
      const item = photos[current]
      const scale = Math.min(availableWidth / item.width, availableHeight / item.height)
      const width = item.width * scale
      const height = item.height * scale
      return {
        left: (modal.clientWidth - width) / 2,
        top: top + (availableHeight - height) / 2,
        width,
        height,
        borderRadius: 0,
      }
    }

    function sourceBox() {
      const source = sourceAt(current)
      const rail = source?.closest<HTMLElement>('[data-photo-rail]')
      if (source && rail) {
        const box = source.getBoundingClientRect()
        const bounds = rail.getBoundingClientRect()
        const shift =
          box.left < bounds.left ? box.left - bounds.left : Math.max(0, box.right - bounds.right)
        rail.scrollTo({ left: rail.scrollLeft + shift, behavior: 'instant' })
      }
      const box = source?.querySelector('img')?.getBoundingClientRect()
      const origin = modal.getBoundingClientRect()
      return box
        ? {
            left: box.left - origin.left,
            top: box.top - origin.top,
            width: box.width,
            height: box.height,
            borderRadius: 14,
          }
        : fit()
    }

    function finishClose() {
      if (disposed) return
      onClose()
    }

    function close() {
      if (disposed || phase === 'closing') return
      setPhase('closing')
      animation?.kill()
      const target = sourceBox()
      animation = gsap.timeline({ onComplete: finishClose })
      animation.to(toolbar, { opacity: 0, duration: motion.matches ? 0 : 0.15 }, 0)
      animation.to(shade, { opacity: 0, duration: motion.matches ? 0 : 0.4 }, 0)
      animation.to(
        picture,
        { ...target, opacity: 1, duration: motion.matches ? 0 : 0.45, ease: 'power2.inOut' },
        0,
      )
    }

    function selectPhoto(next: number) {
      current = next
      pendingIndex = null
      const focused = document.activeElement
      flushSync(() => setIndex(next))
      if (
        (focused instanceof HTMLButtonElement && focused.disabled) ||
        !modal.contains(document.activeElement)
      )
        modal.querySelector<HTMLButtonElement>('button')?.focus()
      hideSource()
      gsap.set(picture, fit())
    }

    const isSwitching = () => phase === 'switching'

    async function move(step: number) {
      if (phase === 'opening') settle()
      if (disposed || phase !== 'idle') return
      const next = current + step
      if (next < 0 || next >= photos.length) return
      setPhase('switching')
      pendingIndex = next
      loading = true
      const preload = new Image()
      preload.src = photos[next].src
      try {
        await preload.decode()
      } catch {
        // Keep the current photo usable when the next file cannot be loaded.
        pendingIndex = null
        if (!disposed && isSwitching()) setPhase('idle')
        return
      } finally {
        loading = false
      }
      if (disposed || !isSwitching()) return
      animation = gsap.timeline({
        onComplete: () => {
          setPhase('idle')
        },
      })
      animation.to(picture, { opacity: 0, duration: motion.matches ? 0 : 0.12 })
      animation.call(() => selectPhoto(next))
      animation.to(picture, { opacity: 1, duration: motion.matches ? 0 : 0.18 })
    }

    function settle() {
      if (disposed) return
      syncViewport()
      animation?.kill()
      if (phase === 'closing') {
        finishClose()
        return
      }
      if (!loading && pendingIndex !== null) selectPhoto(pendingIndex)
      // A media/resize event must not discard a photo that is still decoding.
      if (!loading) setPhase('idle')
      gsap.set(picture, { ...fit(), opacity: 1 })
      gsap.set([shade, toolbar], { opacity: 1 })
    }

    modal.showModal()
    setPhase('opening')
    const releaseScroll = lockPageScroll()
    body.style.position = 'fixed'
    body.style.top = `${-scroll.y}px`
    body.style.width = '100%'
    syncViewport()
    gsap.set(picture, sourceBox())
    hideSource()
    gsap.set([shade, toolbar], { opacity: 0 })
    animation = gsap.timeline({
      onComplete: () => {
        setPhase('idle')
      },
    })
    animation.to(picture, { ...fit(), duration: motion.matches ? 0 : 0.5, ease: 'power2.inOut' }, 0)
    animation.to(shade, { opacity: 1, duration: motion.matches ? 0 : 0.4 }, 0)
    animation.to(
      toolbar,
      { opacity: 1, duration: motion.matches ? 0 : 0.2 },
      motion.matches ? 0 : 0.3,
    )
    controller.current = { close, move }
    window.addEventListener('resize', settle)
    viewport?.addEventListener('resize', settle)
    viewport?.addEventListener('scroll', settle)
    motion.addEventListener('change', settle)
    return () => {
      disposed = true
      controller.current = null
      animation?.kill()
      window.removeEventListener('resize', settle)
      viewport?.removeEventListener('resize', settle)
      viewport?.removeEventListener('scroll', settle)
      motion.removeEventListener('change', settle)
      revealSource()
      modal.close()
      releaseScroll()
      Object.assign(body.style, bodyStyles)
      window.scrollTo({ left: scroll.x, top: scroll.y, behavior: 'instant' })
      sourceAt(current)?.focus({ preventScroll: true })
    }
  }, [initialIndex, photos, sourceAt, onClose])

  const pointer = useRef<{ id: number; x: number; y: number } | null>(null)

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Просмотр фотографий дома"
      onCancel={(event) => {
        event.preventDefault()
        controller.current?.close()
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          event.preventDefault()
          controller.current?.close()
        }
        if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
          event.preventDefault()
          controller.current?.move(event.key === 'ArrowRight' ? 1 : -1)
        }
        if (event.key === 'Tab') {
          const buttons = Array.from(
            event.currentTarget.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
          )
          const first = buttons[0]
          const last = buttons.at(-1)
          if (event.shiftKey && document.activeElement === first) {
            event.preventDefault()
            last?.focus()
          } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault()
            first?.focus()
          }
        }
      }}
    >
      <div ref={background} className={styles.background} />
      <div
        className={styles.gesture}
        onPointerDown={(event) => {
          if (!event.isPrimary || event.pointerType === 'mouse') return
          pointer.current = { id: event.pointerId, x: event.clientX, y: event.clientY }
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={(event) => {
          const start = pointer.current
          pointer.current = null
          if (!start || start.id !== event.pointerId) return
          const dx = event.clientX - start.x
          const dy = event.clientY - start.y
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5)
            controller.current?.move(dx < 0 ? 1 : -1)
        }}
        onPointerCancel={() => {
          pointer.current = null
        }}
      >
        <img
          ref={image}
          className={styles.image}
          src={photo.src}
          alt={photo.alt}
          draggable={false}
        />
      </div>
      <div ref={controls} className={styles.controls}>
        <button
          ref={closeButton}
          className={styles.close}
          autoFocus
          onClick={() => controller.current?.close()}
          aria-label="Закрыть просмотр"
        >
          ✕
        </button>
        <div ref={footer} className={styles.bottom}>
          <p className={styles.caption} aria-live="polite">
            <span>
              {String(index + 1).padStart(2, '0')} / {String(photos.length).padStart(2, '0')}
            </span>
            {photo.caption}
          </p>
          <div className={styles.navigation}>
            <button
              className="round-button"
              disabled={index === 0}
              onClick={() => controller.current?.move(-1)}
              aria-label="Предыдущая фотография"
            >
              <Arrow direction="left" />
            </button>
            <button
              className="round-button"
              disabled={index === photos.length - 1}
              onClick={() => controller.current?.move(1)}
              aria-label="Следующая фотография"
            >
              <Arrow direction="right" />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  )
}
