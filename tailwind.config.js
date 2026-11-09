/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#3368A0',
        secondary: '#66A3BF',
        tint: '#C8DFDB',
        surface: '#F2EFE7',
        ink: '#14283D',
        'ink-muted': '#4A5F73',
        status: {
          error: '#A62626',
          'error-bg': '#FBEAEA',
          warning: '#996000',
          'warning-bg': '#FEF7E6',
          success: '#1B6A3B',
          'success-bg': '#EAF5EE',
        },
      },
      fontFamily: {
        sans: ['"Nohemi"', 'system-ui', '-apple-system', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', '"JetBrains Mono"', 'Consolas', 'monospace'],
      },
      boxShadow: {
        subtle: '0 1px 3px rgba(20, 40, 61, 0.06)',
        card: '0 2px 6px rgba(20, 40, 61, 0.08)',
      },
    },
  },
  plugins: [],
};

