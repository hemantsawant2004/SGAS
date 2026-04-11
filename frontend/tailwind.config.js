/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',                 // ← REQUIRED for .dark on <html>
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: { 
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0,0,0,0.2)',
        'premium-hover': '0 20px 40px -10px rgba(0,0,0,0.3)',
      },
      backgroundImage: {
        'glass-gradient': 'linear-gradient(135deg, rgba(255,255,255,0.1), rgba(255,255,255,0))',
      }
    } 
  },
  plugins: [],
};
