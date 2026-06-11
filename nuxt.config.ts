// https://nuxt.com/docs/api/configuration/nuxt-config
const googleClientId = (globalThis as any).process?.env?.NUXT_PUBLIC_GOOGLE_AUTH_CLIENT_ID ?? ''

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  runtimeConfig: {
    public: {
      apiBaseUrl: (globalThis as any).process?.env?.NUXT_PUBLIC_API_BASE_URL ?? '',
      googleAuth: {
        clientId: googleClientId,
      },
    },
  },


  googleAuth: {
    clientId: googleClientId,
    autoLoadScript: true,
    promptOneTap: false,
    enableServerVerify: false,
  },

  css: [
    '~/assets/css/fonts.css',
    '~/assets/css/main.css',
  ],

  modules: [
    '@nuxtjs/tailwindcss',
    '@vite-pwa/nuxt',
    'nuxt-svgo-loader',
    'nuxt-google-auth',
    '@vee-validate/nuxt',
    '@vue-final-modal/nuxt',
    '@pinia/nuxt',
    'nuxt-toast',
    '@nuxt/scripts',
  ],

  scripts: {
    registry: {
      googleAnalytics: {
        id: 'G-0FG6FTEPH5',
      }
    }
  },

  tailwindcss: {
    exposeConfig: true
  }
})
