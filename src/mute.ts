export function attachStickyUnmute(video: HTMLVideoElement) {
  if (video.dataset.stickyListenerAdded === 'true') return
  const orig = Object.getOwnPropertyDescriptor(
    HTMLMediaElement.prototype,
    'muted'
  )
  if (!orig) return

  Object.defineProperty(video, 'muted', {
    get() {
      return orig.get?.call(this)
    },
    set(value) {
      if (value === true && this.dataset.stickyUnmute === 'true') return
      orig.set?.call(this, value)
    },
    configurable: true,
  })
  video.dataset.stickyListenerAdded = 'true'
}

export function isMuted(video: HTMLVideoElement) {
  return video.muted || video.volume === 0
}

export function toggleMute(video: HTMLVideoElement) {
  if (isMuted(video)) {
    unmute(video)
  } else {
    mute(video)
  }
}

export function mute(video: HTMLVideoElement) {
  video.dataset.savedVolume = String(video.volume)
  video.dataset.stickyUnmute = ''
  video.muted = true
  video.volume = 0
}

export function unmute(video: HTMLVideoElement) {
  video.dataset.stickyUnmute = 'true'
  video.muted = false
  if (video.volume === 0) {
    video.volume = parseFloat(video.dataset.savedVolume || '0.8') || 0.8
    video.dataset.savedVolume = ''
  }
}
