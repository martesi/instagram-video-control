export {}

declare global {
  interface HTMLVideoElement {
    _igVcBar?: HTMLElement | null
    _igVcFsState?: {
      parent: HTMLElement | null
      next: Node | null
      wrap: HTMLDivElement
      origStyle: string
    } | null
  }

  interface HTMLElement {
    _reposition?: () => void
  }
}
