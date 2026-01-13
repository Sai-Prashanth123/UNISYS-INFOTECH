module.exports = {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1D3557',      // Deep Navy Blue - Trust, security, professionalism
        secondary: '#FFFFFF',    // White/Off-White - Transparency, openness
        accent: '#00BCD4',       // Teal - CTA buttons, hover states, key highlights
        accent2: '#50E3C2',      // Bright Teal/Cyan - Success states, icons
        textPrimary: '#212529',  // Charcoal Black - Headlines, body text
        textSecondary: '#6C757D', // Soft Gray - Subheadings, supporting text
        borderLight: '#E9ECEF',  // Light Gray - Separation
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'SF Pro Text',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
        heading: [
          '-apple-system',
          'BlinkMacSystemFont',
          'SF Pro Display',
          'Segoe UI',
          'Roboto',
          'Helvetica Neue',
          'Arial',
          'sans-serif'
        ],
      },
      animation: {
        'scroll': 'scroll 30s linear infinite',
        'scroll-left': 'scrollLeft 30s linear infinite',
        'scroll-right': 'scrollRight 30s linear infinite',
      },
      keyframes: {
        scrollLeft: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        scrollRight: {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
