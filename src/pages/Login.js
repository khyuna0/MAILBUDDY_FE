import { useContext, useState } from "react";
import "../css/Login.css";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import { UserContext } from "../context/UserContext";

function Login({ checkUser }) {
  const { setToken } = useContext(UserContext);
  const { error, request, setError } = useApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // 로그인 버튼 눌렀을 때 함수
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await request(() =>
        api.post("/api/auth/login", { username, password })
      );
      const token = res.token || res.data?.token || res.data?.accessToken; // jwt 토큰 저장
      if (!token) {
        setError("토큰을 받아오지 못했어요.");
        return;
      }
      localStorage.setItem("token", token); // localStorage에 토큰 저장
      setToken(token); // context에도 저장
      await checkUser(); // 유저 정보 다시 불러오기
      alert("로그인 성공! 환영합니다!");
      navigate("/mypage", { replace: true });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setError("아이디 또는 비밀번호가 틀렸습니다.");
      } else {
        console.error(err);
        setError("로그인에 문제가 있습니다.");
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>회원 로그인</h2>
        <p className="helper">
          MailBuddy에 로그인하고 일정 자동화를 시작하세요.
        </p>

        {error && (
          <p className="error-message" role="alert" aria-live="assertive">
            {error}
          </p>
        )}

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="아이디"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            required
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
          <button type="submit">로그인</button>
        </form>

        <div className="sub-actions">
          <p>
            계정이 없나요?{" "}
            <span onClick={() => navigate("/signup")}>지금 가입하기</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
