import { useState, useEffect } from "react";
import "../../css/CalendarWriteForm.css";
import { useScheduleDispatch, useScheduleState } from "../../context/ScheduleContext";
import useApi from "../../hooks/useApi";
import { useRefresh } from "../../context/RefreshContext";
import api from "../../api/axiosConfig";
import { formatToYMD } from "../../utils/DateTimeUtils";
import { updateAiSchedule, updateUserSchedule } from "../../api/ScheduleApi";
import { cleanFormValue } from "../../utils/FormValueUtil";
import ErrorPage from "../ErrorPage";

// 작성 / 수정 폼
const CalendarWriteForm = () => {
  const { selectedDate, selectedItem, isEdit, sortedDailyEvents } = useScheduleState();
  const dispatch = useScheduleDispatch();
  const { error, loading, request, setError } = useApi();
  const { trigger } = useRefresh();

  const [formValue, setFormValue] = useState({
    title: "",
    notes: "",
    place: "",
    eventDate: formatToYMD(selectedDate),
    eventTime: "00:00",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValue((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (isEdit && selectedItem) {
      setFormValue({
        title: selectedItem.title,
        notes: selectedItem.notes,
        place: selectedItem.place,
        eventDate: formatToYMD(selectedItem.eventDate) || formatToYMD(selectedDate),
        eventTime: selectedItem.eventTime || "00:00",
      });
    }
  }, [isEdit, selectedItem]);

  const onEdit = async (e) => {
    e.preventDefault();
    setError("");

    const { cleaned, cleanErr } = cleanFormValue(formValue);

    if (cleanErr) {
      alert(cleanErr);
      setError(cleanErr);
      return;
    }

    try {
      if (selectedItem.type === "summary") {
        await request(() => updateAiSchedule(selectedItem.id, cleaned));
        alert("AI 일정 수정 완료");
      } else if (selectedItem.type === "local") {
        await request(() => updateUserSchedule(selectedItem.id, cleaned));
        alert("일정 수정 완료");
      }
      dispatch({ type: "SET_POPUPOPEN", payload: false });
      dispatch({ type: "SET_ISEDIT", payload: false });
    } catch (err) {
      console.error(err);
      setError("수정 실패");
    } finally {
      trigger();
    }
  };

  const onSave = async (e) => {
    e.preventDefault();
    setError("");

    const { cleaned, cleanErr } = cleanFormValue(formValue);
    if (cleanErr) {
      alert(cleanErr);
      setError(cleanErr);
      return;
    }
    try {
      await api.post("/api/schedules", cleaned);
      alert("일정 추가 완료");
      dispatch({ type: "SET_ISWRITE", payload: false });
    } catch (err) {
      setError("저장 실패");
    } finally {
      trigger();
    }
  };
  if (error && typeof error === "string" && error.includes("서버")) {
    // 문자열 에러 메시지 내 "서버" 키워드 체크?
    return <ErrorPage statusCode={500} message={error} />;
  } else if (error === 400) {
    return <ErrorPage statusCode={400} />;
  }

  return (
    <section className="write-form">
      <form onSubmit={isEdit ? onEdit : onSave}>
        {/* 제목 */}
        <label className="write-field">
          <span className="write-label">제목 *</span>
          <input name="title" value={formValue.title} onChange={handleChange} required />
        </label>

        <div className="write-field">
          <span className="write-label">날짜 *</span>
          <input
            name="eventDate"
            type="date"
            className="write-input"
            value={formValue.eventDate}
            onChange={handleChange}
          />
        </div>

        <div className="write-field">
          <span className="write-label">시간 *</span>
          <input
            name="eventTime"
            type="time"
            className="write-input"
            value={formValue.eventTime}
            onChange={handleChange}
            required
          />
        </div>

        {/* 내용 */}
        <label className="write-field">
          <span className="write-label">내용</span>
          <textarea name="notes" rows={4} value={formValue.notes} onChange={handleChange} placeholder="세부 내용" />
        </label>

        {/* 장소 */}
        <label className="write-field">
          <span className="write-label">장소</span>
          <input
            name="place"
            value={formValue.place}
            onChange={handleChange}
            placeholder="장소 정보가 없으면 날씨/지도가 표시되지 않아요"
          />
        </label>

        {error && <div className="write-error">{error}</div>}
        {/* 버튼 */}
        <div className="write-actions">
          <button
            type="button"
            onClick={() => {
              dispatch({ type: "SET_ISEDIT", payload: false });
              dispatch({ type: "SET_ISWRITE", payload: false });
              dispatch({
                type: "SET_SELECTED_ITEM",
                payload: sortedDailyEvents[0] || null,
              });
            }}
          >
            취소
          </button>

          <button className="write-btn-primary" disabled={loading}>
            {loading ? "로딩 중..." : isEdit ? "수정" : "저장"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CalendarWriteForm;
