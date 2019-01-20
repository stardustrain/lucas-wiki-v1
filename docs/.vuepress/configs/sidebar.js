const sidebarConfig = [
  ['/intro', 'Intro'],
  ['/2018-memoir', '2018 회고록'],
  {
    title: 'TDD',
    children: [
      ['/TDD/01.unit-test-basic', '1. Unit test basic'],
      ['/TDD/02.test-double', '2. Test double']
    ]
  },
  {
    title: 'D3.js',
    children: [
      ['/D3/01.d3js-basic', '1. D3.js intro'],
      ['/D3/02.d3js-enter-function', '2. What is an enter() function?'],
      ['/D3/03.d3js-drawing-bar-chart', '3. Drawing bar chart'],
    ],
  },
  {
    title: 'HTTP definitive guide',
    children: [
      ['/http-guide/01.url-and-resouce', '1. URL과 리소스'],
      ['/http-guide/02.http-message', '2. HTTP message'],
    ]
  }
]

module.exports = sidebarConfig
