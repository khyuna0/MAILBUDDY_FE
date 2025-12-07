import "../css/Faq.css";

const FAQ_LIST = [
  {
    q: "MailBuddy는 어떤 서비스인가요?",
    a: "메일 내용을 분석해서 제목·날짜·시간·장소를 추출하고, 클릭 한 번으로 캘린더 일정으로 저장할 수 있는 일정 관리 도우미예요.",
  },
  {
    q: "구글(Gmail) 연동을 하지 않아도 쓸 수 있나요?",
    a: "네, 가능합니다. 일반 일정 추가/수정 기능은 구글 연동 없이도 사용할 수 있고, 메일 → 일정 변환 기능만 사용이 제한돼요.",
  },
  {
    q: "내 데이터(메일/일정)는 안전하게 보관되나요?",
    a: "사용자의 메일 원문은 구글 서버에 있고, MailBuddy에는 요약된 일정 정보만 저장돼요. 저장된 정보는 서비스 제공 외 다른 용도로 사용하지 않습니다.",
  },
  {
    q: "AI 요약이 이상할 때는 어떻게 하나요?",
    a: "캘린더에서 해당 일정의 상세보기/수정 화면을 열어 직접 제목·날짜·시간·장소를 수정하시면 돼요.",
  },
];

function Faq() {
  return (
    <div className="mb-faq-page">
      <div className="mb-faq-inner">
        <header className="mb-faq-header">
          <h1>자주 묻는 질문</h1>
          <p>
            MailBuddy를 사용하시면서 자주 궁금해하시는 내용들을 정리했어요.
            <br />
            이외의 문의는 상단의 문의하기로 편하게 남겨주세요.
          </p>
        </header>

        <div className="mb-faq-list">
          {FAQ_LIST.map((item, idx) => (
            <details key={idx} className="mb-faq-item">
              <summary className="mb-faq-question">
                <span className="mb-faq-q">Q.</span>
                <span>{item.q}</span>
              </summary>
              <div className="mb-faq-answer">
                <span className="mb-faq-a">A.</span>
                <p>{item.a}</p>
              </div>
            </details>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Faq;
