import { createContext, useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { getToken } from "../api/tokenHelper";

export const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // username 또는 user 객체
  const [userRole, setUserRole] = useState(null); // "USER" | "ADMIN"
  const [token, setToken] = useState(getToken()); // JWT
  const [googleLinked, setGoogleLinked] = useState(false);
  const [googleEmail, setGoogleEmail] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // /api/auth/me 호출해서 현재 사용자 정보 가져오기
  const fetchMe = async () => {
    const jwt = getToken();
    if (!jwt) {
      setUser(null);
      setUserRole(null);
      setGoogleLinked(false);
      setGoogleEmail(null);
      setAuthLoading(false);
      return;
    }

    try {
      const res = await api.get("/api/auth/me");
      const data = res.data;

      // username 문자열만 쓸 거면 이렇게
      setUser(data.username);
      setUserRole(data.userRole);
      setGoogleLinked(!!data.googleLinked);
      setGoogleEmail(data.googleEmail || null);
    } catch (e) {
      console.error("fetchMe 실패", e);
      setUser(null);
      setUserRole(null);
      setGoogleLinked(false);
      setGoogleEmail(null);
    } finally {
      setAuthLoading(false);
    }
  };

  // 처음 마운트될 때 한번 실행 (페이지 새로고침 / OAuth 리다이렉트 후)
  useEffect(() => {
    fetchMe();
  }, []);

  // 로그인 성공 시 호출할 함수 (Login.js에서 사용)
  const handleLoginSuccess = (loginResponseDto) => {
    const jwt = loginResponseDto.token;
    localStorage.setItem("token", jwt);
    setToken(jwt);
    fetchMe();
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setUserRole(null);
    setGoogleLinked(false);
    setGoogleEmail(null);
  };

  const value = {
    user, // username
    userRole,
    token,
    googleLinked,
    googleEmail,
    authLoading,
    login: handleLoginSuccess,
    logout,
    refetchUser: fetchMe, // 필요하면 컴포넌트에서 직접 호출 가능
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}
