import { GM_addStyle } from '$'

export function paintSliderFill(slider: HTMLInputElement) {
  const min = parseFloat(slider.min) || 0
  const max = parseFloat(slider.max) || 1
  const pct = ((parseFloat(slider.value) - min) / (max - min)) * 100
  slider.style.setProperty(
    '--fill',
    `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.25) ${pct}%)`
  )
}

export function injectSliderStyles() {
  GM_addStyle(`
        .ig-vc-slider::-webkit-slider-runnable-track {
            background: var(--fill, rgba(255,255,255,0.25)) !important;
        }
    `)
}
