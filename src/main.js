import { GM_addStyle } from '$';

GM_addStyle(`
    /* Fix video cropping in fullscreen */
    :fullscreen video,
    :-webkit-full-screen video,
    video:fullscreen,
    video:-webkit-full-screen {
        object-fit: contain !important;
        width: 100% !important;
        height: 100% !important;
        background: #000 !important;
    }
    .ig-vc-fs-wrap {
        background: #000;
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .ig-vc-bar {
        position: fixed;
        height: 44px;
        z-index: 10000;
        background: linear-gradient(transparent, rgba(0,0,0,0.72));
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        /* Reset popover UA styles when bar is promoted to top layer */
        border: none;
        margin: 0;
        color-scheme: unset;
        overflow: visible;
    }
    .ig-vc-bar.visible {
        opacity: 1;
        pointer-events: auto;
    }

    /* ── Buttons ── */
    .ig-vc-btn {
        background: none;
        border: none;
        cursor: pointer;
        padding: 4px;
        line-height: 0;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
        transition: background 0.15s ease, opacity 0.15s ease;
        opacity: 0.9;
    }
    .ig-vc-btn:hover {
        opacity: 1;
        background: rgba(255,255,255,0.12);
    }
    .ig-vc-btn:active {
        background: rgba(255,255,255,0.2);
    }
    .ig-vc-btn svg {
        width: 18px;
        height: 18px;
        fill: #fff;
        display: block;
    }

    /* ── Time label ── */
    .ig-vc-time {
        color: rgba(255,255,255,0.92);
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        flex-shrink: 0;
        letter-spacing: 0.02em;
        user-select: none;
    }

    /* ── Shared slider styles ── */
    .ig-vc-slider {
        -webkit-appearance: none;
        appearance: none;
        background: transparent;
        cursor: pointer;
        height: 14px;
        min-width: 0;
        outline: none;
    }
    /* Track – WebKit */
    .ig-vc-slider::-webkit-slider-runnable-track {
        height: 3px;
        border-radius: 1.5px;
        background: rgba(255,255,255,0.25);
        transition: height 0.12s ease;
    }
    .ig-vc-slider:hover::-webkit-slider-runnable-track {
        height: 5px;
    }
    /* Track – Firefox */
    .ig-vc-slider::-moz-range-track {
        height: 3px;
        border-radius: 1.5px;
        background: rgba(255,255,255,0.25);
        border: none;
    }
    .ig-vc-slider:hover::-moz-range-track {
        height: 5px;
    }
    /* Progress fill – Firefox */
    .ig-vc-slider::-moz-range-progress {
        height: 3px;
        border-radius: 1.5px;
        background: #fff;
    }
    .ig-vc-slider:hover::-moz-range-progress {
        height: 5px;
    }
    /* Thumb – WebKit */
    .ig-vc-slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        width: 0px;
        height: 0px;
        border-radius: 50%;
        background: #fff;
        margin-top: -1px;
        transition: width 0.12s ease, height 0.12s ease, margin-top 0.12s ease;
        box-shadow: 0 0 3px rgba(0,0,0,0.3);
    }
    .ig-vc-slider:hover::-webkit-slider-thumb {
        width: 12px;
        height: 12px;
        margin-top: -3.5px;
    }
    /* Thumb – Firefox */
    .ig-vc-slider::-moz-range-thumb {
        width: 0px;
        height: 0px;
        border-radius: 50%;
        background: #fff;
        border: none;
        transition: width 0.12s ease, height 0.12s ease;
        box-shadow: 0 0 3px rgba(0,0,0,0.3);
    }
    .ig-vc-slider:hover::-moz-range-thumb {
        width: 12px;
        height: 12px;
    }

    /* ── Seek bar ── */
    .ig-vc-seek {
        flex: 3;
    }

    /* ── Volume slider ── */
    .ig-vc-vol {
        flex: 1;
        max-width: 72px;
    }
`);

