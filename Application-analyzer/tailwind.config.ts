/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {

        darkblue: "#082777",
        lightblue: "#DDEAFB",
        accentprimary: "#68BD53",
        accentsecondary: "#F7AC25",
        graybg: "#E6EEF8",
        lines: "#D3E2F4",
        textdark: "#071C50",
        lightgraybg: "#F3F8FF",
        mygreen: "#469607",
        darkred: "#D73F3F",
        lightred: "#D73F3F2E",
        darkgreen: "#087213",
        lightgreen: "#B0F1B6",
        lilightblue: "#A0DBF457",
        lidarkblue: "#1B5CBE",
        lilightgreen: "#B0F1B65C",
        lidarkgreen: "#2B5708",
        liblue: "#A0DBF4",
        ligreen: "#B0F1B6"
      },
      fontFamily: {
        poppins: ['"Poppins"', 'serif']
      }
    },
  },
  plugins: [],
}

