/** @type {import("tailwindcss").Config} */

// to use tailwind colors
// const colors = require("tailwindcss/colors");

module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "../ngx-minithings/**/*.{html,ts}"
  ],
  theme: {
    extend: {
      colors: {
        "c60": "#f4dcda",
        "c30": "#f3be98",
        "c10": "#e67d24",
        "c10-active": "#ec9756",
        "c10-text": "#ffffff"
      },
      animation: {
        "spin-slow": "spin 3s linear infinite",
        "wiggle": "wiggle 1s ease-in-out infinite"
      },
      keyframes: {
        wiggle: {
          "0%, 100%": { transform: "rotate(-3deg)" },
          "50%": { transform: "rotate(3deg)" },
        }
      }
    },
  },
  plugins: [],
};
