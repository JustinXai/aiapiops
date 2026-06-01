/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#070B12',
        'surface-dark': '#020617',
        'surface-card': '#0F172A',
        'accent': '#6EE7B7',
        'accent-dark': '#10B981',
        'light-section': '#EEF0EA',
        'white-card': '#FFFFFF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
