/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#00D4FF',
          dark: '#009EBF',
          light: '#33DDFF',
          50: '#f0fbff',
          100: '#ccf4ff',
        },
        surface: {
          DEFAULT: '#1A2535',
          dark: '#0F1923',
          darker: '#0A1018',
          border: '#243044',
          hover: '#1E2D40',
        },
        rackley: '#5d8aa8',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
