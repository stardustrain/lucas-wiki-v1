const CopyWebpackPlugin = require("copy-webpack-plugin");
const navConfig = require("./configs/nav");
const sidebarConfig = require("./configs/sidebar");

module.exports = {
  title: "Lucas's wiki",
  description: "Frontend engineer의 연구 노트와 잡생각, 고민들",
  head: [["link", { rel: "icon", href: "/favicon.ico" }]],
  themeConfig: {
    nav: navConfig,
    sidebar: sidebarConfig,
    displayAllHeaders: false,
    lastUpdated: "Last modified"
  },
  markdown: {
    lineNumbers: true
  },
  configureWebpack: {
    plugins: [
      new CopyWebpackPlugin([
        {
          from: "./docs/.vuepress/robots.txt",
          to: "./"
        },
        {
          from: "./docs/.vuepress/naverd88e40aa68546611223ea210c2871671.html",
          to: "./"
        }
      ])
    ]
  },
  plugins: {
    disqus: {
      shortname: "wiki-lucashan-space"
    },
    "@vuepress/google-analytics": {
      ga: process.env.LUCAS_WIKI_GA
    },
    "reading-progress": {},
    "vuepress-plugin-canonical": {
      baseUrl: "https://wiki.lucashan.space"
    },
    sitemap: {
      hostname: "https://wiki.lucashan.space"
    }
  }
};
