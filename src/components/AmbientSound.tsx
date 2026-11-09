import { useRef, useState } from 'react'
import type { Ref } from 'react'
import ambience from '../assets/audio/forest-ambience.mp3'
import styles from './AmbientSound.module.css'

// Forest Ambience — TinyWorlds, CC0. Source and license:
// https://opengameart.org/content/forest-ambience
export function AmbientSound({ buttonRef }: { buttonRef?: Ref<HTMLButtonElement> }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const pending = useRef(false)
  const [playing, setPlaying] = useState(false)
  const [failed, setFailed] = useState(false)

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return
    setFailed(false)
    if (!audio.paused) {
      audio.pause()
      return
    }
    if (pending.current) return
    pending.current = true
    audio.volume = 0.3
    try {
      await audio.play()
    } catch (error) {
      if (!(error instanceof DOMException && error.name === 'AbortError')) setFailed(true)
    } finally {
      pending.current = false
    }
  }

  const label = failed
    ? 'Не удалось включить звук. Попробовать ещё раз'
    : playing
      ? 'Выключить звуки природы'
      : 'Включить звуки природы'

  return (
    <div className={styles.sound}>
      <button
        ref={buttonRef}
        className={styles.toggle}
        type="button"
        onClick={toggle}
        aria-label={label}
        aria-pressed={playing}
        title={label}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m4 9 4 0 5-4v14l-5-4H4z" />
          {playing ? (
            <path d="M16 8c2 2 2 6 0 8m3-11c4 4 4 10 0 14" />
          ) : (
            <path d="m17 10 4 4m0-4-4 4" />
          )}
        </svg>
        <span>{failed ? 'Повторить' : playing ? 'Выключить звук' : 'Звуки природы'}</span>
      </button>
      <audio
        ref={audioRef}
        src={ambience}
        loop
        preload="none"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onError={() => {
          setPlaying(false)
          setFailed(true)
        }}
      />
      <span className={styles.status} role="status">
        {failed ? 'Звук недоступен. Попробуйте включить его ещё раз.' : ''}
      </span>
    </div>
  )
}
