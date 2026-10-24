/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F5F7FB',
        ink: '#1B2340',
        muted: '#5F6888',
        line: '#DDE2EE',
        signal: '#2F5BEA',
        signalDark: '#2448C2',
        amber: '#F2A93B',
        mint: '#2FA37A',
        blush: '#FBEEF1',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        body: ['Figtree', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
