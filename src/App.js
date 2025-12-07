import { Route, Routes, useNavigate } from "react-router-dom";
import "./App.css";
import Navbar from "./component/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import api from "./api/axiosConfig";
import { useEffect, useState } from "react";
import { UserContext } from "./context/UserContext";
import AddressBook from "./pages/AddressBook";
import Schedule from "./pages/Schedule";
import MyPage from "./pages/MyPage";
import { BirthContext } from "./context/BirthContext";
import ErrorPage from "./component/ErrorPage";
import Contact from "./pages/Contact";
import ContactAdmin from "./pages/ContactAdmin";
import { RefreshProvider } from "./context/RefreshContext";
import Footer from "./component/Footer";
import Faq from "./pages/Faq";
import Guide from "./pages/Guide";
import Terms from "./pages/Terms";

function App() {
  const [user, setUser] = useState(null); // 현재 로그인한 유저의 아이디(username)
  const [birth, setBirth] = useState(null);
  const [googleUser, setGoogleUser] = useState(null); // 현재 로그인한 유저의 아이디(username)
  //이 브라우저 세션(정확히는 localStorage 기준)에서만 쓰는 구글 연동 플래그
  const [googleLinked, setGoogleLinked] = useState(
    localStorage.getItem("googleLinked") === "true"
  );
  const [userRole, setUserRole] = useState(null); // 현재 로그인한 유저의 권한 (ROLE_USER, ROLE_ADMIN)
  const [token, setToken] = useState(localStorage.getItem("token") || null); // JWT 토큰 상태 관리
  const [authLoading, setAuthLoading] = useState(true);

  const navigate = useNavigate();

  const checkUser = async () => {
    try {
      if (!token) {
        setUser(null);
        setBirth(null);
        setUserRole(null);
        return;
      }
      const res = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (
        res.data &&
        res.data.username &&
        res.data.username !== "anonymousUser"
      ) {
        setUser(res.data.username);
        setBirth(res.data.birth);
        setUserRole(res.data.userRole);
      } else {
        setUser(null);
        setBirth(null);
      }
    } catch (err) {
      setUser(null);
      setBirth(null);
    }
  };

  // 구글 로그인 확인 및 구글 이메일 저장, 연동 정보 확인(1회성)
  const checkGoogleUser = async () => {
    try {
      if (!token) {
        setGoogleUser(null);
        return;
      }
      const res = await api.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 백엔드에서 내려주는 구글 이메일만 참고 (필요하면)
      if (res.data && res.data.googleEmail) {
        setGoogleUser(res.data.googleEmail);
      } else {
        setGoogleUser(null);
      }
    } catch (err) {
      setGoogleUser(null);
    }
  };

  useEffect(() => {
    Promise.all([checkUser(), checkGoogleUser()]).finally(() =>
      setAuthLoading(false)
    );
  }, [token]); // 토큰이 바뀌면 자동으로 유저 체크

  const handleLogout = async () => {
    try {
      if (!window.confirm("정말 로그아웃 하시겠습니까?")) {
        return;
      }
      // } else {
      //   // 백엔드 로그아웃 API 호출 (폼, OAuth2 세션 무효화)
      //   api.post("/api/auth/logout");

      // 프론트 상태 초기화
      setUser(null);
      setGoogleUser(null);
      setGoogleLinked(false);

      // 로컬 저장된 토큰/구글연동 플래그 삭제
      localStorage.removeItem("token");
      localStorage.removeItem("googleLinked");

      // 3) 구글 계정 자체 로그아웃 팝업
      const googleLogoutPopup = window.open(
        "https://accounts.google.com/Logout",
        "GoogleLogout",
        "width=500,height=600"
      );
      setTimeout(() => {
        if (googleLogoutPopup && !googleLogoutPopup.closed) {
          googleLogoutPopup.close();
        }
      }, 1000);

      // 메인 화면으로 이동
      navigate("/", { replace: true });
    } catch (error) {
      console.error("로그아웃 중 오류 발생:", error);
    }
  };

  return (
    <RefreshProvider>
      <UserContext.Provider
        value={{
          user,
          googleUser,
          userRole,
          authLoading,
          token,
          setToken,
          googleLinked,
        }}
      >
        <BirthContext.Provider value={birth}>
          <div className="App">
            <Navbar onLogout={handleLogout} checkGoogleUser={checkGoogleUser} />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login checkUser={checkUser} />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/mypage" element={<MyPage setBirth={setBirth} />} />
              <Route path="/address" element={<AddressBook />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/contact/:roomId" element={<Contact />} />
              <Route path="/contact_admin" element={<ContactAdmin />} />
              {/* 경로에 맞는 페이지가 없으면 무조건 에러 페이지 */}
              <Route path="*" element={<ErrorPage />} />
              {/* 401 에러 페이지 */}
              <Route path="/err401" element={<ErrorPage statusCode={401} />} />
              {/* 푸터 추가 페이지? */}
              <Route path="/faq" element={<Faq />} />
              <Route path="/guide" element={<Guide />} />
              <Route path="/terms" element={<Terms />} />
            </Routes>
            <Footer />
          </div>
        </BirthContext.Provider>
      </UserContext.Provider>
    </RefreshProvider>
  );
}

export default App;
