const navConfig = require('./configs/nav')
const sidebarConfig = require('./configs/sidebar')

module.exports = {
  themeConfig: {
    nav: navConfig,
    sidebar: sidebarConfig,
  },
  ga: process.env.LUCAS_WIKI_GA
}