// ── SVG icon paths ──────────────────────────────────────────────────────────

function svgIcon(pathD, viewBox = '0 0 24 24') {
    return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg"><path d="${pathD}"/></svg>`;
}

const ICON = {
    play:       svgIcon('M8 5v14l11-7z'),
    pause:      svgIcon('M6 19h4V5H6v14zm8-14v14h4V5h-4z'),
    volHigh:    svgIcon('M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z'),
    volLow:     svgIcon('M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z'),
    volMuted:   svgIcon('M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z'),
    fsEnter:    svgIcon('M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z'),
    fsExit:     svgIcon('M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z'),
};

// ── muted-property interceptor ──────────────────────────────────────────────

function attachStickyUnmute(video) {
    if (video.dataset.stickyListenerAdded === 'true') return;
    const orig = Object.getOwnPropertyDescriptor(HTMLMediaElement.prototype, 'muted');
    Object.defineProperty(video, 'muted', {
        get() { return orig.get.call(this); },
        set(value) {
            if (value === true && this.dataset.stickyUnmute === 'true') return;
            orig.set.call(this, value);
        },
        configurable: true,
    });
    video.dataset.stickyListenerAdded = 'true';
}

// ── mute helpers ─────────────────────────────────────────────────────────────

function isMuted(video) {
    return video.muted || video.volume === 0;
}

function toggleMute(video) {
    if (isMuted(video)) {
        // Unmute: clear muted flag, restore volume
        video.muted = false;
        video.dataset.stickyUnmute = 'true';
        if (video.volume === 0) {
            video.volume = parseFloat(video.dataset.savedVolume) || 1;
            video.dataset.savedVolume = '';
        }
    } else {
        // Mute via volume so we don't fight our own interceptor
        video.dataset.savedVolume = String(video.volume);
        video.volume = 0;
        video.dataset.stickyUnmute = '';
    }
}

function unmute(video) {
    video.muted = false;
    video.dataset.stickyUnmute = 'true';
    if (video.volume === 0) {
        video.volume = parseFloat(video.dataset.savedVolume) || 1;
        video.dataset.savedVolume = '';
    }
}

// ── utils ────────────────────────────────────────────────────────────────────

