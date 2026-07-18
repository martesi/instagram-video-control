export function fmt(s: number) {
  const m = Math.floor(s / 60)
  return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`
}

export function shouldHideBehindModal(video: HTMLVideoElement) {
  const dialogs = document.querySelectorAll('[role="dialog"]')
  for (const d of dialogs) {
    if (d.contains(video)) return false
    const cs = getComputedStyle(d)
    if (cs.display === 'none' || cs.visibility === 'hidden') continue
    const r = d.getBoundingClientRect()
    if (
      r.width > window.innerWidth * 0.5 &&
      r.height > window.innerHeight * 0.5
    )
      return true
  }
  return false
}

export function findIgOverlayWrapper(
  video: HTMLVideoElement,
  selector: string,
  position: string
): HTMLElement | null {
  let el = video.parentElement
  for (
    let i = 0;
    i < 10 && el && el !== document.body;
    i++, el = el.parentElement
  ) {
    let btn = el.querySelector(selector) as HTMLElement | null

    if (!btn) {
      const buttons = el.querySelectorAll('button, [role="button"]')
      const videoRect = video.getBoundingClientRect()
      if (videoRect.width > 0 && videoRect.height > 0) {
        for (const b of buttons) {
          if (video._igVcBar?.contains(b)) continue
          const bRect = b.getBoundingClientRect()
          if (bRect.width === 0 || bRect.height === 0) continue

          const bCenterX = bRect.left + bRect.width / 2
          const bCenterY = bRect.top + bRect.height / 2
          const videoCenterX = videoRect.left + videoRect.width / 2
          const videoCenterY = videoRect.top + videoRect.height / 2

          if (
            position === 'bottom-right' &&
            bCenterX > videoCenterX &&
            bCenterY > videoCenterY
          ) {
            btn = b as HTMLElement
            break
          }
          if (
            position === 'bottom-left' &&
            bCenterX < videoCenterX &&
            bCenterY > videoCenterY
          ) {
            btn = b as HTMLElement
            break
          }
        }
      }
    }

    if (btn) {
      let curr = btn
      for (let j = 0; j < 3; j++) {
        const parent = curr.parentElement
        if (
          !parent ||
          parent === video.parentElement ||
          parent.contains(video) ||
          parent === document.body
        ) {
          break
        }
        const rect = parent.getBoundingClientRect()
        if (rect.width === 0 || (rect.width <= 60 && rect.height <= 60)) {
          curr = parent
        } else {
          break
        }
      }
      return curr
    }
  }
  return null
}

export function findIgMuteWrapper(video: HTMLVideoElement) {
  return findIgOverlayWrapper(video, '[aria-label*="ute" i]', 'bottom-right')
}

export function findIgUsersWrapper(video: HTMLVideoElement) {
  return findIgOverlayWrapper(
    video,
    '[aria-label*="people" i], [aria-label*="tag" i]',
    'bottom-left'
  )
}
