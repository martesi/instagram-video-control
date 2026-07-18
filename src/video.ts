import { createControlBar } from './controlBar'
import { attachStickyUnmute } from './mute'

export function updateVideo(video: HTMLVideoElement) {
  if (video._igVcBar) {
    const bar = video._igVcBar
    if (!document.contains(bar)) {
      video._igVcBar = null
    } else {
      bar._reposition?.()
      return
    }
  }
  attachStickyUnmute(video)
  createControlBar(video)
  video.closest('article')
    ? video.setAttribute('loop', 'true')
    : video.removeAttribute('loop')
}

export function initVideoObserver() {
  document.querySelectorAll('video').forEach(updateVideo)

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type !== 'childList') continue
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) return
        const el = node as HTMLElement
        if (el.tagName === 'VIDEO') updateVideo(el as HTMLVideoElement)
        else el.querySelectorAll('video').forEach(updateVideo)
      })
    }
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