function fmt(s) {
    const m = Math.floor(s / 60);
    return `${m}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
}

// True when a large visible dialog covers the feed and the video is NOT inside it.
// Instagram keeps persistent [role="dialog"] elements in the DOM (stories, etc.)
// so we only treat a dialog as "blocking" if it visibly fills most of the viewport.
function shouldHideBehindModal(video) {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    for (const d of dialogs) {
        if (d.contains(video)) return false;
        const cs = getComputedStyle(d);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = d.getBoundingClientRect();
        if (r.width > window.innerWidth * 0.5 && r.height > window.innerHeight * 0.5) return true;
    }
    return false;
}

// Find Instagram's native mute wrapper (button + its background container).
function findIgMuteWrapper(video) {
    let el = video.parentElement;
    for (let i = 0; i < 10 && el && el !== document.body; i++, el = el.parentElement) {
        const btn = el.querySelector('[aria-label*="ute" i]');
        if (btn) return btn.parentElement || btn;
    }
    return null;
}

// ── fullscreen wrapper ───────────────────────────────────────────────────────
// Move the video into a clean container we control, fullscreen that container,
// and force-override the video's inline styles so IG's cropping is removed.

const FS_OVERRIDE_PROPS = [
    'object-fit', 'width', 'height', 'max-width', 'max-height',
    'min-width', 'min-height', 'clip-path', 'clip', 'position',
    'top', 'left', 'right', 'bottom', 'margin', 'padding',
    'transform', 'aspect-ratio',
];

function enterVideoFullscreen(video) {
    if (document.fullscreenElement) return;

    const wrap = document.createElement('div');
    wrap.className = 'ig-vc-fs-wrap';

    // Save original state
    video._igVcFsState = {
        parent: video.parentElement,
        next: video.nextSibling,
        wrap,
        origStyle: video.getAttribute('style') || '',
    };

    // Move video into our wrapper
    wrap.appendChild(video);
    document.body.appendChild(wrap);

    // Force-override inline styles that IG uses to crop
    for (const prop of FS_OVERRIDE_PROPS) video.style.removeProperty(prop);
    video.style.setProperty('object-fit', 'contain', 'important');
    video.style.setProperty('width', '100%', 'important');
    video.style.setProperty('height', '100%', 'important');
    video.style.setProperty('max-width', '100%', 'important');
    video.style.setProperty('max-height', '100%', 'important');
    video.style.setProperty('position', 'static', 'important');
    video.style.setProperty('clip-path', 'none', 'important');
    video.style.setProperty('transform', 'none', 'important');

    wrap.requestFullscreen().catch(() => restoreFromFullscreen(video));
}

function restoreFromFullscreen(video) {
    const state = video._igVcFsState;
    if (!state) return;

    // Restore original inline styles
    if (state.origStyle) {
        video.setAttribute('style', state.origStyle);
    } else {
        video.removeAttribute('style');
    }

    // Move video back to its original position
    if (state.next && state.parent.contains(state.next)) {
        state.parent.insertBefore(video, state.next);
    } else if (state.parent && document.contains(state.parent)) {
        state.parent.appendChild(video);
    }

    // Clean up wrapper
    state.wrap.remove();
    delete video._igVcFsState;
}

// ── slider fill painting ─────────────────────────────────────────────────────
// WebKit doesn't support ::-moz-range-progress, so we paint the fill via a
// linear-gradient on the track background. Called on every input/sync.

function paintSliderFill(slider) {
    const min = parseFloat(slider.min) || 0;
    const max = parseFloat(slider.max) || 1;
    const pct = ((parseFloat(slider.value) - min) / (max - min)) * 100;
    slider.style.setProperty(
        '--fill',
        `linear-gradient(to right, #fff ${pct}%, rgba(255,255,255,0.25) ${pct}%)`,
    );
}

// Inject one-time WebKit track override that reads the --fill var
GM_addStyle(`
    .ig-vc-slider::-webkit-slider-runnable-track {
        background: var(--fill, rgba(255,255,255,0.25)) !important;
    }
`);

// ── control bar ───────────────────────────────────────────────────────────────

