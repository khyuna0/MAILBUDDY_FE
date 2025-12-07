import "../css/Guide.css";

//가이드 상단 빠른 이동 메뉴에 쓸 데이터 목록
const GUIDE_NAV = [
  { id: "start", label: "시작하기" },
  { id: "mail-to-schedule", label: "메일 → 일정 변환" },
  { id: "calendar", label: "캘린더 사용법" },
  { id: "todo", label: "할 일(Todo)" },
  { id: "addressbook", label: "주소록" },
];

function Guide() {
  return (
    <div className="mb-guide-page">
      <div className="mb-guide-inner">
        {/* 상단 헤더 */}
        <header className="mb-guide-header" id="guide-top">
          <h1>이용 가이드</h1>
          <p>
            MailBuddy를 처음 쓰는 분들을 위한 간단한 안내입니다.
            <br />
            아래 순서를 천천히 따라오면, 메일을 일정으로 옮기고 관리하는 흐름을
            한 번에 익힐 수 있어요.
          </p>
        </header>

        {/* 상단 빠른 이동 메뉴 */}
        <nav className="mb-guide-nav">
          {GUIDE_NAV.map((item) => (
            <a
              key={item.id} // 각 항목 구분할 때 사용
              href={`#${item.id}`} // 예: #start, #calendar
              className="mb-guide-nav-link"
            >
              {item.label} {/* 화면에 보여줄 텍스트 */}
            </a>
          ))}
        </nav>

        {/* 섹션 1 - 시작하기 */}
        <section id="start" className="mb-guide-section">
          <h2>1. 시작하기</h2>
          <a href="#guide-top" className="mb-guide-top-btn">
            ↑ 위로가기
          </a>
          <p className="mb-guide-desc">
            MailBuddy를 사용하려면 먼저 회원가입/로그인 후, 필요하다면 구글
            계정을 연동해 주세요.
          </p>
          <ol className="mb-guide-steps">
            <li>
              <strong>회원가입 또는 로그인</strong>
              <p>
                상단 메뉴에서 <b>회원가입</b> 버튼을 눌러 계정을 만듭니다.
              </p>
            </li>
            <li>
              <strong>홈 화면 살펴보기</strong>
              <p>
                로그인 후 나타나는 홈 화면에서,
                <b>캘린더 / 할일(Todo)</b> 등 주요 기능을 확인할 수 있어요.
              </p>
            </li>
            <li>
              <strong>구글 계정 연동 (선택)</strong>
              <p>
                메일을 자동으로 불러오고 싶다면, 상단 또는 설정 화면에서{" "}
                <b>Gmail 연동하기</b> 버튼을 눌러 구글 계정을 연결합니다.
              </p>
            </li>
          </ol>
        </section>

        {/* 섹션 2 - 메일 → 일정 변환 */}
        <section id="mail-to-schedule" className="mb-guide-section">
          <h2>2. 메일을 일정으로 변환하기</h2>
          <a href="#guide-top" className="mb-guide-top-btn">
            ↑ 위로가기
          </a>
          <p className="mb-guide-desc">
            중요한 일정이 적힌 메일을, 클릭 몇 번으로 캘린더로 옮겨보세요.
          </p>
          <ol className="mb-guide-steps">
            <li>
              <strong>Gmail 가져오기</strong>
              <p>
                캘린더 상단의 <b>&quot;Gmail 가져오기&quot;</b> 버튼을 누르면,
                연동된 구글 메일 중 최근 메일들을 불러옵니다.
              </p>
            </li>
            <li>
              <strong>AI 요약 실행</strong>
              <p>
                <b>&quot;AI로 요약하기&quot;</b> 버튼을 누르면, 메일 내용에서{" "}
                <b>제목 · 날짜 · 시간 · 장소</b> 등을 자동으로 추출해 요약
                목록에 보여줍니다.
              </p>
            </li>
            <li>
              <strong>요약을 일정으로 등록</strong>
              <p>
                요약 카드에서 <b>일정으로 등록</b> 또는 <b>수정 후 등록</b>{" "}
                버튼을 눌러, 캘린더의 일정으로 저장할 수 있습니다.
              </p>
            </li>
          </ol>
        </section>

        {/* 섹션 3 - 캘린더 사용법 */}
        <section id="calendar" className="mb-guide-section">
          <h2>3. 캘린더 사용법</h2>
          <a href="#guide-top" className="mb-guide-top-btn">
            ↑ 위로가기
          </a>
          <p className="mb-guide-desc">
            AI로 만든 일정과 직접 추가한 일정을 한 화면에서 관리할 수 있어요.
          </p>
          <ol className="mb-guide-steps">
            <li>
              <strong>달 이동하기</strong>
              <p>
                캘린더 상단의 <b>이전/다음</b> 화살표 버튼으로 보고 싶은 달로
                이동합니다.
              </p>
            </li>
            <li>
              <strong>일정 추가하기</strong>
              <p>
                원하는 날짜를 클릭하거나, <b>&quot;일반 일정 추가&quot;</b>{" "}
                버튼을 눌러 제목·날짜·시간·장소를 입력하고 일정을 저장합니다.
              </p>
            </li>
            <li>
              <strong>일정 상세보기 / 수정</strong>
              <p>
                일정이 있는 날짜를 클릭하거나, 일정 배지를 선택하면
                <b>상세보기</b> 화면이 열립니다. 여기서 내용을 수정하거나 삭제할
                수 있어요.
              </p>
            </li>
          </ol>
        </section>

        {/* 섹션 4 - Todo 사용법 */}
        <section id="todo" className="mb-guide-section">
          <h2>4. 할 일(Todo) 관리</h2>
          <a href="#guide-top" className="mb-guide-top-btn">
            ↑ 위로가기
          </a>
          <p className="mb-guide-desc">
            날짜와 상관없는 개인 할 일은 Todo에 따로 정리해두면 편리합니다.
          </p>
          <ol className="mb-guide-steps">
            <li>
              <strong>할 일 추가</strong>
              <p>
                Todo 영역의 입력창에 해야 할 일을 적고 <b>추가</b> 버튼을
                누르거나 엔터를 입력합니다.
              </p>
            </li>
            <li>
              <strong>완료 체크</strong>
              <p>항목 왼쪽의 체크박스를 클릭하면 완료 상태로 변경 됩니다.</p>
            </li>
            <li>
              <strong>수정 / 삭제</strong>
              <p>
                항목 오른쪽의 <b>수정/삭제</b> 아이콘을 통해 내용을 변경하거나
                리스트에서 제거할 수 있습니다.
              </p>
            </li>
          </ol>
        </section>

        {/* 섹션 5 - 주소록 사용법 */}
        <section id="addressbook" className="mb-guide-section">
          <h2>5. 주소록 관리</h2>
          <a href="#guide-top" className="mb-guide-top-btn">
            ↑ 위로가기
          </a>
          <p className="mb-guide-desc">
            자주 메일을 주고받는 사람들을 모아 한 번에 볼 수 있어요.
          </p>
          <ol className="mb-guide-steps">
            <li>
              <strong>연락처 자동 수집</strong>
              <p>
                Gmail을 불러오면, 메일의 발신자/수신자 정보를 기반으로{" "}
                <b>주소록</b>에 연락처가 자동으로 쌓입니다.
              </p>
            </li>
            <li>
              <strong>정렬 및 검색</strong>
              <p>
                자주 연락한 순으로 정렬된 리스트에서 이름/이메일을 확인하고,
                필요한 경우 검색 기능으로 빠르게 찾을 수 있습니다.
              </p>
            </li>
            <li>
              <strong>메일 보내기</strong>
              <p>
                각 연락처의 <b>&quot;메일 쓰기&quot;</b> 버튼을 누르면, Gmail
                작성 창이 열려 바로 메일을 보낼 수 있어요.
              </p>
            </li>
          </ol>
        </section>

        {/* 마지막 안내 */}
        <section className="mb-guide-section mb-guide-section-last">
          <h2>추가 문의</h2>
          <p className="mb-guide-desc">
            위 가이드를 따라도 사용이 어려우시다면,
            <br />팀 메일로 편하게 문의를 남겨주세요.
          </p>
          <div className="mb-guide-contact">
            <p>
              📧 <span>mailbuddy.team@example.com</span>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Guide;
