# Video Controls for Instagram

[![Install](https://img.shields.io/badge/Install-userscript-brightgreen?logo=tampermonkey)](https://github.com/martesi/instagram-video-control/releases/latest/download/ig-video-control.user.js)

A userscript that adds real video controls to Instagram — a play/pause + seek + volume + fullscreen bar, keyboard shortcuts, and persistent unmute.

This is a fork of [ap's "Video Controls for Instagram"](https://greasyfork.org/en/scripts/526892-video-controls-for-instagram) on Greasy Fork (itself based on an [earlier script by FXZFun](https://old.reddit.com/r/userscripts/comments/11j8jcc/instagram_video_controls_userscript/)).

## Features (current state)

- On-video control bar: play/pause, seek bar with live time, volume slider, fullscreen toggle.
- Keyboard shortcuts: `f` fullscreen, `m` mute/unmute, `k` play/pause, `j`/`l` seek ±10s, `,`/`.` frame step.
- Custom fullscreen mode that fixes Instagram's video cropping instead of using (broken) native fullscreen.
- Control bar hides itself behind modals/dialogs and on SPA navigation, and stays positioned correctly on scroll/resize.

## Fixes over the original

The original script had two known problems this fork resolves:

- Persistent/sticky unmute didn't work reliably.
- Fullscreen didn't work on the Explore page — this took a lot of effort to fix.

## Caveats

- Instagram's own native tagged-users button gets repositioned to the top-left of the video.
- Instagram's own native mute button is hidden (to avoid overlapping the custom bar).

## Development

```
bun install
bun run dev     # local dev server (vite-plugin-monkey)
bun run build   # outputs dist/ig-video-control.user.js
bun run lint    # biome check
```

## Installing / updates

Click the badge above (or [this link](https://github.com/martesi/instagram-video-control/releases/latest/download/ig-video-control.user.js)) — if you already have a userscript manager (Tampermonkey, Violentmonkey, etc.) installed, it will prompt you to install. It stays up to date on its own afterward: the script's `updateURL`/`downloadURL` point at that same "latest release" link, so your manager periodically checks and silently pulls new versions.
