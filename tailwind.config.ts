import type { Config } from 'tailwindcss'

export default {
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#ED2E23',   // MiFlujo Red — actions, active nav, highlights
        navy:    '#02163B',   // Deep Navy — text, headers, dark surfaces
        grey:    '#CCCCCC',   // Light Grey — borders, dividers, disabled states
        surface: '#FCFCFC',   // Near-white app background
        error:   '#DC2626',   // Error red — distinct from primary CTA red
      },
      fontFamily: {
        // Primary font: Azo-Sans (all display, headline, body, label scales)
        // Change 'Azo-Sans' below to swap the primary font across the entire app
        sans:      ['Azo-Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        primary:   ['Azo-Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        secondary: ['Roboto',   'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      // ─── Typography scale ─────────────────────────────────────────────────
      // Usage: text-display-lg, text-headline-md, text-title-sm, text-body-md,
      //        text-body-sm, text-data-mono, text-label-caps
      // Font weights must be applied separately:
      //   display-lg  → font-semibold
      //   headline-md → font-semibold
      //   title-sm    → font-medium
      //   body-md     → font-normal
      //   body-sm     → font-normal
      //   data-mono   → font-medium  (pair with tabular-nums)
      //   label-caps  → font-bold    (pair with uppercase)
      fontSize: {
        'display-lg':  ['32px', { lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'headline-md': ['20px', { lineHeight: '1.3' }],
        'title-sm':    ['16px', { lineHeight: '1.4' }],
        'body-md':     ['14px', { lineHeight: '1.5' }],
        'body-sm':     ['12px', { lineHeight: '1.4' }],
        'data-mono':   ['14px', { lineHeight: '1' }],
        'label-caps':  ['10px', { lineHeight: '1',   letterSpacing: '0.05em' }],
      },
    },
  },
  plugins: [],
} satisfies Config
