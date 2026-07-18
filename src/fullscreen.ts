const FS_OVERRIDE_PROPS = [
  'object-fit',
  'width',
  'height',
  'max-width',
  'max-height',
  'min-width',
  'min-height',
  'clip-path',
  'clip',
  'position',
  'top',
  'left',
  'right',
  'bottom',
  'margin',
  'padding',
  'transform',
  'aspect-ratio',
]

export function enterVideoFullscreen(video: HTMLVideoElement) {
  if (document.fullscreenElement) return

  const wrap = document.createElement('div')
  wrap.className = 'ig-vc-fs-wrap'

  video._igVcFsState = {
    parent: video.parentElement,
    next: video.nextSibling,
    wrap,
    origStyle: video.getAttribute('style') || '',
  }

  wrap.appendChild(video)
  document.body.appendChild(wrap)

  for (const prop of FS_OVERRIDE_PROPS) video.style.removeProperty(prop)
  video.style.setProperty('object-fit', 'contain', 'important')
  video.style.setProperty('width', '100%', 'important')
  video.style.setProperty('height', '100%', 'important')
  video.style.setProperty('max-width', '100%', 'important')
  video.style.setProperty('max-height', '100%', 'important')
  video.style.setProperty('position', 'static', 'important')
  video.style.setProperty('clip-path', 'none', 'important')
  video.style.setProperty('transform', 'none', 'important')

  wrap.addEventListener('click', (e) => {
    if (e.target === wrap || e.target === video) {
      video.paused ? video.play() : video.pause()
    }
  })

  wrap.requestFullscreen().catch(() => restoreFromFullscreen(video))
}

export function restoreFromFullscreen(video: HTMLVideoElement) {
  const state = video._igVcFsState
  if (!state) return

  if (state.origStyle) {
    video.setAttribute('style', state.origStyle)
  } else {
    video.removeAttribute('style')
  }

  if (state.next && state.parent?.contains(state.next)) {
    state.parent.insertBefore(video, state.next)
  } else if (state.parent && document.contains(state.parent)) {
    state.parent.appendChild(video)
  }

  state.wrap.remove()
  video._igVcFsState = null
}
