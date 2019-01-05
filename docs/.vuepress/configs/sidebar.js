const sidebarConfig = [
  {
    title: 'Programming Basic',
    children: [
      ['/basic/01.unit-test-basic', '1. Unit test basic'],
      ['/basic/02.test-double', '2. Test double']
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
  ['/2018-memoir', '2018 회고록', ]
  // {
  //   title: 'javascript pattern',
  //   children: [
  //     ['/jspattern/01.partially-applied-function', '1. Partially applied function'],
  //   ],
  // },
]

module.exports = sidebarConfig
