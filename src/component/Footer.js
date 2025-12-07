// src/component/Footer.jsx
import { useContext } from "react";
import "../css/Footer.css";
import { UserContext } from "../context/UserContext";

function Footer() {
  const year = new Date().getFullYear();
  const { user, userRole, googleUser, googleLinked } = useContext(UserContext);

  return (
    <footer className="mb-footer">
      <div className="mb-footer-inner">
        {/* 왼쪽 : 로고 + 한 줄 소개 + 연락 */}
        <div className="mb-footer-col mb-footer-brand">
          <div className="mb-footer-logo-row">
            <span className="mb-footer-logo">MailBuddy</span>
            <span className="mb-footer-badge">Beta</span>
          </div>
          <p className="mb-footer-desc">메일 속 약속들을 한 곳에서 관리하는 AI 일정 도우미.</p>
          <p className="mb-footer-small">Address. 서울 마포구 신촌로 176</p>
          <p className="mb-footer-small">Contact. team.mailbuddy@example.com</p>
        </div>

        {/* 가운데 : 링크/사용가이드/문의 ... */}
        <div className="mb-footer-col mb-footer-links">
          <div className="mb-footer-links-group">
            <h4>Product</h4>
            <a href="/">홈</a>
            <a href="/schedule">일정 관리</a>
            {googleLinked && user && <a href="/address-book">주소록</a>}
          </div>
          <div className="mb-footer-links-group">
            <h4>Support</h4>
            <a href="/guide">이용 가이드</a>
            <a href="/faq">FAQ</a>
            {userRole !== "ADMIN" && user && <a href="/contact/:roomId">문의하기</a>}
            {userRole === "ADMIN" && user && <a href="/contact_admin">관리자용 문의하기</a>}
            <a href="/terms">이용약관</a>
          </div>
        </div>

        {/* 오른쪽 : 팀 정보 + 저작권 */}
        <div className="mb-footer-col mb-footer-team">
          <h4>Team MailBuddy</h4>
          <ul>
            <li>최유림</li>
            <li>최경미</li>
            <li>고현아</li>
          </ul>

          <p className="mb-footer-copy">© {year} MailBuddy Team. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
