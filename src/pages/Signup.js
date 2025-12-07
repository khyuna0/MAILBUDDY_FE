import { useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../css/Signup.css";
import useApi from "../hooks/useApi";
import ErrorPage from "../component/ErrorPage";

function Signup() {
  const { error, request, setError } = useApi();
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [birth, setBirth] = useState("");

  // 회원가입 제출 함수
  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await request(() => api.post("/api/auth/signup", { username, password, name, birth }));
      alert("회원가입 성공!");
      navigate("/login", { replace: true });
    } catch (err) {
      if (err.response?.status === 400) {
        // 백엔드의 필드 오류 그대로 노출 (idError, username, name, birth, password)
        setError(err.response.data);
      } else {
        console.error(err);
        setError("회원가입에 문제가 있습니다.");
      }
    }
  };

  if (error && typeof error === "string" && error.includes("서버")) {
    // 문자열 에러 메시지 내 "서버" 키워드 체크 (이걸 잘 모르겠음 ..)
    return <ErrorPage statusCode={500} message={error} />;
  }

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>회원 가입</h2>
        <p className="helper">간단한 정보만 입력하면 MailBuddy를 바로 시작할 수 있어요.</p>

        {error && typeof error === "object" ? (
          <>
            {error.idError && <p className="field-error">{error.idError}</p>}
            {error.username && <p className="field-error">{error.username}</p>}
            {error.password && <p className="field-error">{error.password}</p>}
            {error.name && <p className="field-error">{error.name}</p>}
            {error.birth && <p className="field-error">{error.birth}</p>}
          </>
        ) : (
          error && <p className="error-message">{error}</p>
        )}

        <form onSubmit={handleSignup} className="signup-form">
          <div className="form-row">
            <input
              type="text"
              placeholder="아이디"
              value={username}
              onChange={(e) => setUsername(e.target.value.trim())}
              autoComplete="username"
              required
            />
          </div>

          <div className="form-row">
            <input
              type="password"
              placeholder="비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value.trim())}
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="이름"
              value={name}
              onChange={(e) => setName(e.target.value.trim())}
              autoComplete="name"
              required
            />
          </div>

          <div className="form-row">
            <input
              type="text"
              placeholder="생일 (YYYY-MM-DD)"
              value={birth}
              onChange={(e) => setBirth(e.target.value.trim())}
              inputMode="numeric"
              autoComplete="bday"
            />
          </div>

          <div className="actions">
            <button type="submit" className="btn solid">
              회원가입
            </button>
            <button type="button" className="btn ghost" onClick={() => navigate("/")}>
              취소
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup;
