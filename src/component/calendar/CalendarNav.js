import { useContext, useState } from "react";
import api from "../../api/axiosConfig";
import "../../css/CalendarNav.css";
import { UserContext } from "../../context/UserContext";
import { useRefresh } from "../../context/RefreshContext";
import useApi from "../../hooks/useApi";
import { useScheduleDispatch } from "../../context/ScheduleContext";

// 캘린더 상단 (ai요약하기, 도움말, 지메일가져오기)
const CalendarNav = ({ aiLoading, setAiLoading, loadSummaries }) => {
  const [aiError, setAiError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  const { trigger } = useRefresh();
  const { googleUser, googleLinked, user } = useContext(UserContext);

  const isErrorMsg =
    typeof message === "string" &&
    (message.includes("실패") || message.includes("오류"));

  // nav에서 오늘로 가기 버튼 눌렀을 때
  const dispatch = useScheduleDispatch();
  const handleGoToday = () => {
    dispatch({ type: "SET_SELECTED_DATE", payload: new Date() });
    dispatch({ type: "SET_ACTIVE_START_DATE", payload: new Date() });
  };

  // AI 요약 버튼
  const handleSummarize = async () => {
    setAiLoading(true); // 오버레이 켜기
    setAiError(null);
    setMessage("");

    try {
      await api.post("/api/summarize");
      await loadSummaries(); // 날짜,시간 있는 일정 로딩
      trigger(); // 트리거
    } catch (e) {
      console.error(e);
      setAiError(`요약 실패: ${e.response?.data?.message || e.message}`);
    } finally {
      setAiLoading(false); // 오버레이 끄기
    }
  };

  // 상위 10개 메일 저장
  const handleSaveEmails = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await api.get("/api/gmail/messages/save-top10");
      setMessage(res.data);
    } catch (error) {
      console.error("Error:", error);
      setMessage(
        "메일 저장 실패: " + (error.response?.data?.message || error.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="cal-toolbar">
      <button
        className="btn-today"
        type="button"
        onClick={handleGoToday}
        title="오늘 날짜로 바로 이동"
      >
        오늘로 가기
      </button>

      {/* AI 요약 버튼 (로그인 + 구글 연동된 경우에만) */}
      {googleLinked && user && (
        <button
          className="btn-ai"
          title="DB에 저장된 Gmail로부터 AI 요약 생성/업데이트"
          onClick={handleSummarize}
          disabled={aiLoading}
        >
          {aiLoading ? "요약 중…" : "AI 요약하기"}
        </button>
      )}

      {/* AI 오류 메시지 */}
      {aiError && <span className="ai-error">{aiError}</span>}

      {/* 상위 10개 메일 저장 버튼 (구글 연동된 경우에만) */}
      {googleLinked && user && (
        <button
          onClick={handleSaveEmails}
          disabled={isLoading} // 로딩중 중복 클릭 방지
          className="btn-mail"
          title="Gmail에서 상위 10개 메일을 불러와 저장"
        >
          {isLoading ? "저장 중..." : "📧 상위 10개 메일 저장"}
        </button>
      )}

      {/* 결과/에러 메시지 */}
      {!!message && (
        <span className={`mini-msg ${isErrorMsg ? "error" : "success"}`}>
          {message}
        </span>
      )}
    </div>
  );
};

export default CalendarNav;