function createControlBar(video) {
    if (video._igVcBar) return;

    const bar = document.createElement('div');
    bar.className = 'ig-vc-bar';
    document.body.appendChild(bar);
    video._igVcBar = bar;

    // ── elements ──
    const playBtn = document.createElement('button');
    playBtn.className = 'ig-vc-btn';
    playBtn.title = 'Play / Pause (k)';
    bar.appendChild(playBtn);

    const timeEl = document.createElement('span');
    timeEl.className = 'ig-vc-time';
    bar.appendChild(timeEl);

    const seekBar = document.createElement('input');
    seekBar.type = 'range'; seekBar.min = '0'; seekBar.max = '1'; seekBar.step = '0.001';
    seekBar.className = 'ig-vc-slider ig-vc-seek';
    seekBar.value = '0';
    bar.appendChild(seekBar);

    const muteBtn = document.createElement('button');
    muteBtn.className = 'ig-vc-btn';
    muteBtn.title = 'Mute / Unmute (m)';
    bar.appendChild(muteBtn);

    const volSlider = document.createElement('input');
    volSlider.type = 'range'; volSlider.min = '0'; volSlider.max = '1'; volSlider.step = '0.02';
    volSlider.className = 'ig-vc-slider ig-vc-vol';
    bar.appendChild(volSlider);

    const fsBtn = document.createElement('button');
    fsBtn.className = 'ig-vc-btn';
    fsBtn.title = 'Fullscreen (f)';
    bar.appendChild(fsBtn);

    // ── sync ──
    function syncPlayback() {
        playBtn.innerHTML = video.paused ? ICON.play : ICON.pause;
        if (isFinite(video.duration) && video.duration > 0) {
            seekBar.value = String(video.currentTime / video.duration);
            timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
        } else {
            timeEl.textContent = '';
        }
        paintSliderFill(seekBar);
    }
    function syncVolume() {
        const muted = isMuted(video);
        const vol = video.volume;
        if (muted) {
            muteBtn.innerHTML = ICON.volMuted;
        } else if (vol < 0.5) {
            muteBtn.innerHTML = ICON.volLow;
        } else {
            muteBtn.innerHTML = ICON.volHigh;
        }
        volSlider.value = String(video.volume);
        paintSliderFill(volSlider);
    }
    function syncFs() {
        fsBtn.innerHTML = document.fullscreenElement ? ICON.fsExit : ICON.fsEnter;
    }

    // ── events ──
    playBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        video.paused ? video.play() : video.pause();
    });

    let seekDragging = false;
    seekBar.addEventListener('pointerdown', () => { seekDragging = true; });
    seekBar.addEventListener('pointerup',   () => { seekDragging = false; });
    seekBar.addEventListener('input', (e) => {
        e.stopPropagation();
        if (isFinite(video.duration)) video.currentTime = parseFloat(e.target.value) * video.duration;
        paintSliderFill(seekBar);
    });

    muteBtn.addEventListener('click', (e) => { e.stopPropagation(); toggleMute(video); });

    let volDragging = false;
    volSlider.addEventListener('pointerdown', () => { volDragging = true; });
    volSlider.addEventListener('pointerup',   () => { volDragging = false; syncVolume(); });
    volSlider.addEventListener('input', (e) => {
        e.stopPropagation();
        const val = parseFloat(e.target.value);
        video.volume = val;
        if (val > 0) {
            video.muted = false;
            video.dataset.stickyUnmute = 'true';
            video.dataset.savedVolume = '';
        }
        paintSliderFill(volSlider);
    });

    fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            enterVideoFullscreen(video);
        }
    });

    // On fullscreen enter: move bar into our fullscreen wrapper so it renders
    // inside the fullscreen context and is interactive.
    // On fullscreen exit: move bar back to body and restore the video.
    function onFullscreenChange() {
        const fsEl = document.fullscreenElement;
        if (fsEl && fsEl.contains(video)) {
            // Bar goes inside the fullscreen wrapper
            fsEl.appendChild(bar);
        } else if (!fsEl) {
            if (bar.parentElement !== document.body) {
                document.body.appendChild(bar);
            }
            // Restore video to its original container
            restoreFromFullscreen(video);
        }
        syncFs();
        reposition();
    }
    document.addEventListener('fullscreenchange', onFullscreenChange);

    video.addEventListener('timeupdate',     () => { if (!seekDragging) syncPlayback(); });
    video.addEventListener('play',           syncPlayback);
    video.addEventListener('pause',          syncPlayback);
    video.addEventListener('loadedmetadata', syncPlayback);
    video.addEventListener('durationchange', syncPlayback);
    video.addEventListener('volumechange',   () => { if (!volDragging) syncVolume(); });

    syncPlayback(); syncVolume(); syncFs();

    // ── hover ──
    // Instagram puts a transparent overlay on top of the video that swallows pointer
    // events, so mouseenter on the video element itself never fires. Instead we use
    // a document-level mousemove and check coordinates manually — this always works
    // regardless of what element is on top.
    let hideTimer = null;
    let igMuteWrapper = null;

    function showBar() {
        clearTimeout(hideTimer);
        hideTimer = null;
        bar.classList.add('visible');
        if (!igMuteWrapper) igMuteWrapper = findIgMuteWrapper(video);
        if (igMuteWrapper) igMuteWrapper.style.visibility = 'hidden';
    }

    function hideBar() {
        bar.classList.remove('visible');
        if (igMuteWrapper) { igMuteWrapper.style.visibility = ''; igMuteWrapper = null; }
    }

    function onMouseMove(e) {
        // Don't show bar for videos hidden behind modals
        if (!document.fullscreenElement && shouldHideBehindModal(video)) {
            if (bar.classList.contains('visible')) hideBar();
            return;
        }
        const vr = video.getBoundingClientRect();
        const br = bar.getBoundingClientRect();
        const overVideo = e.clientX >= vr.left && e.clientX <= vr.right &&
                          e.clientY >= vr.top  && e.clientY <= vr.bottom;
        const overBar   = br.width > 0 &&
                          e.clientX >= br.left && e.clientX <= br.right &&
                          e.clientY >= br.top  && e.clientY <= br.bottom;
        if (overVideo || overBar) {
            reposition();
            showBar();
        } else if (!hideTimer) {
            hideTimer = setTimeout(() => { hideTimer = null; hideBar(); }, 300);
        }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── position ──
    let rafId = null;
    function reposition() {
        if (rafId !== null) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const r = video.getBoundingClientRect();
            if (r.width === 0 || (!document.fullscreenElement && shouldHideBehindModal(video))) {
                bar.style.display = 'none';
                return;
            }
            bar.style.display = 'flex';
            bar.style.left   = `${r.left}px`;
            bar.style.width  = `${r.width}px`;
            bar.style.top    = `${r.bottom - 44}px`;
        });
    }

    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });
    new ResizeObserver(reposition).observe(video);
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) reposition();
    }, { threshold: 0.01 }).observe(video);
    reposition();
    bar._reposition = reposition;
}

