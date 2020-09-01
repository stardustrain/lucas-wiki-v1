---
title: ODC에 graphql 도입하기
meta:
  - name: description
    content: 회사의 서비스인 ondemandchina에 graphql을 도입한 과정을 공유합니다.
  - name: keywords
    content: ODC에 graphql 도입하기
  - property: og:title
    content: ODC에 graphql 도입하기
  - property: og:description
    content: 회사의 서비스인 ondemandchina에 graphql을 도입한 과정을 공유합니다.
  - property: og:url
    content: https://wiki.lucashan.space/programming/introduce-a-graphql-to-odc.html
---

# ODC에 graphql 도입하기

최근 세 달여간의 작업 끝에, 회사의 서비스인 [ondemandchina](https://ondemandchina.com)를 위한 graphql server를 배포했다. 작년에 팀에 합류하여 여러 가지 활약을 보여준 [김지훈](https://future-seller.dev/) (a.k.a. Professor K)님과 함께 작업을하였고, 이제부터 frontend app과 mobile app에 점진적으로 적용하는 일만 남았다.

사실 팀의 관리 포인트가 하나 더(그것도 익숙한 frontend가 아닌 backend에 가까운) 늘어난다는 것은 팀 전체로 보았을 때 확실히 리스크가 있는 결정이었다. 특히 backend팀에서 운영하는 API server가 있음에도 운영 경험이 없는 서비스를 frontend팀이 도입한다는 것은 많은 설득과 과감한 결정이 있어야 하는 것이었다.

그럼에도, 어떠한 이유가 있었기 때문에 여러 리스크를 감수하며 과감히 graphql을 도입하였는지 그간의 고민과 배포까지 있었던 일들을 공유하고자 한다. 아, 이 이야기는 철저히 화면을 만드는 frontend의 관점으로 전개될 것이기 때문에, backend 관점에서의 고민을 다루지 못한다는 점은 양해해 주셨으면 좋겠다.

## 1. 새로운 팀원과 ondemandchina

올해 초 frontend team building이 마무리되면서 새로운 팀원이 5명이나 늘어났다. 급속도로 팀이 커졌지만, 다행히도 각자의 전문분야와 지식이 잘 조합되어 개선된 부분도 많았고 코드 리뷰도 퀄리티가 더 좋아졌다.

우리팀은 처음 합류하신 분들에게 프로젝트를 소개하고 코드를 가볍게 훑어보는 on boarding 시간이 있었는데, 한 가지 작은 문제가 있었다. 데이터를 server에 요청해서 화면에 필요한 형태로 바꾸는 부분이었는데, 만들 때는 아무 생각 없었지만 다시 보니 복잡해 보였다. Backend팀의 API문서는 괜찮았지만, 우리 팀의 관점에 보았을 때 중요한 포인트인 `API 간의 상관관계`가 명시되어있지 않았다. 그렇기 때문에, 매 on boarding 마다 API들의 상관관계와 호출 순서, 이렇게 구현할 수밖에 없던 이유에 관해서 설명하는데 시간이 걸리곤 했다.

직접 작성한 `models.d.ts`도 문제였다. (분명한 잘못이지만) API의 변화에 맞춰 제대로 업데이트하지 않았기 때문에 필요 없는 property들이 많이 선언되어 있었고, 실제 API의 값과 다른 경우도 있었다. 이러한 문제들이 있어 코드 리뷰를 할 때나, 새로 온 팀원들이 ondemandchina에 관련한 task를 처리할 때 문제를 겪었다.

이런 문제가 반복되다 보니, 팀의 리더인 [**그 분2**](https://blog.roto.codes/)는 어떻게 하면 좋을지에 대해 고민해보라고 ~~명령~~ 하셨고, 나와 동료인 [제프리](https://brightparagon.wordpress.com/)는 ~~절대복종~~ 문제의 원인을 먼저 찾기로 하였다.

## 2. RESTful 너란 녀석

Ondemandchina의 backend server는 전통의 강자 python DRF(django REST framework)로 구현되어있다. DRF는 (정확히 django는) 오랫동안 사랑받은 framework이기 때문에 사용자도 많고 탄탄하며, (적어도 내가 볼 때는)합리적이다. Request에 대한 response가 잘 통제되어있고, 미리 구현되어있는 base class들이 추상화가 잘 되어있어 짧은 코드로도 많은 것들을 할 수 있다는 것이 장점이다.

그렇기 때문에 response에 특별히 다른 처리를 하지 않는 이상은 전형적인 RESTful 컨셉을 잘 유지할 수 있다 (RESTful 컨셉은 구글링을 통하면 양질의 자료들을 많이 찾을 수 있으니 구태여 설명하지는 않겠다). 특히 RESTful API는 url path와 method의 조합으로 어떤 API인지 쉽게 알아볼 수 있는 장점이 있어 개인적으로도 좋아하는 컨셉이다.

하지만 아이러니하게도 제프리와 나는 우리 팀이 겪는 어려움의 원인을 (전부는 아니지만) atomic 하게 잘 만들어진 API라고 생각하게 되었다.

### 늘어나는 endpoint

우선 API들이 atomic 하게 잘 짜여있어 필요한 데이터만 요청하기에 용이했지만, 반대로 프로젝트가 진행되면 될수록 endpoint가 늘어나는 단점이 발생했다. 거기에다 query string을 처리하기 위해 url들을 함수로 관리하고 있었기 때문에 팀원들이 처음에 조금 혼란을 겪었다. 버그를 발생시킨 것은 아니었지만 팀원이 실수로 GET, POST 요청에 쓰이는 url을 return 하는 함수에 default query string을 추가한 것을 뒤늦게 수정한 해프닝도 있었다.

```typescript
// urls.ts
const getFavoriteUrl = (qs?: string) => {
  return `${API_ENDPOINT}/API/favorites/?${qs ?? 'page_size=10'}`
}

// A.tsx
useRequestAPI({
  url: getFavoriteUrl('page_size=20'),
})

// B.tsx
useRequestAPI({
  method: 'POST',
  url: getFavoriteUrl(),
})
```

특정 endpoint에서는 두 가지 타입의 데이터가 return 되었는데 path name만 보고는 예측하기 쉽지 않다는 생각이 들어 평소에 잘 남기지 않는 주석을 남긴 적도 있었다.

### 화면을 그리기 위한 API의 조합

제일 큰 이유라고 생각한 부분이다. 화면 하나를 그리기 위한 API들의 조합과 호출 순서, 상관관계가 RESTful 컨셉으로는 명확하게 표현되지 않았다. 데이터를 atomic 하게 다루고 있기 때문에 발생한 side effect라고 생각하는데, 다음의 화면이 아주 좋은 예시가 될 것 같다.

<center>
<figure>
<img src="https://user-images.githubusercontent.com/9318449/90943245-193c7600-e454-11ea-905a-943ba1781503.png
" />
<figurecaption style="font-size: 14px;">Ondemandchina의 home 화면</figurecaption>
</figure>
</center>

Home 화면의 아랫부분은 각 carousel과 그 carousel을 구성하는 carousel item으로 구성되어 있다. 이 부분은 admin service를 통해 carousel의 제목과 그것을 어떤 프로그램 혹은 에피소드로 구성할지 결정할 수 있다. 그렇기 때문에 Home component의 data 가공 로직이 의도치 않게 복잡해졌는데, 대략 다음의 순서로 carousel이 그려지게 된다.

1. Carousel 정보를 호출한다.

   - 호출 결과에는 carousel의 제목과 이 carousel이 어떤 타입의 item을 갖는지에 대한 meta 정보만 포함되어있다.
   - Carousel item이 가질 수 있는 타입은 수동으로 프로그램 / 에피소드를 선택하는 방법과 특정 로직을 선택하는 것 (최신순, 인기 많은 순 등), 사용자의 시청기록이다.

2. 호출 결과의 meta 정보를 통해 rendering 할 세 종류의 component들을 각각 선택한다.
3. 각 component에서는 각각의 특성에 맞게 url들을 조합하여, 데이터를 요청한다.
4. 이때, login 되어있지 않으면 시청기록은 화면에 표시하지 않는다.

뭔가 글로 설명은 잘하지 못하겠지만 위와 같은 과정을 거쳐 home 화면이 그려지며, 자세히는 아니지만 코드로 표현하자면 대략 다음과 같다.

```typescript
const Carousel = () => {
  return ( /* 실제로 화면에 표현되는 carousel UI */ )
}

const LogicOrderingCarousel = ({ logic }) => {
  const result = useRequestAPI({
		url: getUrlWithLogic(logic)
	})

	return <Carousel item={result} />
}
const CWCarousel = () => { ... }
const ManualIdsCarousel = ({ ids }) => {
	const result = useRequestAPI({
		url: getEpisodeUrlWithIds(ids)
	})

	return <Carousel item={result} />
}

const HomePage = () => {
  const result = useRequestAPI({
    url: getCarouselUrl()
  })

	const renderComponent = () => result.map(meta => {
		if (isAuthenticated && meta.type === 'CW') {
			return <CWCarousel />
		}
		if (meta.type === 'LOGIC') {
			return <LogicOrderingCarousel logic={meta.logic} />
		}
		if (meta.type === 'MANUAL') {
			return <ManualIdsCarousel ids={meta.ids} />
		}
		return null
	})

	return result ? renderComponent() : null
}
```

설명하자면 HomePage component가 render 되면서 carousel의 meta 정보를 요청하고, 요청한 meta 정보에 따라 각 component가 `renderComponent()` 함수를 통해 render된다. 각 component는 다시 HomePage에서 주입받은 props를 통해 적당한 API endpoint를 만들어 호출하고, 최종적으로 화면에 보여줄 데이터를 Carousel component를 통해 그려내는 것이다.

사실 이 로직이 새로 합류하신 분들에게 가장 많은 질문을 받고, 그분들에게 가장 많은 챌린지를 받은 부분이다. 결국 눈에 띄게 개선하지 못했지만 말이다.

### 문서화!

Backend 팀에게 가장 요청하기 힘든 부분이었다. 그만큼 조심스럽기도 했고. 왜냐하면 현재 회사의 backend팀이 인원에 비해 많은 부분을 담당하고 있기 때문에 인력이 많이 부족하기 때문이다 (ODKMedia에서 [python 개발자](https://boards.greenhouse.io/odkmediainc/jobs/4114581003)를 모십니다. [SRE 개발자](https://boards.greenhouse.io/odkmediainc/jobs/4114581003)도 모셔요. 많이많이 지원해주세요).

API 문서는 redoc을 통해 자동으로 만들어지고, backend팀의 [김애영 님](https://kimaeyeong.tumblr.com)이 틈틈이 관리해 주시기 때문에 퀄리티는 훌륭하지만, 중간중간 미처 확인해 주시지 못한 부분들이 존재했다. 예를 들면 required 라고 표시되어 있었는데 실제로 값이 내려오지 않는 경우도 있거나, 특정 object의 type이 JSON type이라고만 되어있어 실제로 어떤 값이 들어있는지 문서만으로는 알 수 없는 경우도 있었다. 물론 backend팀의 지속적인 노력으로 점점 이런 빈틈이 사라지고 있지만 말이다.

## 3. Graphql 도입

위의 이유로 우리 팀은 서서히 장엄하고도 우아한, 그러면서도 확실한 해결책을 찾아야 한다는 유혹에 굴복하기 시작했고, 그 유혹 중 하나였던 graphql를 선택하였다. 물론 처음부터 무조건 도입을 하기로 한 것이 아니라 충분한 PoC를 거쳐 도입 여부를 결정하기로 하였다.

### Architecture

Graphql은 web, app과 API server 사이에서 일종의 interface layer 역할(우리 팀 내부에서는 cloud API라는 단어를 사용한다)을 하게끔 구성하였다(말이 어렵지 그렇게 거창한 것이 아니다). 쉽게 말해, client에서 필요한 데이터를 query 혹은 mutation으로 호출하면 graphql이 적당한 API를 API server에 요청하고, 그 응답을 schema에 맞게 조합하는 역할을 맡겼다.

Graphql이 자체적으로 cache에 data를 저장하게 되면 응답이 빨라지는 효과도 있어, 더는 DB를 괴롭히지 않아도 되는 장점도 있었다. 서비스의 특성상 거의 변하지 않는 content위주의 data를 serving해야하기 때문에 더 안성맞춤이었다. Dynamic query가 거의 없었기 때문에, 화면에 필요한 data를 cache하기도 훨씬 쉬웠다.

### Schema 정의

먼저 redoc에서 open API 형태로 json 파일을 추출한 다음, [openapi-to-graphql](https://github.com/IBM/openapi-to-graphql) 패키지의 도움을 받아 graphql schema로 만들었다. 위에서도 말했지만, 그때 당시에는 API문서가 완벽하지 않았기 때문에 이렇게 만들어진 schema를 기반으로 2단계 작업에 돌입했다.

그다음 한 일은 API문서와 화면을 보며 실제로 client에서 필요한 형태로 schema를 재정의한 것이었다. 정의가 끝난 schema는 API의 응답을 일일이 확인하며 다듬었다. 이 과정이 시간이 오래 걸리기도 했고, 꽤 지루한 작업이었다.

하지만 지루한 만큼 보람도 있었는데, 거의 방치되었던 `models.d.ts` 를 대체할 수 있는 명확한 model이 생겼다는 사실이었다 ~~동시에 나의 나태함을 온몸으로 깨닫기도 했지만 말이다~~.

### RESTful API를 query와 mutation으로 wrapping 하기

어떻게 했는지 기술하기에 앞서, 6월에 [graphql korea](https://www.facebook.com/groups/graphql.kr)에서 진행했던 [graphql meetup](https://www.youtube.com/watch?v=tVNOKT7xqPo)에서 많은 힌트와 영감을 얻었음을 밝힌다 (또 해주세요!).

Query와 mutation을 추가하는 것은 아주 어렵지 않았다. 직접 DB에 접속하는 것이 아니었기 때문에 DB의 성능이나 N+1과 같은 문제를 고민할 필요가 없었고 (dataloader가 필요 없었다는 뜻) [apollo graphql server](https://www.apollographql.com/docs/apollo-server/)를 기반으로 코드를 작성했기 때문에 일정한 패턴으로 코드를 산출할 수 있었다.

특히 apollo graphql server는 RESTful API를 wrapping하려면 [apollo-datasource-rest](https://www.apollographql.com/docs/apollo-server/data/data-sources/)를 이용하는 것을 권장하고 있기 때문에 크게 어렵지 않았다. API를 유형별로 모아놓고, 각각의 endpoint를 호출하게 한 다음, resolver에서 이 datasource를 사용하는 방법으로 구현하였다.

```graphql
# User.schema
type UserInfo {
  gender: String!
  age: Int!
}

type User {
  email: String!
  watchHistories: [Episode!]!
  info: UserInfo!
}

type Root {
  user: User!
}
```

```typescript
// UserAPI.ts
class UserAPI extends RESTDataSource {
  constructor() {
    this.baseUrl = API_ENDPOINT
  }

  willSendRequest(req: RequestOptions) {
    req.headers.set('Authorization', this.context.token)
  }

  async getWatchHistories() {
    // Response => typeof Episode
    return this.get('/wh/?page_size=24')
  }

  async getUserInfo() {
    // Response => { gender: 'M', age: 30 }
    return this.get('/profile/')
  }
}

// userResolver.ts
const userResolver = {
  User: {
    info: async (_source, _args, { dataSources }) => {
      return dataSources.userAPI.getUserInfo()
    },
    watchHistories: async (_source, _args, { dataSources } => {
      return dataSources.userAPI.getWatchHistories()
    },
  }
}
```

Query나 mutation의 convention은 [github api v4](https://docs.github.com/en/graphql)를 많이 참고하였다. 처음에는 relay spec을 구현한 줄도 모르고 github convention이라고 부르기도 하였다. 아무튼, github api의 naming 규칙과 relay spec문서를 직접 참고하며 최대한 표준에 가깝게 구현하기 위해 노력했다. Backend api가 cursor pagination이 아니기 때문에 connection spec을 완벽하게 구현하지는 못했지만, best practice에 대해 감을 잡을 수 있었다.

### 성능테스트

회사에서도 처음 도입하는 기술이었기 때문에 챙겨야 할 부분들이 있었는데, 성능이 그중 최우선이었다. 이 PoC를 믿고 아낌없이 지원해주신 분들 ~~쉽게 말해 높으신 분들~~ 이 새로 도입되는 server의 성능에 대해 궁금해하셨고, 아키텍처의 변화가 있을 때마다 metric을 수집했다.

성능 테스트(부하 테스트)는 우선 aws c5.large (2cpu / 4g ram)정도의 server에 nginx + pm2를 이용해 reverse proxy 설정을 하였다. 그다음, 같은 vpc내에 4대의 인스턴스를 띄워 [easygraphql-load-tester](https://github.com/EasyGraphQL/easygraphql-load-tester)와 [artillery](https://artillery.io/)를 이용해 정해진 query와 무작위로 생성된 query를 섞어서 10여 분간 반복 요청을 하는 방식으로 진행하였다.

테스트를 진행한 결과, 자주 호출되고 호출 로직 자체가 API에 많은 부하를 주는 query들을 cache하기로 결정하였다. 그리고 이에 맞게 cache plugin을 가볍게 구현하여 적용하였다. 이 과정에서 metric을 보는 법을 알게 되었는데 정말 의미 있었다. 아낌없이 알려주시고 조언해주신 backend팀의 권국헌님이 계셔서 가능한 일이었다.

Cache덕분에 API를 호출하던 부분의 유의미한 성능 개선을 기대할 수 있게 되었다. 이전에는 APIserver에서 각각의 endpoint를 cache하고 있더라도 결국 이 API를 각각 호출하여 조합해야 하는 문제가 있었다. 하지만 graphql이 client에서 필요한 data자체를 cache하고있다가 resolver에 도달하기 전에 response하다보니 data를 받아오는 속도 자체가 빨라질 수 있었다.

## 4. 무엇이 개선되었는가

### Component에 필요한 데이터를 선언할 수 있다

Component에 **필요한 데이터를 선언할 수 있게 되었다**는 점은 정말 매력적이라고 생각한다. 기존의 방식인 response 덩어리에서 필요한 데이터를 filtering하거나 mapping하여 하위 component에 전달하는 것이 아니라, 하위 component에서 fragment를 이용해 필요한 데이터를 명시하고 query의 결과를 그대로 사용하게 된 것이다.

이런 방식으로 data를 받아오게 되니 각 component에 맞게 data를 조합하는 로직이 크게 줄어들어 복잡한 코드들이 대부분 사라졌다. 위에서 예를 들었던 HomePage component의 코드는 200줄에서 60여 줄로 줄어드는 기염을 토하기도 했다. 필요한 데이터를 선언하여 받아옴으로써 복잡한 데이터 가공 로직에서 해방될 수 있었던 덕이다.

결과적으로는 component의 기능과 역할이 더욱 직관적으로 드러나 보이는 효과가 있었다. 정확히는, 이런 로직을 graphql쪽으로 분리하면서 client는 좀 더 **화면을 보여주는 데 집중**할 수 있게 된 것이다.

### Backend팀과 Frontend팀이 각자의 관심사에 맞게 API를 작성할 수 있다

*표준*은 정말 중요하다고 생각한다. 우리 frontend 개발자들도 항상 웹표준이라는 것을 준수하기 위해 노력하고 있으니 말이다. 그렇기 때문에 backend 개발자들이 RESTful 컨셉을 준수하기 위해 고민하는 것도 당연하다고 생각한다. Ondemandchina 프로젝트의 경우 이 부분에서 frontend와 backend가 미묘하게 엇갈리는 부분이 발생했다.

<div style="display: flex;justify-content: space-between;">
  <figure style="width: calc(50% - 5px); text-align: center; margin: 0 10px 0 0;" >
    <img src="https://user-images.githubusercontent.com/9318449/90944993-0aa68c80-e45d-11ea-96e4-cf5fa5742c4c.png" />
    <figurecaption style="font-size: 14px;">Favorite list</figurecaption>
  </figure>
  <figure style="width: calc(50% - 5px); text-align: center; margin: 0;" >
    <img src="https://user-images.githubusercontent.com/9318449/90945001-1b570280-e45d-11ea-87b1-1c9b08237e78.png"/>
    <figurecaption style="font-size: 14px;">Watch history</figurecaption>
  </figure>
</div>

위의 두 화면은 각각 유저가 '좋아요'를 누른 프로그램들의 목록을 보여주는 화면과 시청 기록을 보여주는 화면이다. Frontend의 입장에서 보면 해당화면은 단지 list를 받아서 반복적으로 component를 나열한다는 분명한 공통점이 존재한다. 하지만 두 화면의 API response는 약간 다른 방식으로 처리되어있다.

```typescript
// FavoritesPage.tsx
export default function FavoritesPage() {
  const [{ data }] = useRequestApi({
    url: getFavorites()
  })

  const favorites = data.results?.map(({ program }) => program)
  const isEmpty = favorites?.length === 0
  return ( ... )
}

// WatchHistoryPage.tsx
export default function WatchHistoryPage() {
  const [{ data, statusCode }] = useRequestApi({
    url: getWatchHistories()
  })

  const watchHistories = data
  const isEmpty = statusCode === HttpStatus.NO_CONTENT
  return ( ... )
}
```

왜냐하면 두 API의 response되는 data의 형태가 다르기 때문이다. Favorite 목록은 pagination을 지원하고 watch history 목록은 지원하지 않는데, django는 그 차이를 구분해 response 형태를 결정한다.

```typescript
type FavoritesResponse = {
  count: number
  next: string
  previous: string
  results: [Program]
}

type WatchHistoriesResponse = [Episode]
```

Django의 표준 response를 그대로 지키려는 결정 자체에는 불만이 없었다. 하지만 frontend에서의 처리 로직의 추상화가 힘들어지고 동일한 형태의 화면을 표현하는데 사용하는 API들의 response를 예측할 수 없다는 것이 고민이었다. 이러한 고민을 graphql에서 다음과 같이 처리하였다.

```typescript
// userResolvers.ts
const resolvers: { User: UserResolvers<{ dataSources: DataSources }> } = {
  User: {
    async watchHistories(_obj, _args, { dataSources }) {
      const result = await dataSources.userAPI.getWatchHistories()

      // 실제로 frontend에서 받는 data
      return {
        nodes: result.length > 0 ? result : [],
      }
    },

    async favorites(_obj, args, { dataSources }) {
      const result = await dataSources.favoriteAPI.getFavorites(args)

      // 실제로 frontend에서 받는 data
      return {
        totalCount: result.count,
        nodes: result.results.map(result => result.program),
        pageInfo: getPageInfo(result.previous, result.next),
      }
    },
  },
}
```

Connection spec을 구현할 수 없는 구조체에 `nodes`라는 property name을 사용하는 것에 대해 팀원과 많이 고민했지만, frontend에서의 사용 용이성을 우선하자는 쪽으로 합의가 되었다. PoC 기간에 graphql을 frontend에 적용하였을 때 처리 로직은 아래와 같이 수정되었다.

```typescript
// FavoritesPage.tsx
export default function FavoritesPage() {
  const data = useFavoritesQuery()

  const isEmpty = data?.nodes.length === 0
  return ( ... )
}

// WatchHistoryPage.tsx
export default function WatchHistoryPage() {
  const data = useWatchHistoriesQuery()

  const isEmpty = data?.nodes.length === 0
  return ( ... )
}
```

위에 보이듯, API의 response 형태를 크게 신경 쓰지 않고도 비슷한 형태의 API에 대해서 response type을 예측할 수 있게 되었다.

이렇게 graphql은 API의 response를 각 팀의 관심사를 절충해주는 layer가 될 수 있었다. Backend팀은 기존의 RESTful API를 만들고, frontend팀은 받아서 쓰기 편한 형태의 API를 만들면 되는 것이다.

### Typescript와 잘 맞는다

[Graphql Code Generator](https://graphql-code-generator.com/)를 사용하면 graphql schema를 기반으로 type과 enum을 깔끔하게 만들어 주는 것이 정말 좋았다. Frontend app의 build 시점에 graphql server에 선언된 schema를 기준으로 type, enum이 생성되기 때문에 graphql과 frontend app간의 model정의가 완벽하게 sync된다. 이전처럼 `models.d.ts`같은 파일을 수동으로 관리하지 않아도 되는 것이다. 위의 WatchHistoryPage component를 예로 들어 보겠다.

이렇게 하면

```graphql
# watchHistories.graphql
query WatchHistories {
  watchHistories {
    episodeId
    progressRatio
    episode {
      titleEn
      titleZhHans
      titleZhHant
      program {
        slug
        titleEn
        titleZhHans
        titleZhHant
      }
      images {
        thumbnail
      }
      number
      videoCcLanguages
      kind
      videoDuration
    }
  }
}
```

이런 것을 만들어 주고

```typescript
// generated.tsx
export type WatchHistory = {
  __typename?: 'WatchHistory'
  userId: Scalars['Int']
  programId: Scalars['Int']
  episodeId: Scalars['Int']
  sessionKey: Maybe<Scalars['String']>
  totalPlayTime: Scalars['Float']
  lastPosition: Scalars['Float']
  duration: Scalars['Float']
  progressRatio: Maybe<Scalars['Float']>
  watched: Scalars['Boolean']
  updatedAt: Scalars['Date']
  episode: Episode
}

export function useWatchHistoriesQuery(
  baseOptions?: ApolloReactHooks.QueryHookOptions<WatchHistoriesQuery, WatchHistoriesQueryVariables>
) {
  return ApolloReactHooks.useQuery<WatchHistoriesQuery, WatchHistoriesQueryVariables>(
    WatchHistoriesDocument,
    baseOptions
  )
}
```

이렇게 쓸 수 있다.

```typescript
// WatchHistoryPage.tsx
import { useWatchHistoriesQuery } from './generated.tsx'

export default function WatchHistoryPage() {
  const data = useWatchHistoriesQuery()

  return ( ... )
}
```

특히 function component에서 hooks를 사용한다고 하면 개발자가 선언해 놓은 query를 기반으로 요청부터 타입 추론까지 모든 것이 준비되어있는 별도의 hooks도 만들어 준다. Function component를 사용하지 않는 경우 HOC 형태로 생성하는 것도 가능하다. 그렇기 때문에 만약 typescript를 사용하는 경우 많은 이득을 볼 수 있다.

### Playground

Graphql server는 기본적으로 [graphiql](https://github.com/graphql/graphiql)가 내장되어있어, schema를 기반으로 query와 mutation을 테스트해볼 수 있는 playground를 사용할 수 있다. 물론 swagger라는 훌륭한 documentation tool이 존재하지만, 별도의 설정이 필요하지 않다는 점이 가장 큰 차이인 것 같다. 문서화 + testbed를 구현하는데 들이는 시간을 아낄 수 있다는 것은 정말 좋은 것 같다. 사실 와이프와 토이 프로젝트를 했을 때, 가장 귀찮았던 일이 swagger를 설정하는 일이었다.

<figure style="text-align: center;">
<img src="https://camo.githubusercontent.com/1a26385e3543849c561cfafd0c25de791a635570/68747470733a2f2f692e696d6775722e636f6d2f41453557364f572e706e67" />
<figurecaption style="font-size: 14px;">
graphql playground - 출처: <a href="https://github.com/prisma-labs/graphql-playground">https://github.com/prisma-labs/graphql-playground</a>
</figurecaption>
</figure>

Schema 간의 상관관계를 아주 훌륭하게 시각화해 주는 [graphql-voyager](https://github.com/APIs-guru/graphql-voyager)를 admin에서 확인할 수 있게 설치해 놓았다.

<figure style="text-align: center;">
<img src="https://user-images.githubusercontent.com/9318449/90949911-004db800-e488-11ea-9d8b-24b4db6226fe.png" />
<figurecaption style="font-size: 14px;">
graphql-voyager로 볼 수 있는 schema 상관관계
</figurecaption>
</figure>

Graphql voyager의 경우 새로 합류한 팀원들에게 반응이 괜찮았다. Schema의 상관관계라는 것은 결국 화면을 구성하는 data의 상관관계이기 때문이다. 아직 graphql을 본격적으로 적용하지 않았지만, component간의 구조나 data의 흐름을 파악하는 데 많은 도움이 되었다고 한다.

## 5. 무엇이 고민이었는가

### 설득하기

이 과정이 가장 힘들었다. 기술적인 문제야 해결하면 그만이지만 이해 당사자들을 설득하는 것이 정말 힘든일이라는 것을 다시 깨닫게 되었다. 다행히 개발팀 내부에서는 반대하는 의견이 거의 없었지만 문제는 외부의 팀이었다. Demo day에 graphql을 시연하고 왜 이 프로젝트를 진행하는지 설명하는 자리가 있었다. 그 당시 PM팀과 QA팀에서는 조금 당황하는 눈치였는데 충분히 공감되는 반응이었다.

PM팀에서는 (정말 당연한 이야기지만) 솔루션이 새롭게 도입되었다면 제품에 실질적인 개선이 있어야 하는것이 아니냐는 질문을 했다. 이 질문에는 client에서 API request 회수가 줄어든 다는 부분을 이야기했다. 특히 home 화면의 경우 13번에서 2번으로 줄어들었고, graphql에서 cache하고 있는 data를 요청하는 경우 속도가 더 줄어들 것이라고 설득하였다.

QA팀에서는 결국 graphql로 점진적으로 전환하는 동안 테스트가 필요할텐데 이게 그렇게까지 공수를 들일만한 것인지 질문을 하였다. 이 부분은 [대장님](https://blog.outsider.ne.kr/)이 직접 나서주셨는데, frontend와 mobile팀의 더 좋은 작업 효율을 위해서 진행하는 작업이니 감안해 달라고 하셨다.

"어쨌든 개발팀에서 진행하겠다면 OK"라는 대답을 들었지만, _지금도 잘 동작하는 걸 굳이 왜?_ 라는 의문에 생각보다 잘 대답 하지 못한 것 같다. 특히 개발자가 하는 일의 대부분은 회사의 이익과 일치되어야 한다고 생각하는데, 이 관점에서 생각했을때 확실히 graphql은 설득력이 부족했다고 생각한다. 엔지니어로 계속 일을 하려면 이 부분을 많이 수련해야할 것 같다.

### HDD하고 있는 것은 아닌가

설레발 주도 개발(Hype Driven Development)을 하는 것은 아닌지 PoC 내내 고민하였다. PoC를 한창 진행하다 보니 이 프로젝트가 정말 우리 회사에 도움이 될지, 그저 내가 하고 싶어서 하는 것이 아닌지 등 많은 생각이 들었다. 사실 이 고민은 현재진행형이다. 다만 위에 기술한 여러 장점이 눈에 보였고, 본격적으로 운영하기 전이니 아직 섣부른 판단은 하고 있지 않다. 6개월에서 1년 정도 운영해 보면 이 결정이 HDD였는지 아닌지 알 수 있지 않을까 한다 ~~과연 6개월 뒤 포스팅할 글의 제목이 무엇일까~~.

참고로 팀 동료인 제프리가 공유해준 글([Reconciling GraphQL and Thrift at Airbnb](https://medium.com/airbnb-engineering/reconciling-graphql-and-thrift-at-airbnb-a97e8d290712))이 정말 좋았다.

### Backend팀과의 관계

예전에 backend 팀과 API에 대해서 의견충돌이 있었던 적이 있었다. 그렇기 때문에 우리 팀의 결정과 graphql의 도입이 정치적인 제스쳐로 보이지 않게끔 많은 노력을 했다. 자칫 잘못하다가는 backend팀과는 전혀 상관없이 일하고 싶다는 뜻으로 비칠 수 있기 때문이다. 다행히 아직 큰 문제는 없었고, 오히려 graphql이 API에 대한 의견들의 완충지대 역할을 했으면 하는 개인적인 바람이 있다.

## 6. Conclusion

### 개인적인 경험

개인적으로는 처음으로 production용 server를 배포해 본 것이 가장 큰 소득이라고 생각한다. 이를 통해 조금이나마 backend팀의 일반적인 업무 프로세스를 알게 되었고, *server를 만든다는 것*이 무엇인지 생각해볼 수 있었다.

Graphql 인프라 구성을 위해 **대장님**은 주로 helm chart와 관련한 코드들을 review 요청을 하셨는데, 이 코드를 리뷰하기 위해 k8s 문서를 읽게 되었다. 언젠가는 한번 공부하리라 마음먹었었는데, 이참에 시작해볼까 생각 중이다. **대장님**은 한 사람인데, 담당하는 일이 너무 많으셔서 인프라와 관련한 간단한 수정을 부탁드리는 것도 죄송했다. 그래서 직접 인프라 코드를 수정을 할 수 있을 정도까지 k8s를 공부해볼 생각이다.

Professor K님과의 pair programming을 통해 업무수행 방식을 알 수 있었던 것도 큰 소득이었다. 분명히 내가 보았을 때 정말 배울만한 점이 있었고, 그 부분을 지금 내 업무 스타일에 녹여내기 위해 노력하고 있다.

### 새로운 시스템을 도입한다는 것은

무엇보다 새로운 시스템을 도입하는 절차를 경험한 것이 굉장히 좋았다. 처음에는 혼자서 가벼운 마음으로 진행했는데, 배포가 가시화될수록 챙겨야 할 부분이 많다는 것을 알게 되었다 ~~그리고 후회도 조금 했다~~ ~~아 괜히 시작했네~~.

먼저 문제점을 찾고 이 문제점에 다들 동의하는지, 가장 비용이 적게 드는 해결책이 무엇인지 생각해보고 시작한 것이 (당연하지만) 좋은 결정이었다. 처음에는 frontend project자체에 data를 처리하는 layer를 넣자는 의견이 있었는데, mobile팀에서도 쓸 수 있게 하자는 의견이 나와 graphql 도입을 PoC하게 된 것이다.

그런 다음, 찾아낸 해결책을 무조건 도입을 하는 것이 아니라 PoC를 통해 말 그대로 검증해보는 절차가 도움이 많이 되었다. 맨날 집에서 토이 프로젝트로만 server를 배포했었는데 실제로 운영이 가능한지, 예상되는 문제점과 해결책은 무엇인지 PoC를 하며 일정 부분 예측할 수 있었다.

도입하는 과정에서 성능을 테스트하고, 모니터링 방안을 찾고 장애 대응 계획을 세우는 과정에서 많은 것들을 배웠다. 특히 스크럼 마스터로 프로젝트에 참여해주신 [손병대](https://www.facebook.com/byungdae.sohn)님이 풍부한 경험을 바탕으로 많은 조언을 해주셨다. '아 이런 것까지 생각해야 하는구나'라는 부분이 매우 많았다.

개발하는 과정에서 복잡한 프로세스(data cache flow, 배포 프로세스 등)나 migration guide를 작성한 것도 문서화에 대한 고정관념을 없애주었다. 사실 그전에는 문서화에 그렇게 크게 가치를 두고 있지 않았다. 그저 귀찮고, 유지 보수하지 않으면 필요 없어지는 소모적인 일이라고만 생각했다. 하지만 이번에 팀원들이 기존에 경험했던 것과 완전히 다른 분야의 일을 진행하면서 그 생각이 바뀌었다. 지식을 나누는 것에 대한 가치와 나만 알고 있으면 끝나버리는 것이 아닌, '우리는 팀으로 일하고 있다'라는 사실을 다시 깨닫게 되었다.

여담이지만 처음 경험해본 스크럼 프로세스가 생각보다 괜찮았다. 이에 대해서는 같이 고생해준 Professor K님이 [본인의 블로그에](https://future-seller.dev/) 조만간 글을 쓰실 생각이라고 하니 기대해도 좋을 것 같다.

### Graphql, 무조건 도입해야하나?

'무조건'이라는 말이 들어간다면, 일단 이 시점에서의 내 생각은 단호하게 **NO**이다. 분명히 도입함으로써 얻게 되는 이점이 있겠지만, 현재 팀의 문제를 먼저 면밀히 체크해 보고 충분한 시간을 갖고 득실을 예상을 해야 한다. 그럼에도 불구하고 graphql 도입이 불가피하다면, 그때 시작해도 늦지 않다.

Graphql은 절대 모든 문제를 해결해주는 deus ex machina가 아님을 꼭 기억해야한다. 그러므로 현재 상황에서 graphql을 통해 **잃는 것 보다 얻는 것이 클 때 도입**하는 것이 좋을 것 같다.

---

**\[뜬금 채용 공고\]**

ODKMedia에서 [python 개발자](https://boards.greenhouse.io/odkmediainc/jobs/4114581003)분과 [SRE 개발자](https://boards.greenhouse.io/odkmediainc/jobs/4114581003)분을 애타게 찾고있습니다. 관심있으시다면 꼭 지원해주세요!
