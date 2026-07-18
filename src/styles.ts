import { GM_addStyle } from '$'

export function injectStyles() {
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
    `)
}
