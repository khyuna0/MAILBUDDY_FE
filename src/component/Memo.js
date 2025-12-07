import { useEffect } from "react";
import api from "../api/axiosConfig";
import "../css/Memo.css";
import { useScheduleDispatch, useScheduleState } from "../context/ScheduleContext";
import { useRefresh } from "../context/RefreshContext";
import { formatToHHmm } from "../utils/DateTimeUtils";

export default function Memo() {
  const { unsortedMonthlyEvents, tbdEvents } = useScheduleState();
  const dispatch = useScheduleDispatch();
  const { trigger } = useRefresh(); // ai요약후 -> 트리거 받기

  // 날짜 없는 요약 목록 로드
  const undatedSummaries = async () => {
    try {
      const res = await api.get("/api/summarize/nodate");
      const undateType = res.data.map((event) => ({
        ...event,
        type: "summary",
      }));
      dispatch({ type: "SET_TBD_EVENTS", payload: undateType });
    } catch (e) {
      console.error(e);
      dispatch({ type: "SET_TBD_EVENTS", payload: [] });
    }
  };

  useEffect(() => {
    undatedSummaries();
  }, [trigger]);

  // 시간없는 요약 목록 확인
  // console.log("시간 없는 ", unsortedMonthlyEvents);

  // 메모 삭제
  const deleteMemo = async (memo) => {
    if (!window.confirm(`"${memo.title || "(제목 없음)"}" 메모를 삭제하시겠습니까?`)) {
      return;
    }
    try {
      await api.delete(`/api/summarize/${memo.id}`, {
        withCredentials: true,
      });

      //날짜 없는 일정 삭제후 로드
      await undatedSummaries();

      // 시간 없는 일정 삭제후 로드
      // await unsortedMonthlyEvents(); // 시간없는 목록 다시 로드 -> 이건 불가능
      // useScheduleState()에서 꺼낸 상태 배열이라서, undatedSummaries()처럼 API를 다시 호출해 주는 함수가 아님
      dispatch({
        type: "SET_UNSORTED_MONTHLY_EVENTS",
        payload: unsortedMonthlyEvents.filter((it) => it.id !== memo.id),
      });

      alert("삭제 완료");
    } catch (e) {
      console.error(e);
      alert("삭제 실패");
    }
  };

  // 메모 수정 -> CalendarWriteForm
  const editMemo = (memo) => {
    // 선택된 일정
    dispatch({
      type: "SET_SELECTED_ITEM",
      payload: memo,
    });

    //수정모드
    dispatch({ type: "SET_ISEDIT", payload: true });
    dispatch({ type: "SET_ISWRITE", payload: false });
    dispatch({ type: "SET_POPUPOPEN", payload: true });
  };

  // 메모
  return (
    <div className="memo-card">
      {/* 이 안이 '아래 절반' 전체. 스크롤은 memo-scroll 하나만 */}
      <div className="memo-scroll">
        {/* ===== 날짜 없는 일정 ===== */}
        <h3 className="memo-title">📅 날짜 없는 일정</h3>
        <div className="nodate">
          {tbdEvents.length === 0 ? (
            <p className="memo-empty">날짜 정보 없는 일정이 없습니다.</p>
          ) : (
            <ul className="memo-list">
              {tbdEvents.map((it) => (
                <li key={it.id} className="memo-item">
                  <div className="memo-item-header">
                    <span className="memo-item-title">{it.title || "(제목 없음)"}</span>
                    <button className="memo-btn" onClick={() => editMemo(it)}>
                      수정
                    </button>
                    <button className="memo-btn" onClick={() => deleteMemo(it)}>
                      삭제
                    </button>
                  </div>

                  {(it.place || it.senderName || it.eventTime || it.senderEmail || it.notes) && (
                    <>
                      <div className="memo-item-meta">
                        {it.place && <span>📍 {it.place}</span>}
                        {it.eventTime && <span>⏰ {formatToHHmm(it.eventTime)}</span>}
                        {it.senderName && <span>👤 {it.senderName}</span>}
                        {it.senderEmail && <span>✉️ {it.senderEmail}</span>}
                      </div>
                      <div className="memo-item-notes">{it.notes && <span>{it.notes}</span>}</div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ===== 시간 없는 일정 ===== */}
        <h3 className="memo-title">⏰ 시간 없는 일정</h3>
        <div className="notime">
          {unsortedMonthlyEvents.length === 0 ? (
            <p className="memo-empty">시간 정보 없는 일정이 없습니다.</p>
          ) : (
            <ul className="memo-list">
              {unsortedMonthlyEvents.map((it) => (
                <li key={it.id} className="memo-item">
                  <div className="memo-item-header">
                    <span className="memo-item-title">{it.title || "(제목 없음)"}</span>
                    <button className="memo-btn" onClick={() => editMemo(it)}>
                      수정
                    </button>
                    <button className="memo-btn" onClick={() => deleteMemo(it)}>
                      삭제
                    </button>
                  </div>

                  {(it.place || it.senderName || it.eventDate || it.senderEmail || it.notes) && (
                    <>
                      <div className="memo-item-meta">
                        {it.place && <span>📍 {it.place}</span>}
                        {it.eventDate && <span>📅 {it.eventDate}</span>}
                        {it.senderName && <span>👤 {it.senderName}</span>}
                        {it.senderEmail && <span>✉️ {it.senderEmail}</span>}
                      </div>
                      <div className="memo-item-notes">{it.notes && <span>{it.notes}</span>}</div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
