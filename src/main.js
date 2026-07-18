import { GM_addStyle } from '$';

if (!document.head.innerHTML.includes('::-webkit-media-controls')) {
    GM_addStyle(`
        ::-webkit-media-controls {
            z-index: 999999;
            position: relative;
        }
        video::-webkit-media-controls {
            opacity: 1;
        }
        video:hover::-webkit-media-controls {
            opacity: 1;
        }
    `);
}

// Intercept Instagram's muted-property setter so it can't silence a video
// that the user has explicitly unmuted (stickyUnmute flag).
// Volume-based mute (user action) is handled separately via setVolume().
function attachStickyUnmute(video) {
    if (video.dataset.stickyListenerAdded === 'true') return;

    const proto = Object.getPrototypeOf(video);
    const originalDescriptor = Object.getOwnPropertyDescriptor(proto, 'muted');

    Object.defineProperty(video, 'muted', {
        get() {
            return originalDescriptor.get.call(this);
        },
        set(value) {
            // Block Instagram from re-muting while the user wants it unmuted
            if (value === true && this.dataset.stickyUnmute === 'true') return;
            originalDescriptor.set.call(this, value);
        },
        configurable: true,
    });

    video.dataset.stickyListenerAdded = 'true';
}

// Mute by setting volume to 0 (saves prior volume); unmute by restoring it.
// Avoids touching video.muted so the sticky-unmute intercept isn't needed here.
function toggleMute(video) {
    if (parseFloat(video.dataset.savedVolume) > 0 && video.volume === 0) {
        // Currently muted via volume — restore
        video.volume = parseFloat(video.dataset.savedVolume);
        video.dataset.savedVolume = '';
        video.dataset.stickyUnmute = 'true';
    } else {
        // Mute: save current volume (or 1 as fallback) then zero it
        video.dataset.savedVolume = String(video.volume > 0 ? video.volume : 1);
        video.volume = 0;
        video.dataset.stickyUnmute = '';
    }
}

function isMuted(video) {
    return video.muted || video.volume === 0;
}

function unmute(video) {
    video.muted = false;
    video.dataset.stickyUnmute = 'true';
    if (video.volume === 0) {
        video.volume = parseFloat(video.dataset.savedVolume) || 1;
        video.dataset.savedVolume = '';
    }
}

function updateVideo(video) {
    video.controls = 'controls';
    attachStickyUnmute(video);
    if (video.closest('article') !== null) {
        video.setAttribute('loop', 'true');
    } else {
        video.removeAttribute('loop');
    }
}

document.querySelectorAll('video').forEach(updateVideo);

const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
        if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType !== Node.ELEMENT_NODE) return;
                if (node.tagName === 'VIDEO') {
                    updateVideo(node);
                } else {
                    node.querySelectorAll('video').forEach(updateVideo);
                }
            });
        }
    }
});
observer.observe(document.body, { childList: true, subtree: true });

function getClosestVideo() {
    let closest = null;
    let minDist = Infinity;
    document.querySelectorAll('video').forEach((video) => {
        const rect = video.getBoundingClientRect();
        const dist = Math.hypot(
            window.innerWidth / 2 - (rect.left + rect.width / 2),
            window.innerHeight / 2 - (rect.top + rect.height / 2),
        );
        if (dist < minDist) { minDist = dist; closest = video; }
    });
    return closest;
}

document.addEventListener('keydown', (event) => {
    const el = document.activeElement;
    if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;

    const video = getClosestVideo();
    if (!video) return;

    switch (event.key) {
        case 'f':
            document.fullscreenElement ? document.exitFullscreen() : video.requestFullscreen();
            break;
        case 'm':
            toggleMute(video);
            break;
        case 'k':
            video.paused ? video.play() : video.pause();
            // Ensure unmuted after play/pause toggle
            setTimeout(() => unmute(video), 100);
            break;
        case 'j':
            video.currentTime = Math.max(0, video.currentTime - 10);
            break;
        case 'l':
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            break;
        case ',':
            video.pause();
            video.currentTime = Math.max(0, video.currentTime - 1 / 30);
            break;
        case '.':
            video.pause();
            video.currentTime = Math.min(video.duration, video.currentTime + 1 / 30);
            break;
    }
});
