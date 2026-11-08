interface ArrowProps {
  direction?: 'up-right' | 'left' | 'right' | 'down'
  className?: string
}

const rotations = { 'up-right': -45, left: 180, right: 0, down: 90 }

export function Arrow({ direction = 'up-right', className }: ArrowProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
    >
      <path d="M5 16H26M17 7L26 16L17 25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}
