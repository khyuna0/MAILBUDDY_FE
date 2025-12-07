import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../context/UserContext";
import api from "../api/axiosConfig";
import "../css/MyPage.css";
import { useNavigate } from "react-router-dom";
import useApi from "../hooks/useApi";
import ErrorPage from "../component/ErrorPage";

function MyPage({ setBirth }) {
  const { user, googleUser, authLoading, token, setToken } =
    useContext(UserContext);
  const { error, loading, request, setError } = useApi();
  const navigate = useNavigate();

  const [originalUser, setOriginalUser] = useState(null);
  const [updatedUser, setUpdatedUser] = useState({
    name: "",
    newPassword: "",
    birth: "",
  });

  // 1. 사용자 정보 불러오기
  const loadUser = async () => {
    setError(null);
    try {
      if (!token) {
        setError("토큰 없음");
      }
      const res = await request(() =>
        api.get("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        })
      );

      setUpdatedUser({
        name: res.name ?? "",
        birth: res.birth ?? "",
        newPassword: "",
      });
      setOriginalUser(updatedUser); // 원본 저장
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) {
        alert("로그인이 필요합니다.");
        navigate("/login");
      } else if (err.response?.status === 404) {
        setError("프로필을 찾을 수 없습니다.  로그인 해주세요");
      } else setError("정보를 불러올 수 없음");
    }
  };

  useEffect(() => {
    if (authLoading) return;

    // 토큰 자체가 없으면 로그인 페이지로
    if (!token) {
      navigate("/err401", { replace: true });
      return;
    }
    // 토큰이 있으면 그냥 /api/auth/me 호출해서 서버 판단에 맡김
    loadUser();
  }, [user, authLoading, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUpdatedUser((prev) => ({ ...prev, [name]: value }));
  };

  // 2. 정보 수정 버튼 클릭 시. payload은 변경된 value 값(updatedUser)을 넣는 배열
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (
      originalUser &&
      originalUser.name === updatedUser.name &&
      originalUser.birth === updatedUser.birth &&
      !updatedUser.newPassword
    ) {
      alert("변경된 내용이 없습니다.");
      return;
    }

    const payload = {
      ...(updatedUser.name && { name: updatedUser.name }),
      ...(updatedUser.birth && { birth: updatedUser.birth }),
      ...(updatedUser.newPassword && { password: updatedUser.newPassword }),
    };

    try {
      await request(() =>
        api.patch("/api/auth/profile", payload, {
          headers: { Authorization: `Bearer ${token}` },
        })
      );
      alert("회원정보가 수정되었습니다.");
      // 화면에 변경사항 보여주기, 비밀번호 비우기
      setUpdatedUser((prev) => ({
        ...prev,
        name: payload.name ?? prev.name,
        birth: payload.birth ?? prev.birth,
        newPassword: "",
      }));
      setBirth(payload.birth);
    } catch (err) {
      if (err.response?.status === 400) {
        // 유효성 검증 실패할 때
        setError(err.response.data);
      } else {
        setError("수정 실패");
        console.error(err);
      }
    }
  };

  if (loading) return <div>불러오는 중...</div>;
  if (error && typeof error === "string" && error.includes("서버")) {
    // 문자열 에러 메시지 내 "서버" 키워드 체크 (이걸 잘 모르겠음 ..)
    return <ErrorPage statusCode={500} message={error} />;
  }

  return (
    <div className="mypage-container">
      <div className="mypage-header">
        <h2>My Page</h2>
      </div>

      {/* error 변수가 객체인지 확인 */}
      {error && typeof error === "object" ? (
        <>
          {error.name && <p className="error-message">{error.name}</p>}
          {error.birth && <p className="error-message">{error.birth}</p>}
          {error.password && <p className="error-message">{error.password}</p>}
        </>
      ) : (
        error && <p className="error-message">{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mypage-card">
          <div className="mypage-grid">
            <div className="label">연동된 구글 이메일</div>
            {googleUser ? (
              <input
                type="text"
                name="text"
                value={googleUser}
                className="ro-input"
                readOnly
              />
            ) : (
              <input
                type="text"
                name="text"
                value="구글 연동을 원하시면 우측 상단 구글 로그인 버튼을 눌러주세요."
                className="ro-input"
                readOnly
              />
            )}

            <div className="label">아이디</div>
            <input
              type="text"
              name="username"
              value={user}
              className="ro-input"
              readOnly
            />

            <div className="label">변경할 비밀번호</div>
            <input
              type="password"
              name="newPassword"
              value={updatedUser.newPassword ?? ""}
              onChange={handleChange}
              autoComplete="new-password"
            />

            <div className="label">이름</div>
            <input
              type="text"
              name="name"
              value={updatedUser.name}
              onChange={handleChange}
              required
            />

            <div className="label">생일</div>
            <input
              type="text"
              name="birth"
              value={updatedUser.birth}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <button className="submit-btn" type="submit">
          정보 수정
        </button>
      </form>
    </div>
  );
}

export default MyPage;
