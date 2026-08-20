# Mail Buddy (Front-end)

Gmail 등 메일함에 쌓인 약속·일정 정보를 AI가 자동으로 추출해 캘린더에 등록해주는
개인 비서형 웹 서비스의 프론트엔드 저장소입니다.
"메일은 하나, 일정 입력은 자동으로"라는 컨셉으로, 메일을 일일이 읽고 캘린더에
옮겨 적는 번거로움을 줄이는 것을 목표로 합니다.

- 백엔드 저장소: [MAILBUDDY-BE](https://github.com/khyuna0/MAILBUDDY-BE) (Spring Boot, MySQL)
- 프론트 저장소(본 문서): Create React App 기반 SPA
- 이 문서는 백엔드 EC2 서버가 아닌, **프론트+백엔드를 전부 로컬에서 띄우는 방법**을 기준으로 작성되었습니다.

## 프로젝트 개요

| 항목 | 내용 |
| --- | --- |
| 이름 | Mail Buddy |
| 설명 | 메일 → 일정 자동 추출, 캘린더·주소록·투두·1:1 문의 채팅을 제공하는 개인 일정 관리 서비스 |
| 대상 | Google 계정으로 메일을 받는 개인 사용자 |
| 핵심 가치 | 반복적인 "메일 읽고 → 일정 수동 등록" 과정을 자동화 |

### 주요 기능

- **메일 → 일정 자동 등록**: Google OAuth2 연동 메일에서 제목·시간·장소를 AI가 추출해 캘린더에 저장
- **캘린더/일정 관리**: 일반 일정 직접 추가·수정, 날짜별 날씨 아이콘 표시(DailyBriefBar)
- **주소록**: 연락처 관리 및 연락 빈도 확인
- **투두(Todo) / 메모(Memo)**: 개인 작업 관리
- **위치 지도**: 일정 장소를 카카오맵으로 시각화, 주소 → 좌표 변환
- **1:1 문의(Contact)**: STOMP(WebSocket) 기반 실시간 채팅 문의, 관리자 페이지(ContactAdmin) 제공
- **회원 관리**: 회원가입/로그인(JWT), 마이페이지, Google 계정 연동
- **정적 안내 페이지**: FAQ, 이용 가이드, 이용약관

## 사용 기술 및 채택 이유

| 기술 | 용도 | 채택 이유 |
| --- | --- | --- |
| **React 19** | UI 라이브러리 | 컴포넌트 기반 구조로 페이지(주소록/일정/투두 등) 단위 재사용과 상태 관리가 용이 |
| **Create React App (react-scripts)** | 빌드/개발 환경 | 별도 번들러 설정 없이 빠르게 SPA를 세팅하고, 팀 합류 시 진입장벽을 낮추기 위함 |
| **React Router DOM 7** | 라우팅 | `/login`, `/schedule`, `/contact/:roomId` 등 다수 페이지를 SPA 방식으로 전환, 쿼리스트링(`?formOpen=true`)으로 페이지 진입 상태까지 제어 |
| **Axios** | HTTP 통신 | 인터셉터(`axiosConfig.js`)로 JWT 토큰을 자동으로 요청 헤더에 주입하고, 인증이 필요 없는 엔드포인트(`/api/auth/me` 등)는 예외 처리하여 인증 로직을 한 곳에서 관리 |
| **@stomp/stompjs + sockjs-client** | 실시간 채팅(WebSocket) | 문의(Contact) 기능에서 STOMP 프로토콜 기반 발행/구독 메시징으로 관리자-사용자 간 실시간 채팅 구현, SockJS로 WebSocket 미지원 환경에서도 폴백 지원 |
| **react-calendar** | 캘린더 UI | 커스텀 일정 관리 화면(CalendarContainer/Tile 등)의 기반 컴포넌트로 사용, 직접 만들기 번거로운 날짜 그리드/월 이동 로직을 재사용 |
| **react-confetti / confetti** | 사용자 경험(UX) | 일정 완료, 회원가입 등 긍정적 액션에 대한 시각적 피드백 제공 |
| **Kakao Maps SDK** (동적 스크립트 로드) | 지도/좌표 변환 | 일정 장소의 주소를 좌표로 변환(Geocoder)하고 지도에 마커로 표시하기 위해 사용 (`MapUtil.js`, `KaKaoMap.js`) |
| **Context API** (UserContext, BirthContext, ScheduleContext, RefreshContext) | 전역 상태 관리 | 로그인 사용자 정보·토큰·생일 등 여러 페이지에서 공통으로 필요한 값을 Redux 등 외부 라이브러리 없이 가볍게 공유하기 위해 채택 |
| **Testing Library (jest-dom, react, user-event)** | 테스트 | CRA 기본 제공 테스트 도구를 그대로 활용해 별도 설정 비용 없이 컴포넌트 테스트 작성 가능 |

> 백엔드는 JWT 기반 인증 + Google OAuth2 세션을 병행하고 있어, 프론트에서는
> `localStorage`에 JWT를 저장해 API 요청에 사용하고, `/api/auth/me`처럼
> 세션 기반으로만 동작해야 하는 엔드포인트는 Axios 인터셉터에서 예외 처리합니다.

## 폴더 구조

```
src/
├── api/            # axios 인스턴스, 토큰 유틸, 일정 API
├── component/       # 공통 컴포넌트 (Navbar, Footer, 지도, 캘린더 위젯 등)
├── context/         # 전역 상태 (User, Birth, Schedule, Refresh, Chat)
├── css/             # 페이지/컴포넌트별 스타일
├── hooks/           # 커스텀 훅 (useApi)
├── pages/           # 라우트 단위 페이지 (Home, Login, Schedule, AddressBook 등)
└── utils/           # 날짜, 지도, 날씨, 폼 값 등 유틸 함수
```

## 로컬 실행 방법 (프론트 + 백엔드 전체)

프론트엔드는 `src/api/axiosConfig.js`의 `baseURL`이 `http://localhost:8888`로
설정되어 있어, 아래처럼 백엔드를 로컬에 함께 띄워야 로그인/일정/주소록 등
API 연동 기능이 정상 동작합니다. (백엔드 없이 프론트만 띄우면 화면은 뜨지만
API 요청은 모두 실패합니다.)

### 요구 사항

- Node.js 18 이상, npm
- JDK 17
- 로컬에 설치된 MySQL 8.x (서비스로 실행 중이어야 함)

### 1. 백엔드 (MAILBUDDY-BE) 로컬 구동

```bash
git clone https://github.com/khyuna0/MAILBUDDY-BE.git
cd MAILBUDDY-BE
```

로컬 MySQL에 데이터베이스를 하나 생성합니다.

```sql
CREATE DATABASE IF NOT EXISTS mailbuddy CHARACTER SET utf8mb4;
```

`src/main/resources/application.yml`은 저장소에 `server.port`만 커밋되어 있고,
DB 접속 정보/OAuth2 키/AI API 키 등 민감 정보는 포함되어 있지 않습니다.
로컬 실행을 위해 아래 항목을 채운 `application.yml`을 직접 작성해야 합니다.

```yaml
server:
  port: 8888

spring:
  datasource:
    url: jdbc:mysql://127.0.0.1:3306/mailbuddy?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8
    username: root
    password: "<로컬 MySQL 비밀번호>"
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: true
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: <Google Cloud Console에서 발급한 client-id>
            client-secret: <Google Cloud Console에서 발급한 client-secret>
            scope: [email, profile, https://www.googleapis.com/auth/gmail.readonly]
        provider:
          google:
            authorization-uri: https://accounts.google.com/o/oauth2/v2/auth
            token-uri: https://oauth2.googleapis.com/token
  mail:
    host: smtp.gmail.com
    port: 587
    username: <발신용 Gmail 계정>
    password: <Gmail 앱 비밀번호>

jasypt:
  encryptor:
    password: <아무 문자열이나 가능, 로컬 개발용 임의 값>

mistral:
  api:
    key: <Mistral AI 콘솔에서 발급한 API 키>
    url: https://api.mistral.ai/v1/chat/completions
    model: mistral-small-latest
```

> Google OAuth2 / Mistral AI / 메일 발송 관련 키가 없다면, 위 값들을
> 아무 문자열(더미 값)로 채워도 서버는 정상 기동됩니다. 다만 그 경우
> **구글 로그인·메일→일정 자동 추출·메일 발송 기능은 동작하지 않고**,
> 그 외 회원가입/로그인(JWT)/일정 직접 등록/주소록/투두 등은 정상 동작합니다.
> 실제 기능까지 쓰려면 각 서비스 콘솔에서 키를 발급받아 채워 넣으세요.
> - Google OAuth2 클라이언트: https://console.cloud.google.com/apis/credentials
> - Mistral AI API 키: https://console.mistral.ai/

```bash
# Windows
./gradlew.bat bootRun

# macOS/Linux
./gradlew bootRun
```

정상 기동되면 `http://localhost:8888`에서 백엔드가 응답합니다.

### 2. 프론트엔드 (본 저장소) 로컬 구동

```bash
git clone https://github.com/khyuna0/MAILBUDDY_FE.git
cd MAILBUDDY_FE
npm install
npm start
```

실행 후 브라우저에서 [http://localhost:3000](http://localhost:3000) 으로
접속하면 앱이 로드되고, `localhost:8888` 백엔드와 통신합니다.

### 3. 카카오맵 연동 (선택)

`KaKaoMap.js`, `MapUtil.js`에 삽입된 Kakao Maps SDK 스크립트의 `appkey`
파라미터가 비어 있습니다. 지도/좌표 변환 기능을 사용하려면
[Kakao Developers](https://developers.kakao.com/)에서 발급받은 JavaScript
키를 해당 스크립트 URL의 `appkey=` 뒤에 채워 넣어야 합니다.

### 4. 기타 스크립트

```bash
npm test        # 테스트 러너(watch 모드) 실행
npm run build   # 프로덕션 빌드 (build 폴더 생성)
```
