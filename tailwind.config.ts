import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        orange:   '#FF6B00',
        amber:    '#FFA500',
        dark:     '#1A1A1A',
        graphite: '#2D2D2D',
        warm:     '#F5F4F0',
        mid:      '#E8E6E0',
        muted:    '#8A8680',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body:    ['var(--font-body)',    'sans-serif'],
        mono:    ['var(--font-mono)',    'monospace'],
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)'    },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideLeft: {
          '0%':   { opacity: '0', transform: 'translateX(24px)' },
          '100%': { opacity: '1', transform: 'translateX(0)'    },
        },
      },
      animation: {
        'fade-up':    'fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
        'fade-in':    'fadeIn 0.5s cubic-bezier(0.22,1,0.36,1) forwards',
        'slide-left': 'slideLeft 0.7s cubic-bezier(0.22,1,0.36,1) forwards',
      },
      boxShadow: {
        'card':         '0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.08)',
        'card-hover':   '0 4px 8px rgba(0,0,0,0.06), 0 16px 40px rgba(255,107,0,0.10), 0 4px 16px rgba(0,0,0,0.08)',
        'orange':       '0 4px 24px rgba(255,107,0,0.30), 0 2px 8px rgba(255,107,0,0.15)',
        'orange-sm':    '0 2px 12px rgba(255,107,0,0.35)',
        'dark':         '0 2px 16px rgba(0,0,0,0.18), 0 8px 32px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}
export default config
