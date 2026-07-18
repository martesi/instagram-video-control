import { defineConfig } from 'vite'
import monkey from 'vite-plugin-monkey'

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/index.ts',
      userscript: {
        name: 'Video Controls for Instagram',
        namespace: 'https://github.com/appel/userscripts',
        version: '1.2.0',
        description:
          'Instagram video controls with keyboard shortcuts and volume-based mute toggle.',
        author: 'Ap',
        match: ['https://www.instagram.com/', 'https://www.instagram.com/*'],
        icon: 'https://www.google.com/s2/favicons?sz=64&domain=instagram.com',
        license: 'MIT',
        grant: ['GM_addStyle'],
      },
    }),
  ],
})
