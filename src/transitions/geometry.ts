export interface Box {
  left: number
  top: number
  width: number
  height: number
  borderRadius: string
}

export function measureVisual(element: HTMLElement): Box {
  const rect = element.getBoundingClientRect()
  return {
    left: rect.left,
    top: rect.top,
    width: rect.width,
    height: rect.height,
    borderRadius: getComputedStyle(element).borderRadius,
  }
}
