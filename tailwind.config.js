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
      },
      fontSize: {
        'hero':    ['3.5rem',  { lineHeight: '1.1',  letterSpacing: '-0.03em' }],
        'hero-sm': ['2.25rem', { lineHeight: '1.15', letterSpacing: '-0.02em' }],
        'h2':      ['2.375rem',{ lineHeight: '1.2',  letterSpacing: '-0.02em' }],
        'h2-sm':   ['1.625rem',{ lineHeight: '1.25', letterSpacing: '-0.01em' }],
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
        'stella-green':   '#86EFAC',
        'stella-lime':    '#D4F08A',
        'stella-yellow':  '#FEF08A',
        'stella-forest':  '#166534',
        'stella-bg':      '#FAFAF7',
        'stella-surface': '#FFFFFF',
        'stella-text':    '#0F1216',
        'stella-muted':   '#5B6470',
        'stella-border':  '#E5E5E0',
        'stella-emerald': '#10B981',
      },
      backgroundImage: {
        'stella-gradient':     'linear-gradient(90deg, #86EFAC 0%, #D4F08A 50%, #FEF08A 100%)',
        'stella-gradient-135': 'linear-gradient(135deg, #86EFAC 0%, #FEF08A 100%)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '20px',
      },
      animation: {
        marquee: 'marquee 20s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%':   { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    }
  },
  plugins: []
};
