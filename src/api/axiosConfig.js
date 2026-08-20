import axios from "axios";
import { getToken } from "./tokenHelper";

const api = axios.create({
  baseURL: "http://localhost:8888",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = getToken();

  // JWT 안 붙일 엔드포인트 목록 (세션 기반 OAuth2 용)
  const skipAuthUrls = ["/api/auth/me"];

  const url = config.url || "";

  // url 이 skip 목록에 있으면 JWT 헤더를 붙이지 않음
  const shouldSkip = skipAuthUrls.some((u) => url.startsWith(u));

  if (token && !shouldSkip) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
