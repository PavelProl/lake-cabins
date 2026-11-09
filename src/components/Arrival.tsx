import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { RefObject } from 'react'
import { lockPageScroll } from '../transitions/scrollLock'
import styles from './Arrival.module.css'

const storageKey = 'roshcha-sound-intro'

function firstVisit() {
  try {
    return localStorage.getItem(storageKey) !== 'seen'
  } catch {
    return true
  }
}

export function Arrival({
  soundButton,
  onDone,
  hintOnly = false,
}: {
  soundButton: RefObject<HTMLButtonElement | null>
  onDone: () => void
  hintOnly?: boolean
}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const skip = useRef<HTMLButtonElement>(null)
  const [first] = useState(firstVisit)
  const [phase, setPhase] = useState<'loading' | 'revealing' | 'hint'>(
    hintOnly ? 'hint' : 'loading',
  )
  const [anchor, setAnchor] = useState<DOMRect | null>(null)

  function finish(withSound = false) {
    try {
      localStorage.setItem(storageKey, 'seen')
    } catch {
      /* Storage can be unavailable in private mode. */
    }
    if (withSound && soundButton.current?.getAttribute('aria-pressed') !== 'true')
      soundButton.current?.click()
    onDone()
    queueMicrotask(() => soundButton.current?.focus({ preventScroll: true }))
  }

  useLayoutEffect(() => {
    const modal = dialog.current!
    const releaseScroll = lockPageScroll()
    modal.showModal()
    return () => {
      modal.close()
      releaseScroll()
    }
  }, [])

  useEffect(() => {
    if (hintOnly) return
    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []
    const delay = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms))
      })
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
    const image = document.querySelector<HTMLImageElement>('main img')
    const resources = Promise.allSettled([
      document.fonts.ready,
      image?.decode(),
      delay(reduced ? 0 : 1500),
    ])
    void Promise.race([resources, delay(3000)]).then(async () => {
      if (cancelled) return
      setPhase('revealing')
      await delay(reduced ? 0 : 1100)
      if (cancelled) return
      if (first) setPhase('hint')
      else onDone()
    })
    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [first, onDone, hintOnly])

  useLayoutEffect(() => {
    if (phase !== 'hint') return
    const update = () => setAnchor(soundButton.current?.getBoundingClientRect() ?? null)
    update()
    skip.current?.focus({ preventScroll: true })
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [phase, soundButton])

  const panelLeft = anchor ? Math.max(16, Math.min(anchor.right - 280, innerWidth - 296)) : 16

  return (
    <dialog
      ref={dialog}
      className={styles.dialog}
      aria-label="Добро пожаловать в Рощу"
      onCancel={(event) => {
        event.preventDefault()
        finish()
      }}
    >
      {phase !== 'hint' && (
        <div
          className={`${styles.loader} ${phase === 'revealing' ? styles.revealing : ''}`}
          aria-label="Загрузка сайта"
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth=".7"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 30 32 10l23 20M16 26v24h32V26M27 50V35h10v15M9 57c8-4 15 4 23 0s15 4 23 0M22 27h6v6h-6z" />
          </svg>
          <p>
            Роща<span>домики у озера</span>
          </p>
        </div>
      )}
      {phase === 'hint' && (
        <>
          {anchor && (
            <>
              <div
                className={styles.spotlight}
                style={{
                  left: anchor.left - 7,
                  top: anchor.top - 7,
                  width: anchor.width + 14,
                  height: anchor.height + 14,
                }}
              />
              <button
                className={styles.target}
                style={{
                  left: anchor.left,
                  top: anchor.top,
                  width: anchor.width,
                  height: anchor.height,
                }}
                onClick={() => finish(true)}
                aria-label="Включить звуки природы и продолжить"
              />
            </>
          )}
          <div
            className={styles.panel}
            style={{ left: panelLeft, top: (anchor?.bottom ?? 80) + 24 }}
          >
            <p>Хотите чуть больше атмосферы? Включите звуки природы.</p>
            <button
              ref={skip}
              className={styles.skip}
              onClick={() => finish()}
              aria-label="Продолжить без звука"
            >
              ×
            </button>
          </div>
        </>
      )}
    </dialog>
  )
}
