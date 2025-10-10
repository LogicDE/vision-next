/** @type {import('tailwindcss').Config} */
module.exports = {
  	darkMode: 'class',
	content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cta: "#BFC5B9",
        "cta-dark": "#AEB2A6", // color para hover
      },
    },
  },
  plugins: [],
};
