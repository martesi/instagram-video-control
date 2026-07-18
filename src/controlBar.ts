import { enterVideoFullscreen, restoreFromFullscreen } from './fullscreen'
import { ICON } from './icons'
import { isMuted, mute, toggleMute } from './mute'
import { paintSliderFill } from './slider'
import {
  findIgMuteWrapper,
  findIgUsersWrapper,
  fmt,
  shouldHideBehindModal,
} from './utils'

export function createControlBar(video: HTMLVideoElement) {
  if (video._igVcBar) return

  const bar = document.createElement('div')
  bar.className = 'ig-vc-bar'
  document.body.appendChild(bar)
  video._igVcBar = bar

  const playBtn = document.createElement('button')
  playBtn.className = 'ig-vc-btn'
  playBtn.title = 'Play / Pause (k)'
  bar.appendChild(playBtn)

  const timeEl = document.createElement('span')
  timeEl.className = 'ig-vc-time'
  bar.appendChild(timeEl)

  const seekBar = document.createElement('input')
  seekBar.type = 'range'
  seekBar.min = '0'
  seekBar.max = '1'
  seekBar.step = '0.001'
  seekBar.className = 'ig-vc-slider ig-vc-seek'
  seekBar.value = '0'
  bar.appendChild(seekBar)

  const muteBtn = document.createElement('button')
  muteBtn.className = 'ig-vc-btn'
  muteBtn.title = 'Mute / Unmute (m)'
  bar.appendChild(muteBtn)

  const volSlider = document.createElement('input')
  volSlider.type = 'range'
  volSlider.min = '0'
  volSlider.max = '1'
  volSlider.step = '0.02'
  volSlider.className = 'ig-vc-slider ig-vc-vol'
  bar.appendChild(volSlider)

  const fsBtn = document.createElement('button')
  fsBtn.className = 'ig-vc-btn'
  fsBtn.title = 'Fullscreen (f)'
  bar.appendChild(fsBtn)

  function syncPlayback() {
    playBtn.innerHTML = video.paused ? ICON.play : ICON.pause
    if (Number.isFinite(video.duration) && video.duration > 0) {
      seekBar.value = String(video.currentTime / video.duration)
      timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`
    } else {
      timeEl.textContent = ''
    }
    paintSliderFill(seekBar)
  }
  function syncVolume() {
    const muted = isMuted(video)
    const vol = video.volume
    if (muted) {
      muteBtn.innerHTML = ICON.volMuted
      volSlider.value = '0'
    } else {
      if (vol < 0.5) {
        muteBtn.innerHTML = ICON.volLow
      } else {
        muteBtn.innerHTML = ICON.volHigh
      }
      volSlider.value = String(vol)
    }
    paintSliderFill(volSlider)
  }
  function syncFs() {
    fsBtn.innerHTML = document.fullscreenElement ? ICON.fsExit : ICON.fsEnter
  }

  playBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    video.paused ? video.play() : video.pause()
  })

  let seekDragging = false
  seekBar.addEventListener('pointerdown', () => {
    seekDragging = true
  })
  seekBar.addEventListener('pointerup', () => {
    seekDragging = false
  })
  seekBar.addEventListener('input', (e) => {
    e.stopPropagation()
    if (Number.isFinite(video.duration)) {
      video.currentTime =
        parseFloat((e.target as HTMLInputElement).value) * video.duration
    }
    paintSliderFill(seekBar)
  })

  muteBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    toggleMute(video)
  })

  let volDragging = false
  volSlider.addEventListener('pointerdown', () => {
    volDragging = true
  })
  volSlider.addEventListener('pointerup', () => {
    volDragging = false
    syncVolume()
  })
  volSlider.addEventListener('input', (e) => {
    e.stopPropagation()
    const val = parseFloat((e.target as HTMLInputElement).value)
    if (val > 0) {
      video.volume = val
      video.muted = false
      video.dataset.stickyUnmute = 'true'
      video.dataset.savedVolume = ''
    } else {
      mute(video)
    }
    paintSliderFill(volSlider)

    if (isMuted(video)) {
      muteBtn.innerHTML = ICON.volMuted
    } else if (val < 0.5) {
      muteBtn.innerHTML = ICON.volLow
    } else {
      muteBtn.innerHTML = ICON.volHigh
    }
  })

  fsBtn.addEventListener('click', (e) => {
    e.stopPropagation()
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      enterVideoFullscreen(video)
    }
  })

  function onFullscreenChange() {
    const fsEl = document.fullscreenElement
    if (fsEl?.contains(video)) {
      fsEl.appendChild(bar)
    } else if (!fsEl) {
      if (bar.parentElement !== document.body) {
        document.body.appendChild(bar)
      }
      restoreFromFullscreen(video)
    }
    syncFs()
    reposition()
  }
  document.addEventListener('fullscreenchange', onFullscreenChange)

  video.addEventListener('timeupdate', () => {
    if (!seekDragging) syncPlayback()
  })
  video.addEventListener('play', syncPlayback)
  video.addEventListener('pause', syncPlayback)
  video.addEventListener('loadedmetadata', syncPlayback)
  video.addEventListener('durationchange', syncPlayback)
  video.addEventListener('volumechange', () => {
    if (!volDragging) syncVolume()
  })

  syncPlayback()
  syncVolume()
  syncFs()

  let hideTimer: ReturnType<typeof setTimeout> | null = null

  function showBar() {
    if (hideTimer) {
      clearTimeout(hideTimer)
      hideTimer = null
    }
    bar.classList.add('visible')
  }

  function hideBar() {
    bar.classList.remove('visible')
  }

  function checkModalStatus() {
    if (!document.body.contains(video)) {
      document.removeEventListener('click', onClick)
      window.removeEventListener('popstate', onPopState)
      return
    }
    if (!document.fullscreenElement && shouldHideBehindModal(video)) {
      hideBar()
    }
  }

  function onClick() {
    setTimeout(checkModalStatus, 100)
    setTimeout(checkModalStatus, 300)
  }

  function onPopState() {
    setTimeout(checkModalStatus, 100)
    setTimeout(checkModalStatus, 300)
  }

  document.addEventListener('click', onClick, { passive: true })
  window.addEventListener('popstate', onPopState, { passive: true })

  function onMouseMove(e: MouseEvent) {
    if (!document.body.contains(video)) {
      document.removeEventListener('mousemove', onMouseMove)
      return
    }
    if (!document.fullscreenElement && shouldHideBehindModal(video)) {
      if (bar.classList.contains('visible')) hideBar()
      return
    }
    const vr = video.getBoundingClientRect()
    const br = bar.getBoundingClientRect()
    const overVideo =
      e.clientX >= vr.left &&
      e.clientX <= vr.right &&
      e.clientY >= vr.top &&
      e.clientY <= vr.bottom
    const overBar =
      br.width > 0 &&
      e.clientX >= br.left &&
      e.clientX <= br.right &&
      e.clientY >= br.top &&
      e.clientY <= br.bottom
    if (overVideo || overBar) {
      reposition()
      showBar()
    } else if (!hideTimer) {
      hideTimer = setTimeout(() => {
        hideTimer = null
        hideBar()
      }, 300)
    }
  }

  document.addEventListener('mousemove', onMouseMove, { passive: true })

  let rafId: ReturnType<typeof requestAnimationFrame> | null = null
  function reposition() {
    if (rafId !== null) cancelAnimationFrame(rafId)
    rafId = requestAnimationFrame(() => {
      rafId = null
      const r = video.getBoundingClientRect()
      if (
        r.width === 0 ||
        (!document.fullscreenElement && shouldHideBehindModal(video))
      ) {
        bar.style.display = 'none'
        return
      }
      bar.style.display = 'flex'
      bar.style.left = `${r.left}px`
      bar.style.width = `${r.width}px`
      bar.style.top = `${r.bottom - 44}px`

      const igMute = findIgMuteWrapper(video)
      if (igMute) {
        igMute.style.display = 'none'
        igMute.style.visibility = 'hidden'
      }

      const igUsers = findIgUsersWrapper(video)
      if (igUsers) {
        igUsers.style.setProperty('position', 'absolute', 'important')
        igUsers.style.setProperty('top', '0', 'important')
        igUsers.style.setProperty('left', '0', 'important')
        igUsers.style.setProperty('bottom', 'auto', 'important')
        igUsers.style.setProperty('right', 'auto', 'important')
        igUsers.style.setProperty('display', 'block', 'important')
        igUsers.style.setProperty('visibility', 'visible', 'important')
      }
    })
  }

  window.addEventListener('scroll', reposition, { passive: true })
  window.addEventListener('resize', reposition, { passive: true })
  new ResizeObserver(reposition).observe(video)
  new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting) reposition()
    },
    { threshold: 0.01 }
  ).observe(video)
  reposition()
  bar._reposition = reposition
}
