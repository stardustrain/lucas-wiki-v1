const CopyWebpackPlugin = require('copy-webpack-plugin')
const navConfig = require('./configs/nav')
const sidebarConfig = require('./configs/sidebar')

module.exports = {
  themeConfig: {
    nav: navConfig,
    sidebar: sidebarConfig,
  },
  ga: process.env.LUCAS_WIKI_GA,
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([{
        from: './docs/.vuepress/lucashan.space.xml',
        to: './'
      }, {
        from: './docs/.vuepress/robots.txt',
        to: './'
      }])
    ]
  }
}
