const sidebarConfig = [
  ['/intro', 'Intro'],
  {
    title: '회고록',
    children: [
      ['/post-mortem/2018-memoir', '2018 회고록'],
      ['/post-mortem/2019-memoir', '2019 회고록'],
      ['/post-mortem/post-mortem-2020-Q1', '2020년 Q1 OKR 회고'],
      ['/post-mortem/post-mortem-2020-Q3', '2020년 Q3 회고'],
      ['/post-mortem/2020-memoir', '2020년 회고록'],
    ],
  },
  {
    title: 'Programming',
    children: [
      {
        title: 'TDD',
        children: [
          ['/programming/TDD/01.unit-test-basic', '1. Unit test basic'],
          ['/programming/TDD/02.test-double', '2. Test double'],
          ['/programming/TDD/03.let-it-tdd', '3. TDD 해보기'],
        ],
      },
      {
        title: 'D3.js',
        children: [
          ['/programming/D3/01.d3js-basic', '1. D3.js intro'],
          ['/programming/D3/02.d3js-enter-function', '2. What is an enter() function?'],
          ['/programming/D3/03.d3js-drawing-bar-chart', '3. Drawing bar chart'],
        ],
      },
      ['/programming/make-github-report-bot', 'Github report bot 만들기'],
      ['/programming/introduce-a-graphql-to-odc', 'ODC에 graphql 도입하기'],
    ],
  },
  {
    title: 'HTTP definitive guide',
    children: [
      ['/http-guide/01.url-and-resouce', '1. URL과 리소스'],
      ['/http-guide/02.http-message', '2. HTTP message'],
      ['/http-guide/03-1.http-connection', '3-1. HTTP 커넥션'],
      ['/http-guide/03-2.http-connection-management', '3-2. HTTP 커넥션 관리'],
      ['/http-guide/04.webserver', '4. Web server란'],
    ],
  },
  {
    title: 'Google code review guide',
    children: [
      ['/code-review/01.intro', '1. Intro'],
      ['/code-review/02.the-standard-of-code-review', '2. The Standard of Code Review'],
      ['/code-review/03.what-to-look-for-in-a-code-review', '3. What to look for in a code review'],
      ['/code-review/04.navigating-a-CL-in-review', '4. Navigating a CL in review'],
      ['/code-review/05.speed-of-code-reviews', '5. Speed of Code Reviews'],
      ['/code-review/06.how-to-write-code-review-comments', '6. How to write code review comments'],
      ['/code-review/07.handling-pushback-in-code-reviews', '7. Handling pushback in code reviews'],
    ],
  },
  {
    title: 'Essay',
    children: [['/essay/story-for-experienced-to-xp-with-wife', 'XP 실천방법 따라해 보기 - Pair programming과 TDD']],
  },
  {
    title: 'Book reports',
    children: [
      ['/book-reports/the-practice-of-programming', '프로그래밍 수련법'],
      ['/book-reports/software-craftmanship', '소프트웨어 장인'],
      ['/book-reports/unix-a-history-and-a-memoir', '유닉스의 탄생'],
      {
        title: 'eXtreme Programming',
        children: [
          ['/book-reports/extreme-programming/1', 'eXtreme Programming part 1'],
          ['/book-reports/extreme-programming/2', 'eXtreme Programming part 2'],
          ['/book-reports/extreme-programming/3', 'eXtreme Programming part 3'],
        ],
      },
    ],
  },
]

module.exports = sidebarConfig
