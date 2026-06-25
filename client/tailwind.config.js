/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // Existing fonts
        sans: ['Inter', 'sans-serif'],
        display: ['Bodoni Moda', 'sans-serif'],
        pixel: ['Share Tech Mono', 'monospace'],
        // New design system fonts
        'headline': ['DM Serif Display', 'serif'],
        'mono-data': ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Existing CSS-var tokens
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        'surface-dim': 'var(--color-surface-dim)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
        // New design system palette (static values from KOHNRAD design)
        'gunmetal': '#151515',
        'static-white': '#FFFFFF',
        'signal-blue': '#A8D8FF',
        'ash-rose': '#B57D7D',
        'void-black': '#050505',
        'glass': 'rgba(255,255,255,0.05)',
        // Dark surface tokens
        'surface-container': 'rgba(255, 255, 255, 0.06)',
        'surface-container-lowest': 'rgba(5, 5, 5, 0.5)',
        'on-surface': '#ffffff',
        'on-surface-variant': 'rgba(255, 255, 255, 0.65)',
        'outline': 'rgba(255, 255, 255, 0.06)',
        'outline-variant': 'rgba(255, 255, 255, 0.08)',
      },
      borderRadius: {
        DEFAULT: '0px',
        lg: '0px',
        xl: '0px',
        full: '9999px',
        sm: '2px',
      },
      spacing: {
        'unit-xl': '48px',
        'unit-md': '16px',
        'unit-lg': '24px',
        'unit-sm': '8px',
        'unit-xs': '4px',
        'section-padding': '120px',
        'pixel-gap': '1px',
      },
      fontSize: {
        'display-lg': ['68px', { lineHeight: '1.04', letterSpacing: '-0.03em', fontWeight: '400' }],
        'headline-xl': ['48px', { lineHeight: '1.2', letterSpacing: '-0.02em', fontWeight: '400' }],
        'headline-md': ['20px', { lineHeight: '1.3', fontWeight: '400', letterSpacing: '-0.01em' }],
        'body-lg': ['14px', { lineHeight: '1.9', fontWeight: '300' }],
        'body-md': ['13px', { lineHeight: '1.8', fontWeight: '300' }],
        'label-mono': ['10px', { lineHeight: '1', letterSpacing: '0.08em', fontWeight: '300', textTransform: 'uppercase' }],
        'numeral-lg': ['30px', { lineHeight: '1', fontWeight: '400' }],
      },
    },
  },
  plugins: [],
}
