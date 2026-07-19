import { readFileSync } from 'node:fs'
import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

// package.json is the single source of truth for the version.
// Bump it with `npm version patch|minor|major`, which also creates the
// matching git tag that the release workflow builds from.
const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url)))

const REPO_URL = 'https://github.com/martesi/instagram-video-control'

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/index.ts',
      build: {
        // must stay in sync with the asset names uploaded in
        // .github/workflows/release.yml
        fileName: 'ig-video-control.user.js',
        metaFileName: true,
      },
      userscript: {
        name: 'Video Controls for Instagram',
        namespace: 'github.com/martesi',
        version: pkg.version,
        description:
          'Instagram video controls with keyboard shortcuts and volume-based mute toggle.',
        author: 'Martes',
        match: ['https://www.instagram.com/', 'https://www.instagram.com/*'],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=instagram.com',
        license: 'MIT',
        grant: ['GM_addStyle'],
        // Tampermonkey polls updateURL (the small .meta.js) on its own
        // schedule; if the version there is newer it fetches downloadURL.
        // Both point at the "latest release" permalink, so they never
        // need to change between releases.
        updateURL: `${REPO_URL}/releases/latest/download/ig-video-control.meta.js`,
        downloadURL: `${REPO_URL}/releases/latest/download/ig-video-control.user.js`,
      },
    }),
  ],
})
