/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563EB",
        secondary: "#3B82F6",
        accent: "#6366F1",
        background: "#F8FAFC",
        surface: "#FFFFFF",
        textPrimary: "#1E293B",
        textSecondary: "#64748B",
      },
      fontFamily: {
        sans: ['Inter', 'Outfit', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.05)',
        'glow': '0 0 20px rgba(37, 99, 235, 0.1)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
}
