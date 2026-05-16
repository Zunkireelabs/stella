/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{njk,html,js,md}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        drawn: ['Caveat', 'cursive'],
        pacifico: ['Pacifico', 'cursive'],
      },
      fontSize: {
        'hero':    ['3.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        'hero-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h2':      ['2.9rem',   { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        'h2-sm':   ['2.9rem',   { lineHeight: '1.1',  letterSpacing: '-0.01em' }],
        'h3':      ['1.25rem', { lineHeight: '1.3',  letterSpacing: '-0.01em' }],
        'body-lg': ['1.0625rem',{ lineHeight: '1.7', letterSpacing: '0'       }],
        'body':    ['1rem',    { lineHeight: '1.7',  letterSpacing: '0'       }],
        'label':   ['0.9375rem',{ lineHeight: '1.5', letterSpacing: '0'       }],
        'caption': ['0.8125rem',{ lineHeight: '1.5', letterSpacing: '0'       }],
        'btn':     ['0.9375rem',{ lineHeight: '1',   letterSpacing: '0.01em'  }],
      },
      fontWeight: {
        hero:    '700',
        heading: '600',
        medium:  '500',
        normal:  '400',
      },
      colors: {
        'stella-green':    '#86EFAC',
        'stella-lime':     '#D4F08A',
        'stella-yellow':   '#FEF08A',
        'stella-gradient': '#e0e503',
        'stella-forest':   '#166534',
        'stella-bg':       '#f7ffe4',
        'stella-surface':  '#FFFFFF',
        'stella-text':     '#000000',
        'stella-muted':    '#52645A',
        'stella-border':   '#E5E5E0',
        'stella-emerald':  '#10B981',
      },
      boxShadow: {
        'stella':    '0 8px 32px rgba(247, 255, 228, 0.95)',
        'stella-lg': '0 12px 48px rgba(247, 255, 228, 1)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
        float:   'float 2s ease-in-out infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':      { transform: 'translateY(8px)' },
        },
      },
    }
  },
  plugins: []
};
