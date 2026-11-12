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
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        card: '8px',
      },
    },
  },
  plugins: [],
};
