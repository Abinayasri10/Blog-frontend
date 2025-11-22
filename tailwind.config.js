/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      colors: {
        background: '#EBF4F6',       // light background
        foreground: '#071952',       // dark text / main foreground
        primary: {
          DEFAULT: '#071952',        // dark blue
          foreground: '#EBF4F6',     // text on primary
        },
        secondary: {
          DEFAULT: '#088395',        // teal/blue
          foreground: '#EBF4F6',
        },
        accent: {
          DEFAULT: '#37B7C3',        // light teal
          foreground: '#071952',
        },
        card: {
          DEFAULT: '#ffffffff',
          foreground: '#071952',
        },
        popover: {
          DEFAULT: '#EBF4F6',
          foreground: '#071952',
        },
        muted: {
          DEFAULT: '#E0E7FF',        // optional light muted color
          foreground: '#071952',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FFFFFF',
        },
        border: '#0ab4cfff',
        input: '#EBF4F6',
        ring: '#37B7C3',
        chart: {
          '1': '#071952',
          '2': '#088395',
          '3': '#37B7C3',
          '4': '#EBF4F6',
          '5': '#088395',
        },
      },
    }
  },
  plugins: [require("tailwindcss-animate")],
}
