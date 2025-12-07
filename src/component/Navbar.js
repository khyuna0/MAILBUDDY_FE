import { Link, useNavigate } from "react-router-dom";
import "../css/Navbar.css";
import { useContext } from "react";
import { UserContext } from "../context/UserContext";
import api from "../api/axiosConfig";

function Navbar({ onLogout, checkGoogleUser }) {
  const { user, userRole, token, googleLinked } = useContext(UserContext);
  const navigate = useNavigate();

  // 구글 로그인(연동) 버튼 클릭
  const handleGoogleLogin = () => {
    if (!user) {
      alert("먼저 로그인 해 주세요.");
      navigate("/login");
      return;
    }

    if (!token) {
      alert("로그인 정보가 없어 다시 로그인 해 주세요.");
      navigate("/login");
      return;
    }

    // 브라우저 세션에 구글 연동 했다는 플래그 저장
    localStorage.setItem("googleLinked", "true");

    // jwt_token을 쿼리스트링으로 붙여서 바로 OAuth2 엔드포인트로 이동
    const redirectUrl = `http://ec2-52-79-115-253.ap-northeast-2.compute.amazonaws.com:8888/oauth2/authorization/google?jwt_token=${encodeURIComponent(
      token
    )}`;

    window.location.href = redirectUrl;
  };

  return (
    <header className="navbar">
      <div className="nav-left">
        <Link to="/" className="brand">
          MailBuddy<span className="brand-emoji">📅</span>
        </Link>
      </div>

      <nav className="nav-center">
        <Link to="/">홈</Link>
        <Link to="/schedule">일정 관리</Link>
        {user && googleLinked && <Link to="/address">주소록</Link>}
        {!user && <Link to="/faq">FAQ</Link>}
        <Link to="/guide">이용 가이드</Link>
        {user && userRole === "USER" && (
          <Link to="/contact/:roomId">문의하기</Link>
        )}
        {userRole === "ADMIN" && (
          <Link to="/contact_admin">관리자 문의 관리</Link>
        )}
        {user && <Link to="/mypage">마이페이지</Link>}
      </nav>

      <div className="nav-right">
        {!user ? (
          <>
            <Link to="/login" className="btn ghost">
              로그인
            </Link>
            <Link to="/signup" className="btn solid">
              회원가입
            </Link>
          </>
        ) : (
          <>
            {!googleLinked && (
              <button onClick={handleGoogleLogin} className="btn google">
                🚀 Google 로그인
              </button>
            )}
            <button className="btn solid" onClick={onLogout}>
              로그아웃
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;
