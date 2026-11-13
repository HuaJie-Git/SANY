/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-red': '#E60012',
        'brand-blue': '#00A9E8',
        'brand-blue-hover': '#009EF0',
        'theme-cyan': '#09BFE2',
        'theme-blue': '#009FFF',
        'app-bg': '#F3F4F8',
        'text-dark': '#1D232B',
        'text-muted': '#8D929C',
        'bg-gray': '#F2F2F7',
        'card-white': '#FFFFFF',
        'text-primary': '#333333',
        'text-secondary': '#666666',
        'text辅助': '#999999',
        'unread-bg': '#FBE6E6',
        'pending-bg': '#CCF1DB',
        'success': '#52C41A',
        'warning': '#FAAD14',
        'error': '#FF4D4F',
      },
      fontFamily: {
        'pingfang': ['PingFang SC', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
