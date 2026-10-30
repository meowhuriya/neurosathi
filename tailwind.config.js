/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0D9488',
          dark: '#0F766E',
          light: '#F0FDFA',
          border: '#CCFBF1'
        },
        secondary: {
          DEFAULT: '#475569',
          dark: '#334155',
          light: '#F1F5F9'
        },
        danger: {
          DEFAULT: '#DC2626',
          light: '#FEF2F2',
          border: '#FECACA'
        },
        warning: {
          DEFAULT: '#D97706',
          light: '#FFFBEB',
          border: '#FDE68A'
        },
        success: {
          DEFAULT: '#059669',
          light: '#ECFDF5',
          border: '#A7F3D0'
        }
      },
      fontFamily: {
        sans: [
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif'
        ]
      },
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
      }
    },
  },
  plugins: [],
}
