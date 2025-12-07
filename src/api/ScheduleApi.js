import api from "./axiosConfig";

// API 호출 관련 모두 모아봤습니다.

// 사용자 일정 추가
export const writeUserSchedule = async (body) => {
  return await api.post("/api/schedules", body);
};

// 사용자 일정 수정
export const updateUserSchedule = async (id, body) => {
  return api.patch(`/api/schedules/${id}`, body);
};

// 사용자 일정 리스트 불러오기
export const getUserSchedules = (date) =>
  api.get("/api/schedules/date", {
    params: { value: date },
    withCredentials: true,
  });

// 사용자 일정 삭제
export const deleteUserSchedule = (id) => api.delete(`/api/schedules/${id}`, { withCredentials: true });

// ym 값으로 월별 사용자 일정 조회
export async function getMonthlyUserSchedules(ym) {
  const res = await api.get("/api/schedules/ym", {
    params: { value: ym },
    withCredentials: true,
  });
  return Array.isArray(res.data) ? res.data : [];
}

// ------------------ Summary

// Summary 요약 전체 조회
export async function getAllSummaries() {
  const res = await api.get("/api/summarize/list");
  return Array.isArray(res.data) ? res.data : [];
}

// Summary (전체)불러오기
export const getSummaries = () => api.get("/api/summarize/list");

// Summary 삭제
export const deleteSummary = (id) => api.delete(`/api/summarize/${id}`, { withCredentials: true });

// Summary 수정
export const updateAiSchedule = async (id, body) => {
  return api.patch(`/api/summarize/${id}`, body);
};

// Google 기능, AI 기능 호출?

// AI 요약 실행 (기존 summarize-existing)
export async function runAiSummaries() {
  return api.post("/api/summarize/summarize-existing");
}

// AI 요약 전체 조회
export async function fetchSummaries() {
  return api.get("/api/summarize/list");
}

// Gmail 상위 10개 저장
export async function saveTop10Emails() {
  return api.get("/api/gmail/messages/save-top10");
}
