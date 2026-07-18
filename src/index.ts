import { initKeyboardShortcuts } from './keyboard'
import { injectSliderStyles } from './slider'
import { injectStyles } from './styles'
import { initVideoObserver } from './video'

injectStyles()
injectSliderStyles()
initVideoObserver()
initKeyboardShortcuts()
