// Corrected tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.{html,js}"],
  theme: {
    extend: {
      // Your custom configuration has been moved here
      colors: {
        'custom-gold': '#8B6A50', // Muted, elegant taupe/gold accent
        'body-bg': '#F9F9F9',
        'nav-bg': '#FFFFFF',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['system-ui', '-apple-system', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
