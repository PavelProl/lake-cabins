const locks = new WeakMap<HTMLElement, { count: number; overflow: string }>()

export function lockPageScroll() {
  const root = document.documentElement
  let state = locks.get(root)
  if (!state) {
    state = { count: 0, overflow: root.style.overflow }
    locks.set(root, state)
  }
  state.count += 1
  root.style.overflow = 'hidden'
  let released = false

  return () => {
    if (released) return
    released = true
    state.count -= 1
    if (state.count === 0) {
      root.style.overflow = state.overflow
      locks.delete(root)
    }
  }
}
