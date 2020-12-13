module.exports = {
  purge: {
    content: ['public/index.html', 'app.js'],
    enabled: process.argv.includes('PURGE'),
  },
  theme: {
    fontFamily: {
      sans: ['Roboto', 'Arial', 'Helvetica', 'sans-serif'],
    },
    container: {
      center: true,
      padding: {
        default: '2rem',
      },
    },
    extend: {
      cursor: {
        'zoom-in': 'zoom-in',
        'zoom-out': 'zoom-out',
      },
    },
  },
  variants: {
    borderColor: ['hover', 'focus', 'group-hover'],
  },
  plugins: [],
};
