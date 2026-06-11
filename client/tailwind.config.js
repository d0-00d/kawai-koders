/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Bodoni Moda', 'sans-serif'],
      },
      colors: {
        bg: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        secondary: 'var(--color-secondary)',
        text: 'var(--color-text)',
        muted: 'var(--color-muted)',
      }
    },
  },
  plugins: [],
}
