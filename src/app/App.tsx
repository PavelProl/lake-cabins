import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import gsap from 'gsap'
import { Link, Route, Routes, matchPath, useLocation } from 'react-router'
import { findHouse } from '../data/houses'
import { Arrival } from '../components/Arrival'
import { AmbientSound } from '../components/AmbientSound'
import { SiteFooter } from '../components/SiteFooter'
import { contacts } from '../data/site'
import { Arrow } from '../components/Arrow'
import { HousesPage } from '../pages/HousesPage'
import { HousePage } from '../pages/HousePage'
import { HouseTransition } from '../transitions/HouseTransition'
import { useScrollReveal } from '../transitions/useScrollReveal'
import { measureVisual } from '../transitions/geometry'
import type { TransitionRequest } from '../transitions/HouseTransition'
import styles from './App.module.css'

function houseAt(path: string) {
  return findHouse(matchPath('/houses/:id', path)?.params.id)
}

export function App() {
  const location = useLocation()
  const appRef = useRef<HTMLDivElement>(null)
  const soundButton = useRef<HTMLButtonElement>(null)
  const [soundHint, setSoundHint] = useState(false)
  const hideSoundHint = useCallback(() => setSoundHint(false), [])
  const [arriving, setArriving] = useState(true)
  const finishArrival = useCallback(() => setArriving(false), [])
  const [displayedLocation, setDisplayedLocation] = useState(location)
  const [scrolled, setScrolled] = useState(() => window.scrollY > 48)
  const [transition, setTransition] = useState<TransitionRequest | null>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const returnScroll = useRef<number | null>(null)
  const busy = transition !== null
  const showSoundHint = useCallback(() => {
    if (!busy && !arriving) setSoundHint(true)
  }, [busy, arriving])
  const displayedHouse = houseAt(displayedLocation.pathname)
  useScrollReveal(appRef, true, displayedLocation.pathname)

  useEffect(() => {
    const updateHeader = () => setScrolled(window.scrollY > 48)
    window.addEventListener('scroll', updateHeader, { passive: true })
    return () => window.removeEventListener('scroll', updateHeader)
  }, [])

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
    if (location.key !== displayedLocation.key && (arriving || soundHint)) {
      setArriving(false)
      setSoundHint(false)
      setTransition(null)
      setDisplayedLocation(location)
      window.scrollTo({ top: 0, behavior: 'instant' })
      return
    }
    if (transition?.destination.key === location.key) return

    if (transition) {
      setTransition(null)
      setDisplayedLocation(location)
      const cancelledOpening =
        transition.direction === 'opening' && location.key === displayedLocation.key
      window.scrollTo({
        top: cancelledOpening ? (transition.returnScroll ?? 0) : 0,
        behavior: 'instant',
      })
      if (cancelledOpening)
        document.getElementById(`house-${transition.house.id}`)?.focus({ preventScroll: true })
      return
    }
    if (location.key === displayedLocation.key) return

    const nextHouse = houseAt(location.pathname)
    const opening = displayedLocation.pathname === '/' && nextHouse
    const closing = displayedHouse && location.pathname === '/'
    const source = opening
      ? document
          .getElementById(`house-${nextHouse.id}`)
          ?.querySelector<HTMLElement>('[data-house-visual]')
      : visualRef.current

    if (source && (opening || closing)) {
      if (opening) returnScroll.current = window.scrollY
      const box = measureVisual(source)
      if (closing && box.top < -20) {
        box.top = 0
        box.height = innerHeight
      }
      setTransition({
        direction: opening ? 'opening' : 'closing',
        house: nextHouse ?? displayedHouse!,
        from: box,
        destination: location,
        returnScroll: returnScroll.current,
      })
    } else {
      setDisplayedLocation(location)
      if (displayedLocation.pathname !== location.pathname)
        window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location, displayedLocation, displayedHouse, transition, arriving, soundHint])
  /* eslint-enable react-hooks/set-state-in-effect */

  const coverReturn = useCallback(() => {
    if (!transition || transition.direction !== 'closing') return
    flushSync(() => setDisplayedLocation(transition.destination))
    if (transition.returnScroll !== null)
      window.scrollTo({ top: transition.returnScroll, behavior: 'instant' })
    else
      document
        .getElementById(`house-${transition.house.id}`)
        ?.scrollIntoView({ block: 'center', behavior: 'instant' })
  }, [transition])

  const completeTransition = useCallback(() => {
    if (!transition) return
    const opening = transition.direction === 'opening'
    if (opening) {
      flushSync(() => setDisplayedLocation(transition.destination))
      window.scrollTo({ top: 0, behavior: 'instant' })
    }
    setTransition(null)
    requestAnimationFrame(() => {
      const target = opening
        ? visualRef.current?.querySelector<HTMLElement>('h1')
        : document.getElementById(`house-${transition.house.id}`)
      target?.focus({ preventScroll: true })
    })
  }, [transition])

  useLayoutEffect(() => {
    document.title = displayedHouse
      ? `${displayedHouse.name} — Роща · домики у озера`
      : 'Роща — домики у озера Парное'
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        'content',
        displayedHouse?.description ??
          'Роща — домики у озера Парное в Красноярском крае. Спокойный отдых на природе в домиках у озера. Позвоните, чтобы узнать свободные даты.',
      )
  }, [displayedHouse])

  useEffect(() => {
    if (busy || !displayedLocation.hash) return
    let animation: gsap.core.Tween | undefined
    const cancel = () => animation?.kill()
    const keyCancel = (event: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key))
        cancel()
    }
    const frame = requestAnimationFrame(() => {
      const section = document.getElementById(displayedLocation.hash.slice(1))
      if (!section) return
      const margin = parseFloat(getComputedStyle(section).scrollMarginTop) || 0
      const top = Math.max(
        0,
        Math.min(
          section.getBoundingClientRect().top + scrollY - margin,
          document.documentElement.scrollHeight - innerHeight,
        ),
      )
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
        window.scrollTo({ top, behavior: 'instant' })
        return
      }
      const position = { y: scrollY }
      animation = gsap.to(position, {
        y: top,
        duration: Math.min(1.6, 0.65 + Math.abs(top - scrollY) / 1800),
        ease: 'power2.inOut',
        onUpdate: () => window.scrollTo({ top: position.y, behavior: 'instant' }),
      })
    })
    window.addEventListener('wheel', cancel, { passive: true })
    window.addEventListener('touchstart', cancel, { passive: true })
    window.addEventListener('keydown', keyCancel)
    return () => {
      cancelAnimationFrame(frame)
      cancel()
      window.removeEventListener('wheel', cancel)
      window.removeEventListener('touchstart', cancel)
      window.removeEventListener('keydown', keyCancel)
    }
  }, [busy, displayedLocation])

  return (
    <div
      ref={appRef}
      className={styles.app}
      data-transition-phase={transition?.direction ?? 'idle'}
    >
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <header
        className={`${styles.header} ${!scrolled && (displayedHouse || displayedLocation.pathname === '/') ? styles.overImage : styles.solidHeader}`}
      >
        <Link
          to="/"
          className={styles.brand}
          onClick={(event) => {
            if (busy) event.preventDefault()
          }}
          aria-label="Роща — главная"
        >
          <svg
            className={styles.symbol}
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M9 30 32 10l23 20M16 26v24h32V26M40 17v-7h7v13" />
            <path d="M27 50V35h10v15M9 57c8-4 15 4 23 0s15 4 23 0" />
            <path d="M22 27h6v6h-6z" />
          </svg>
          <span>
            Роща<small>домики у озера</small>
          </span>
        </Link>
        <AmbientSound buttonRef={soundButton} />
        <a className={styles.call} href={contacts.primary.tel}>
          Позвонить
        </a>
        {displayedHouse ? (
          <Link
            to="/"
            className={styles.nav}
            onClick={(event) => {
              if (busy) event.preventDefault()
            }}
          >
            <Arrow direction="left" />
            <span>Все дома</span>
          </Link>
        ) : (
          <a href="#houses" className={styles.nav}>
            <span>Выбрать дом</span>
            <Arrow />
          </a>
        )}
      </header>
      <main id="main" tabIndex={-1} aria-busy={busy}>
        <Routes location={displayedLocation}>
          <Route
            path="/"
            element={
              <HousesPage visualRef={visualRef} activeHouseId={transition?.house.id} busy={busy} />
            }
          />
          <Route
            path="/houses/:id"
            element={
              displayedHouse ? (
                <HousePage
                  key={displayedHouse.id}
                  house={displayedHouse}
                  visualRef={visualRef}
                  hidden={busy}
                />
              ) : (
                <MissingHouse />
              )
            }
          />
          <Route path="*" element={<MissingHouse />} />
        </Routes>
      </main>
      <SiteFooter onSoundHint={showSoundHint} />
      {arriving && <Arrival soundButton={soundButton} onDone={finishArrival} />}
      {soundHint && !arriving && (
        <Arrival hintOnly soundButton={soundButton} onDone={hideSoundHint} />
      )}
      {transition && (
        <HouseTransition
          request={transition}
          onComplete={completeTransition}
          onCovered={coverReturn}
        />
      )}
    </div>
  )
}

function MissingHouse() {
  return (
    <section className={styles.missing}>
      <p className="eyebrow">Домики у озера</p>
      <h1>
        Этой страницы
        <br />
        пока нет.
      </h1>
      <Link to="/">
        Вернуться к домам <Arrow direction="left" />
      </Link>
    </section>
  )
}
