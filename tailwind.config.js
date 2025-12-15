/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./App.tsx",
    "./index.tsx",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./hooks/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Custom brand colors
        'blue-ridge': '#5B6D92',
        'sage-brush': '#708A87',
        'charcoal': '#464646',
        'granite-blush': '#BCB0AF',
        'soft-amethyst': '#8C728B',
        'snow-drift': '#FAFAF5',
        // Background colors
        'bg-primary': '#FDFDFD',
        'bg-secondary': '#F9F9F9',
        'bg-tertiary': '#F0F0F0',
      },
    },
  },
  plugins: [],
}
