import styles from './AmenitiesRibbon.module.css'

const amenities = [
  'Wi-Fi',
  'Отопление',
  'Кухня',
  'Холодильник',
  'Терраса',
  'Утюг',
  'Домики у озера',
  'Прогулки на природе',
  'Время для близких',
  'Неспешные дни',
]

export function AmenitiesRibbon() {
  return (
    <div className={styles.ribbon} aria-label={`Удобства: ${amenities.join(', ')}`}>
      <div className={styles.track} aria-hidden="true">
        {[0, 1].map((copy) => (
          <div className={styles.group} key={copy}>
            {[...amenities, ...amenities].map((item, index) => (
              <span key={`${item}-${index}`} data-repeat={index >= amenities.length || undefined}>
                {item}
                <svg
                  viewBox="0 0 20 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                >
                  <path d="M7 22V3m6 19V1M4 22h12M7 9 3 6m10 0 4-3M7 16l4-3m2 5 4-3" />
                </svg>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
