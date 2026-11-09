import type { RefObject } from 'react'
import { houses } from '../data/houses'
import { RevealHeading } from '../components/RevealHeading'
import { HouseCard } from '../components/HouseCard'
import { ContactLinks } from '../components/ContactLinks'
import { mapEmbedUrl, mapUrl, routeUrl } from '../data/site'
import { Arrow } from '../components/Arrow'
import heroConcept from '../assets/large-house/cover-concept.jpg'
import styles from './HousesPage.module.css'

interface HousesPageProps {
  visualRef: RefObject<HTMLDivElement | null>
  activeHouseId?: string
  busy: boolean
}

export function HousesPage({ visualRef, activeHouseId, busy }: HousesPageProps) {
  return (
    <>
      <section className={styles.intro} aria-labelledby="intro-heading">
        <img
          className={styles.introImage}
          src={heroConcept}
          alt="Сгенерированная концепция бревенчатого дома в лесу у озера"
          width={1672}
          height={941}
          fetchPriority="high"
        />
        <p className={`eyebrow ${styles.location}`}>Роща · Красноярский край · Озеро Парное</p>
        <h1 id="intro-heading">
          Неспешные
          <br />
          <span>дни у озера.</span>
        </h1>
        <p className={styles.introDescription}>
          Домики у озера, где можно выдохнуть,
          <br />
          побыть с близкими и услышать тишину.
        </p>
        <ContactLinks reveal={false} />
        <div className={styles.introBottom}>
          <a className={styles.scrollLink} href="#houses" aria-label="Перейти к домам">
            <Arrow direction="down" />
            <span>Найти свой домик</span>
          </a>
          <p>
            Приезжайте за спокойствием.
            <br />
            Остальное подождёт.
          </p>
        </div>
        <p className={styles.concept}>Концепция · сгенерированное изображение</p>
      </section>
      <div
        className={styles.marquee}
        aria-label="Тишина у озера · Домики среди природы · Время для близких · Баня · Сапы · Прогулки на природе · Неспешные дни"
      >
        <div className={styles.marqueeTrack} aria-hidden="true">
          {[0, 1].map((copy) => (
            <div className={styles.marqueeGroup} key={copy}>
              {[
                'Тишина у озера',
                'Домики среди природы',
                'Время для близких',
                'Баня',
                'Сапы',
                'Прогулки на природе',
                'Неспешные дни',
              ].map((word) => (
                <span className={styles.marqueeItem} key={word}>
                  {word}
                  <svg
                    viewBox="0 0 28 30"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <path d="M9 28V3m8 25V1M6 28h15M9 8l-4-3m4 9 4-3m4-5 4-3m-4 11-4-3m4 9 5-3M9 22l-4-3" />
                  </svg>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <section className={styles.place} aria-labelledby="place-heading">
        <p className="eyebrow" data-reveal>
          О месте
        </p>
        <div className={styles.placeBody}>
          <RevealHeading id="place-heading" lines={['Оставьте суету.', 'Побудьте здесь.']} />
          <div>
            <p data-reveal>
              «Роща» — домики у озера Парное в Красноярском крае. Для утра без будильника, долгих
              разговоров и отдыха на природе.
            </p>
            <p data-reveal>
              Большая усадьба, дом с собственной баней или один из двух маленьких домов — выберите
              пространство под свой отдых. Интерьеры и благоустройство продуманы хозяйкой — с
              заботой о спокойном отдыхе у озера.
            </p>
          </div>
        </div>
      </section>
      <section id="houses" className={styles.houses} aria-labelledby="houses-heading">
        <div className={styles.sectionHeading}>
          <h2 id="houses-heading">Выберите свой домик</h2>
          <span>Три типа домов</span>
        </div>
        {houses.map((house, index) => (
          <div key={house.id} className={styles.houseEntry}>
            <HouseCard
              house={house}
              visualRef={house.id === activeHouseId ? visualRef : undefined}
              busy={busy}
              hidden={busy && house.id === activeHouseId}
            />
            <p className={styles.caption}>
              <span>
                {String(index + 1).padStart(2, '0')} / {String(houses.length).padStart(2, '0')} —{' '}
                {house.name}
              </span>
              <span>
                Открыть и рассмотреть <Arrow />
              </span>
            </p>
          </div>
        ))}
      </section>
      <section id="location" className={styles.locationSection} aria-labelledby="location-heading">
        <div className={styles.locationInfo}>
          <p className="eyebrow" data-reveal>
            Как нас найти
          </p>
          <RevealHeading id="location-heading" lines={['Встретимся', 'у озера.']} />
          <p data-reveal>
            Красноярский край, Шарыповский муниципальный округ, Берендейка, квартал 63.
          </p>
          <p data-reveal>
            Перед поездкой свяжитесь с нами — подскажем дорогу и договоримся о встрече.
          </p>
          <a className="text-link" href={routeUrl} target="_blank" rel="noopener noreferrer">
            Построить маршрут ↗
          </a>
          <a className="text-link" href={mapUrl} target="_blank" rel="noopener noreferrer">
            Открыть «Рощу» на Яндекс Картах ↗
          </a>
        </div>
        <iframe
          className={styles.map}
          src={mapEmbedUrl}
          title="Роща — расположение домиков у озера Парное на Яндекс Картах"
          loading="lazy"
          allowFullScreen
        />
      </section>
      <section className={styles.invitation} aria-labelledby="contact-heading">
        <p className="eyebrow" data-reveal>
          Пора на природу
        </p>
        <RevealHeading id="contact-heading" lines={['Ваши тихие дни', 'начинаются со звонка.']} />
        <p data-reveal>Подскажем свободные даты, стоимость и поможем выбрать домик у озера.</p>
        <ContactLinks />
      </section>
    </>
  )
}
