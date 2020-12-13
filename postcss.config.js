devPlugins = [
  require('tailwindcss')
];

prodPlugins = [
  require('tailwindcss'),
  require('cssnano')({
    preset: 'default',
    discardComments: {removeAll: true}
  })
];

module.exports = {
  plugins: process.argv.includes('PURGE') ? prodPlugins : devPlugins,
}