// ── video init ────────────────────────────────────────────────────────────────

function updateVideo(video) {
    // Re-init if video was moved to a different container (feed → modal).
    if (video._igVcBar) {
        const bar = video._igVcBar;
        // Bar is in body or fullscreen element; just rerun reposition to update coords.
        // Only tear down if the bar was somehow removed from the DOM.
        if (!document.contains(bar)) {
            video._igVcBar = null;
        } else {
            if (bar._reposition) bar._reposition();
            return;
        }
    }
    attachStickyUnmute(video);
    createControlBar(video);
    video.closest('article')
        ? video.setAttribute('loop', 'true')
        : video.removeAttribute('loop');
}

document.querySelectorAll('video').forEach(updateVideo);

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type !== 'childList') continue;
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;
            if (node.tagName === 'VIDEO') updateVideo(node);
            else node.querySelectorAll('video').forEach(updateVideo);
        });
    }
});
observer.observe(document.body, { childList: true, subtree: true });

// ── keyboard ──────────────────────────────────────────────────────────────────

function getClosestVideo() {
    let closest = null, minDist = Infinity;
    document.querySelectorAll('video').forEach((v) => {
        const r = v.getBoundingClientRect();
        const d = Math.hypot(
            window.innerWidth  / 2 - (r.left + r.width  / 2),
            window.innerHeight / 2 - (r.top  + r.height / 2),
        );
        if (d < minDist) { minDist = d; closest = v; }
    });
    return closest;
}

document.addEventListener('keydown', (e) => {
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
    const video = getClosestVideo();
    if (!video) return;
    switch (e.key) {
        case 'f':
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                enterVideoFullscreen(video);
            }
            break;
        case 'm': toggleMute(video); break;
        case 'k':
            video.paused ? video.play() : video.pause();
            setTimeout(() => unmute(video), 100);
            break;
        case 'j': video.currentTime = Math.max(0, video.currentTime - 10); break;
        case 'l': video.currentTime = Math.min(video.duration, video.currentTime + 10); break;
        case ',': video.pause(); video.currentTime = Math.max(0, video.currentTime - 1 / 30); break;
        case '.': video.pause(); video.currentTime = Math.min(video.duration, video.currentTime + 1 / 30); break;
    }
});
