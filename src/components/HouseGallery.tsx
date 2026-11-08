import { useCallback, useEffect, useRef, useState } from 'react'
import type { House } from '../data/houses'
import { Arrow } from './Arrow'
import { PhotoViewer } from './PhotoViewer'
import styles from './HouseGallery.module.css'

export function HouseGallery({ house }: { house: House }) {
  const rail = useRef<HTMLDivElement>(null)
  const [openedPhoto, setOpenedPhoto] = useState<number | null>(null)
  const sourceAt = useCallback(
    (index: number) => rail.current?.children[index]?.querySelector('button') ?? undefined,
    [],
  )
  const closeViewer = useCallback(() => setOpenedPhoto(null), [])
  const [navigation, setNavigation] = useState({
    active: 0,
    canPrevious: false,
    canNext: house.gallery.length > 1,
  })

  useEffect(() => {
    const element = rail.current
    if (!element) return

    function refresh() {
      if (!element) return
      const { active, maximum } = measureGallery(element)
      const canPrevious = element.scrollLeft > 2
      const canNext = element.scrollLeft < maximum - 2
      setNavigation((current) => {
        const next = {
          active,
          canPrevious,
          canNext,
        }
        return next.active === current.active &&
          next.canPrevious === current.canPrevious &&
          next.canNext === current.canNext
          ? current
          : next
      })
    }

    const observer = new ResizeObserver(refresh)
    observer.observe(element)
    Array.from(element.children).forEach((photo) => observer.observe(photo))
    element.addEventListener('scroll', refresh, { passive: true })
    return () => {
      observer.disconnect()
      element.removeEventListener('scroll', refresh)
    }
  }, [house.gallery.length])

  function move(step: number) {
    const element = rail.current
    if (!element) return
    const { stops, maximum } = measureGallery(element)
    const left =
      step > 0
        ? (stops.find((position) => position > element.scrollLeft + 2) ?? maximum)
        : (stops
            .slice()
            .reverse()
            .find((position) => position < element.scrollLeft - 2) ?? 0)
    element.scrollTo({
      left,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
    })
  }

  return (
    <section className={styles.gallery} aria-labelledby="gallery-heading">
      <div className={styles.heading}>
        <div>
          <p className="eyebrow">Внутри дома</p>
          <h2 id="gallery-heading">
            Рассмотреть
            <br />
            поближе.
          </h2>
        </div>
      </div>
      <div
        ref={rail}
        data-photo-rail
        className={styles.rail}
        tabIndex={0}
        role="region"
        aria-label="Фотографии интерьера, можно прокручивать по горизонтали"
      >
        {house.gallery.map((photo, index) => (
          <figure key={photo.src} className={styles.photo}>
            <button
              className={styles.openPhoto}
              aria-label={`Открыть фото: ${photo.alt}`}
              aria-haspopup="dialog"
              onClick={() => setOpenedPhoto(index)}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                loading="lazy"
                decoding="async"
                width={photo.width}
                height={photo.height}
              />
            </button>
            <figcaption>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {photo.alt.split(':')[0]}
            </figcaption>
          </figure>
        ))}
      </div>
      <div className={styles.controls}>
        <span className={styles.counter} aria-live="polite" title="Номер выбранной фотографии">
          {String(navigation.active + 1).padStart(2, '0')} /{' '}
          {String(house.gallery.length).padStart(2, '0')}
        </span>
        <button
          className="round-button"
          onClick={() => move(-1)}
          disabled={!navigation.canPrevious}
          aria-label="Предыдущее фото"
        >
          <Arrow direction="left" />
        </button>
        <button
          className="round-button"
          onClick={() => move(1)}
          disabled={!navigation.canNext}
          aria-label="Следующее фото"
        >
          <Arrow direction="right" />
        </button>
      </div>
      <p className={styles.note}>
        Здесь — настоящие фотографии интерьера, предоставленные для примера. Профессиональные
        фотографии появятся позже.
      </p>
      {openedPhoto !== null && (
        <PhotoViewer
          photos={house.gallery}
          initialIndex={openedPhoto}
          sourceAt={sourceAt}
          onClose={closeViewer}
        />
      )}
    </section>
  )
}

function measureGallery(element: HTMLDivElement) {
  const maximum = Math.max(0, element.scrollWidth - element.clientWidth)
  const centers = Array.from(element.children).map((photo) => {
    const box = photo.getBoundingClientRect()
    return box.left + box.width / 2
  })
  const first = centers[0] ?? 0
  const span = (centers.at(-1) ?? first) - first
  const stops = centers.map((center) => (span > 0 ? ((center - first) / span) * maximum : 0))
  let active = 0
  let nearestDistance = Infinity
  stops.forEach((position, index) => {
    const distance = Math.abs(position - element.scrollLeft)
    if (distance < nearestDistance) {
      nearestDistance = distance
      active = index
    }
  })

  return { active, stops, maximum }
}
