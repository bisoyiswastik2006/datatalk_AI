/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['selector', '[data-theme="dark"]'],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        page: 'var(--color-page)',
        card: 'var(--color-card)',
        border: 'var(--color-border)',
        'border-subtle': 'var(--color-border)',
        main: 'var(--color-text-main)',
        secondary: 'var(--color-text-secondary)',
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
          text: 'var(--color-primary-text)',
          tint: 'var(--color-primary-tint)',
        },
        warning: {
          DEFAULT: 'var(--color-warning)',
          text: 'var(--color-warning-text)',
          tint: 'var(--color-warning-tint)',
        },
        error: {
          DEFAULT: 'var(--color-error)',
          text: 'var(--color-error-text)',
          tint: 'var(--color-error-tint)',
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)',
          hover: 'var(--color-destructive-hover)',
          text: 'var(--color-destructive-text)',
          tint: 'var(--color-destructive-tint)',
        },
        sql: {
          bg: 'var(--color-sql-bg)',
          border: 'var(--color-sql-border)',
          keyword: 'var(--color-sql-keyword)',
          literal: 'var(--color-sql-literal)',
          text: 'var(--color-sql-text)',
        },
        // Semantic aliases
        surface: 'var(--color-page)',
        panel: 'var(--color-card)',
        ink: 'var(--color-text-main)',
        'ink-muted': 'var(--color-text-secondary)',
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #0058FD 0%, #00B8FC 100%)',
        'gradient-brand-subtle': 'linear-gradient(135deg, rgba(0, 88, 253, 0.08) 0%, rgba(0, 184, 252, 0.08) 100%)',
      },
      fontSize: {
        'title-page': ['1.75rem', { lineHeight: '1.3', fontWeight: '600' }], // 28px, 600
        'title-card': ['1.25rem', { lineHeight: '1.3', fontWeight: '600' }], // 20px, 600
        body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }],             // 16px, 400
        'table-cell': ['0.9375rem', { lineHeight: '1.4' }],                   // 15px
        'table-header': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }], // 14px, 500
        control: ['1rem', { lineHeight: '1.5' }],                              // 16px
        caption: ['0.875rem', { lineHeight: '1.5' }],                          // 14px
        code: ['0.9375rem', { lineHeight: '1.5' }],                            // 15px monospace
        tick: ['0.8125rem', { lineHeight: '1.4' }],                            // 13px
      },
      fontFamily: {
        sans: ['"Nohemi"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 4px 16px -2px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 28px -4px rgba(0, 0, 0, 0.1)',
        glow: '0 0 24px -4px rgba(0, 184, 252, 0.25)',
      },
      borderRadius: {
        card: '12px',
        subtle: '8px',
      },
      animation: {
        'float-slow': 'floatOrb 14s ease-in-out infinite',
        'pulse-slow': 'pulseFaint 6s ease-in-out infinite',
      },
      keyframes: {
        floatOrb: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '50%': { transform: 'translate(20px, -24px) scale(1.06)' },
        },
        pulseFaint: {
          '0%, 100%': { opacity: '0.35' },
          '50%': { opacity: '0.65' },
        },
      },
    },
  },
  plugins: [],
};
