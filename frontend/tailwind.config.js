/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      gridTemplateColumns:{
        'auto':'repeat(auto-fill, minmax(200px, 1fr))',
        // smaller cards on phones so two fit side by side
        'auto-sm':'repeat(auto-fill, minmax(150px, 1fr))'
      },
      colors:{
        'primary':'#5F6FFF'
      }
    },
  },
  plugins: [],
}