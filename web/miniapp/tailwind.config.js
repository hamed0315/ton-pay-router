
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        protocol: {
          violet: '#7C3AED',
          deep: '#0B0B14',
          ton: '#0098EA',
          neon: '#22D3EE',
          glass: 'rgba(255,255,255,0.05)',
        },
        success: '#10B981',
        pending: '#F59E0B',
        failed: '#EF4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'neon-grid': 'linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
