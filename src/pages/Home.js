import { useContext } from "react";
import "../css/Home.css";
import { Link } from "react-router-dom";
import { UserContext } from "../context/UserContext";

function Home() {
  const { user } = useContext(UserContext);

  // features 해당 페이지로 이동 <button>보다 <Link>가 더 적절
  const features = [
    {
      emoji: "✉️",
      title: "메일 → 일정",
      desc: "제목·시간·장소를 자동 추출해 캘린더에 저장합니다.",
      to: "/schedule?homeNav=true",
    },
    {
      emoji: "🗂️",
      title: "주소록",
      desc: "가장 많이 연락한 사람이 누구인지 확인해보세요.",
      to: "/address",
    },
    {
      emoji: "🗓️",
      title: "일반 일정 추가",
      desc: "보통의 일정관리처럼 직접 추가/수정도 간편합니다.",
      to: "/schedule?formOpen=true",
    },
  ];
  // 테스트
  return (
    <div className="home">
      <section className="hero">
        <div className="hero-icons" aria-hidden>
          <span>📚</span>
          <span>🔍</span>
          <span>🧠</span>
          <span>💡</span>
          <span>🗓️</span>
        </div>

        <h1 className="hero-title">
          메일은 하나, <br className="br-md" />
          일정 입력은 <span className="accent">자동</span>으로
        </h1>
        <br />
        <p className="hero-sub">
          메일에서 약속을 읽고, AI가 핵심만 추려 캘린더에 등록합니다.
          <br />
          일반 일정도 손쉽게 추가하세요. 메일 읽는 번거로움을 줄이고 본질에 집중해요.
        </p>
        <br />

        <div className="hero-cta">
          {!user && (
            <Link to="/login" className="cta primary">
              로그인하고 시작하기
            </Link>
          )}
          <Link to="/contact/:roomId" className="cta secondary">
            문의하기
          </Link>
        </div>

        <div className="hero-badges">
          <span>Google OAuth2 연동</span>
          <span>AI 요약 · 일정 생성</span>
          <span>개인 캘린더</span>
        </div>
      </section>

      <section className="features">
        {features.map((f) => (
          <Link className="feat-link" to={f.to} key={f.title}>
            <article className="feat">
              <div className="feat-emoji">{f.emoji}</div>
              <div className="feat-title">{f.title}</div>
              <div className="feat-desc">{f.desc}</div>
            </article>
          </Link>
        ))}
      </section>
    </div>
  );
}

export default Home;
