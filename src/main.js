import { GM_addStyle } from '$';

GM_addStyle(`
    .ig-vc-bar {
        position: fixed;
        height: 40px;
        z-index: 10000;
        background: linear-gradient(transparent, rgba(0,0,0,0.65));
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        box-sizing: border-box;
        font-family: sans-serif;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.15s ease;
    }
    .ig-vc-bar.visible {
        opacity: 1;
        pointer-events: auto;
    }
    .ig-vc-btn {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 15px;
        color: #fff;
        padding: 4px;
        line-height: 1;
        flex-shrink: 0;
    }
    .ig-vc-btn:hover { opacity: 0.75; }
    .ig-vc-time {
        color: #fff;
        font-size: 11px;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .ig-vc-seek {
        flex: 3;
        accent-color: #fff;
        cursor: pointer;
        min-width: 0;
    }
    .ig-vc-vol {
        flex: 1;
        accent-color: #fff;
        cursor: pointer;
        min-width: 0;
        max-width: 72px;
    }
`);

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
    bar.appendChild(playBtn);

    const timeEl = document.createElement('span');
    timeEl.className = 'ig-vc-time';
    bar.appendChild(timeEl);

    const seekBar = document.createElement('input');
    seekBar.type = 'range'; seekBar.min = '0'; seekBar.max = '1'; seekBar.step = '0.001';
    seekBar.className = 'ig-vc-seek';
    bar.appendChild(seekBar);

    const muteBtn = document.createElement('button');
    muteBtn.className = 'ig-vc-btn';
    bar.appendChild(muteBtn);

    const volSlider = document.createElement('input');
    volSlider.type = 'range'; volSlider.min = '0'; volSlider.max = '1'; volSlider.step = '0.02';
    volSlider.className = 'ig-vc-vol';
    bar.appendChild(volSlider);

    const fsBtn = document.createElement('button');
    fsBtn.className = 'ig-vc-btn';
    bar.appendChild(fsBtn);

    // ── sync ──
    function syncPlayback() {
        playBtn.textContent = video.paused ? '▶' : '⏸';
        if (isFinite(video.duration) && video.duration > 0) {
            seekBar.value = String(video.currentTime / video.duration);
            timeEl.textContent = `${fmt(video.currentTime)} / ${fmt(video.duration)}`;
        } else {
            timeEl.textContent = '';
        }
    }
    function syncVolume() {
        muteBtn.textContent = isMuted(video) ? '🔇' : '🔊';
        volSlider.value = String(video.volume);
    }
    function syncFs() {
        fsBtn.textContent = document.fullscreenElement ? '✕' : '⛶';
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
    });

    fsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            // Fullscreen the video's parent so bar can travel in on fullscreenchange.
            const c = video.parentElement;
            (c ? c.requestFullscreen() : Promise.reject()).catch(() => video.requestFullscreen());
        }
    });

    // Move bar into the fullscreen element so it's visible in fullscreen mode.
    function onFullscreenChange() {
        const fsEl = document.fullscreenElement;
        if (fsEl && fsEl.contains(video)) {
            fsEl.appendChild(bar);
            bar.style.position = 'fixed'; // fixed inside fullscreen context = viewport-relative
        } else if (!fsEl) {
            document.body.appendChild(bar);
            bar.style.position = 'fixed';
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
        const vr = video.getBoundingClientRect();
        const br = bar.getBoundingClientRect();
        const overVideo = e.clientX >= vr.left && e.clientX <= vr.right &&
                          e.clientY >= vr.top  && e.clientY <= vr.bottom;
        const overBar   = br.width > 0 &&
                          e.clientX >= br.left && e.clientX <= br.right &&
                          e.clientY >= br.top  && e.clientY <= br.bottom;
        if (overVideo || overBar) {
            showBar();
        } else if (!hideTimer) {
            hideTimer = setTimeout(() => { hideTimer = null; hideBar(); }, 300);
        }
    }

    document.addEventListener('mousemove', onMouseMove, { passive: true });

    // ── position ──
    let rafId = null;
    function reposition() {
        if (rafId !== null) return;
        rafId = requestAnimationFrame(() => {
            rafId = null;
            const r = video.getBoundingClientRect();
            if (r.width === 0 || shouldHideBehindModal(video)) {
                bar.style.display = 'none';
                return;
            }
            bar.style.display = 'flex';
            bar.style.left   = `${r.left}px`;
            bar.style.width  = `${r.width}px`;
            bar.style.top    = `${r.bottom - 40}px`;
        });
    }

    window.addEventListener('scroll', reposition, { passive: true });
    window.addEventListener('resize', reposition, { passive: true });
    new ResizeObserver(reposition).observe(video);
    new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) reposition();
    }, { threshold: 0.01 }).observe(video);
    reposition();
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
                const c = video.parentElement;
                (c ? c.requestFullscreen() : Promise.reject()).catch(() => video.requestFullscreen());
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
