import styles from './RevealHeading.module.css'

export function RevealHeading({ lines, id }: { lines: string[]; id: string }) {
  return (
    <h2 id={id} data-reveal aria-label={lines.join(' ')}>
      {lines.map((line) => (
        <span className={styles.mask} key={line} aria-hidden="true">
          <span data-reveal-line>{line}</span>
        </span>
      ))}
    </h2>
  )
}
