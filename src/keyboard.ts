import { enterVideoFullscreen } from './fullscreen'
import { toggleMute, unmute } from './mute'

export function getClosestVideo(): HTMLVideoElement | null {
  let closest: HTMLVideoElement | null = null
  let minDist = Infinity
  document.querySelectorAll('video').forEach((v) => {
    const r = v.getBoundingClientRect()
    const d = Math.hypot(
      window.innerWidth / 2 - (r.left + r.width / 2),
      window.innerHeight / 2 - (r.top + r.height / 2)
    )
    if (d < minDist) {
      minDist = d
      closest = v
    }
  })
  return closest
}

export function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const el = document.activeElement as HTMLElement | null
    if (
      el &&
      (el.tagName === 'INPUT' ||
        el.tagName === 'TEXTAREA' ||
        el.isContentEditable)
    )
      return
    const video: HTMLVideoElement | null = getClosestVideo()
    if (!video) return
    switch (e.key) {
      case 'f':
        if (document.fullscreenElement) {
          document.exitFullscreen()
        } else {
          enterVideoFullscreen(video)
        }
        break
      case 'm':
        toggleMute(video)
        break
      case 'k':
        video.paused ? video.play() : video.pause()
        setTimeout(() => unmute(video), 100)
        break
      case 'j':
        video.currentTime = Math.max(0, video.currentTime - 10)
        break
      case 'l':
        video.currentTime = Math.min(video.duration, video.currentTime + 10)
        break
      case ',':
        video.pause()
        video.currentTime = Math.max(0, video.currentTime - 1 / 30)
        break
      case '.':
        video.pause()
        video.currentTime = Math.min(video.duration, video.currentTime + 1 / 30)
        break
    }
  })
}
