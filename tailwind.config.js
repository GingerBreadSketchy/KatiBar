/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // ── Digital Sovereign Design System ──────────────────────────────────
        // AMOLED Canvas
        'amoled':       '#000000',
        'surface-1':    '#0a0a0a',
        'surface-2':    '#111111',
        'surface-3':    '#1a1a1a',
        'surface-4':    '#222222',
        'surface-5':    '#2a2a2a',

        // Kenyan Crimson
        'crimson':          '#C8102E',
        'crimson-dim':      '#9e0d24',
        'crimson-bright':   '#e8193a',
        'crimson-muted':    'rgba(200,16,46,0.15)',
        'crimson-glass':    'rgba(200,16,46,0.08)',

        // Lush Green
        'forest':           '#006A4E',
        'forest-dim':       '#004f3a',
        'forest-bright':    '#00a070',
        'forest-muted':     'rgba(0,106,78,0.15)',
        'forest-glass':     'rgba(0,106,78,0.08)',

        // Gold (tertiary accent)
        'gold':             '#D4A017',
        'gold-dim':         '#a07a10',
        'gold-muted':       'rgba(212,160,23,0.12)',

        // Text
        'ink-0':    '#ffffff',
        'ink-1':    '#f0f0f0',
        'ink-2':    '#c0c0c0',
        'ink-3':    '#888888',
        'ink-4':    '#555555',
        'ink-5':    '#333333',

        // Borders / dividers (tonal only)
        'line-1':   'rgba(255,255,255,0.08)',
        'line-2':   'rgba(255,255,255,0.05)',
        'line-3':   'rgba(255,255,255,0.03)',
      },
      fontFamily: {
        display:  ['Newsreader', 'Georgia', 'serif'],
        serif:    ['Newsreader', 'Georgia', 'serif'],
        sans:     ['Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        'fluid-xs':  'clamp(0.7rem,  1.5vw, 0.8rem)',
        'fluid-sm':  'clamp(0.85rem, 1.8vw, 0.95rem)',
        'fluid-md':  'clamp(1rem,    2vw,   1.1rem)',
        'fluid-lg':  'clamp(1.15rem, 2.5vw, 1.35rem)',
        'fluid-xl':  'clamp(1.4rem,  3vw,   1.8rem)',
        'fluid-2xl': 'clamp(1.8rem,  4vw,   2.6rem)',
        'fluid-3xl': 'clamp(2.4rem,  6vw,   4rem)',
        'fluid-4xl': 'clamp(3rem,    8vw,   5.5rem)',
      },
      borderRadius: {
        'sm':   '4px',
        'DEFAULT': '8px',
        'md':   '12px',
        'lg':   '16px',
        'xl':   '24px',
        '2xl':  '32px',
        '3xl':  '48px',
        'full': '9999px',
      },
      backdropBlur: {
        'glass': '24px',
        'heavy': '48px',
      },
      animation: {
        'fade-up':      'fadeUp 0.6s cubic-bezier(0.16,1,0.3,1) both',
        'fade-in':      'fadeIn 0.4s ease both',
        'slide-right':  'slideRight 0.5s cubic-bezier(0.16,1,0.3,1) both',
        'shimmer':      'shimmer 2.5s linear infinite',
        'float':        'float 6s ease-in-out infinite',
        'pulse-glow':   'pulseGlow 3s ease-in-out infinite',
        'spin-slow':    'spin 8s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideRight: {
          '0%':   { opacity: '0', transform: 'translateX(-16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6' },
          '50%':      { opacity: '1' },
        },
      },
      boxShadow: {
        'glow-crimson': '0 0 32px rgba(200,16,46,0.25), 0 0 8px rgba(200,16,46,0.4)',
        'glow-forest':  '0 0 32px rgba(0,106,78,0.25), 0 0 8px rgba(0,106,78,0.4)',
        'glow-gold':    '0 0 32px rgba(212,160,23,0.20), 0 0 8px rgba(212,160,23,0.3)',
        'card':         '0 2px 12px rgba(0,0,0,0.6), 0 1px 3px rgba(0,0,0,0.8)',
        'modal':        '0 24px 80px rgba(0,0,0,0.9)',
        'nav':          '0 1px 0 rgba(255,255,255,0.06)',
      },
    },
  },
  plugins: [],
}
