
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0eefe',
          200: '#bbd9fb',
          300: '#8cbdf8',
          400: '#589df3',
          500: '#3b82f6',
          600: '#2272eb',
          700: '#1a5cd7',
          800: '#1a4caf',
          900: '#1a418c',
        },
      },
      boxShadow: {
        'camera': '0 10px 25px -5px rgba(59, 130, 246, 0.3)',
      },
    },
  },
  plugins: [
    require('tailwindcss-motion'),
  ],
  safelist: [
    {
      pattern: /^motion-/
    }
  ],
};
  