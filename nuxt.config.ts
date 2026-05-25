// https://nuxt.com/docs/api/configuration/nuxt-config
import pkg from './package.json'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt'
  ],
  runtimeConfig: {
    public: {
      version: pkg.version
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'RemedIA',
      short_name: 'RemedIA',
      description: 'Busca y compara remedios',
      theme_color: '#f3e8ff',
      background_color: '#f3e8ff',
      display: 'standalone',
      orientation: 'portrait',
      icons: [
        {
          src: '/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any'
        },
        {
          src: '/favicon.png',
          sizes: '192x192',
          type: 'image/png'
        },
        {
          src: '/favicon.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ]
    },
    workbox: {
      // Solo online, sin cache offline
      globPatterns: [],
      runtimeCaching: []
    },
    mode: 'injectManifest',
    devOptions: {
      enabled: true
    }
  }
})
