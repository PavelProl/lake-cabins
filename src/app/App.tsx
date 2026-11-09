import { useCallback, useLayoutEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, Route, Routes, matchPath, useLocation } from 'react-router'
import { findHouse } from '../data/houses'
import { Arrow } from '../components/Arrow'
import { HousesPage } from '../pages/HousesPage'
import { HousePage } from '../pages/HousePage'
import { HouseTransition } from '../transitions/HouseTransition'
import { measureVisual } from '../transitions/geometry'
import type { TransitionRequest } from '../transitions/HouseTransition'
import styles from './App.module.css'

function houseAt(path: string) {
  return findHouse(matchPath('/houses/:id', path)?.params.id)
}

export function App() {
  const location = useLocation()
  const [displayedLocation, setDisplayedLocation] = useState(location)
  const [transition, setTransition] = useState<TransitionRequest | null>(null)
  const visualRef = useRef<HTMLDivElement>(null)
  const returnScroll = useRef<number | null>(null)
  const busy = transition !== null
  const displayedHouse = houseAt(displayedLocation.pathname)

  /* eslint-disable react-hooks/set-state-in-effect */
  useLayoutEffect(() => {
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
      if (closing) setDisplayedLocation(location)
    } else {
      setDisplayedLocation(location)
      if (displayedLocation.pathname !== location.pathname)
        window.scrollTo({ top: 0, behavior: 'instant' })
    }
  }, [location, displayedLocation, displayedHouse, transition])
  /* eslint-enable react-hooks/set-state-in-effect */

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
      ? `${displayedHouse.name} — Домики у озера`
      : 'Домики у озера — прототип'
  }, [displayedHouse])

  return (
    <div className={styles.app} data-transition-phase={transition?.direction ?? 'idle'}>
      <a className="skip-link" href="#main">
        Перейти к содержимому
      </a>
      <header
        className={`${styles.header} ${displayedHouse || displayedLocation.pathname === '/' ? styles.overImage : ''}`}
      >
        <Link
          to="/"
          className={styles.brand}
          onClick={(event) => {
            if (busy) event.preventDefault()
          }}
          aria-label="Домики у озера — главная"
        >
          <span className={styles.symbol} aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span>
            домики
            <br />у озера
          </span>
        </Link>
        <span className={styles.prototype}>Визуальный прототип</span>
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
      {transition && (
        <HouseTransition
          request={transition}
          destinationRef={visualRef}
          onComplete={completeTransition}
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
