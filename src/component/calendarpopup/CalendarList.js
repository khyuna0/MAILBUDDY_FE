import { useContext, useEffect, useMemo } from "react";
import {
  useScheduleDispatch,
  useScheduleState,
} from "../../context/ScheduleContext";
import useApi from "../../hooks/useApi";
import { splitAndSortEvents } from "../../utils/EventUtils";
import { deleteSummary, deleteUserSchedule } from "../../api/ScheduleApi";
import { formatToYMD, formatToHHmm } from "../../utils/DateTimeUtils";
import api from "../../api/axiosConfig";
import { useRefresh } from "../../context/RefreshContext";
import "../../css/CalendarList.css";

const CalendarList = () => {
  const {
    selectedItem,
    selectedDate,
    summaryDailyEvents,
    dailyEvents,
    sortedDailyEvents,
    isEdit, // 수정모두여부 가져오기 /  추가 : memo edit시 오류 수정 해결중
  } = useScheduleState();
  const dispatch = useScheduleDispatch();
  const { error, loading, request, setError } = useApi();
  const { trigger, refreshCount } = useRefresh();

  // 일별 요약 가져오기
  const loadDailyEvents = async () => {
    try {
      const date = formatToYMD(selectedDate); // 2025-11-01
      const res = await api.get("/api/schedules/day?day=" + date);
      const dailyEventsWithType = res.data.map((event) => ({
        ...event,
        type: "local",
      }));
      dispatch({ type: "SET_DAILY_EVENTS", payload: dailyEventsWithType });
    } catch (e) {
      console.error(e);
      dispatch({ type: "SET_DAILY_EVENTS", payload: [] });
    }
  };

  // 일별 요약 가져오기
  const loadSummaryDailyEvents = async () => {
    try {
      const date = formatToYMD(selectedDate); // 2025-11-01
      const res = await api.get("/api/summarize/day?day=" + date);
      const summaryDailyEventsWithType = res.data.map((event) => ({
        ...event,
        type: "summary",
      }));
      dispatch({
        type: "SET_SUMMARY_DAILY_EVENTS",
        payload: summaryDailyEventsWithType,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: "SET_SUMMARY_DAILY_EVENTS", payload: [] });
    }
  };

  useEffect(() => {
    // 날짜가 바뀔 때마다 해당 날짜의 데이터만 새로 요청
    loadDailyEvents();
    loadSummaryDailyEvents();
  }, [refreshCount]);

  useEffect(() => {
    // 아직 데이터가 없으면 패스
    if (!dailyEvents && !summaryDailyEvents) return;

    const { sortedDailyEvents, unsortedDailyEvents } = splitAndSortEvents(
      dailyEvents.map((event) => ({ ...event, type: "local" })), // 이후 api 호출을 위해 타입으로 구별함 -> 서머리인지,,, 로컬인지
      summaryDailyEvents.map((event) => ({ ...event, type: "summary" })),
      "DailyEvents"
    );

    // 정렬/ 날짜, 시간 미정 리스트 저장
    dispatch({ type: "SET_SORTED_DAILY_EVENTS", payload: sortedDailyEvents });
    dispatch({
      type: "SET_UNSORTED_DAILY_EVENTS",
      payload: unsortedDailyEvents,
    });

    if (selectedItem) {
      const updated = sortedDailyEvents.find(
        // .find(조건에 맞는 요소 찾기)
        (ev) => ev.type === selectedItem.type && ev.id === selectedItem.id
      );

      if (updated) {
        dispatch({ type: "SET_SELECTED_ITEM", payload: updated });
        return; // 아래 자동 선택 코드 안타게
      }
    }

    //추가함 - 수정모드일땐 자동선택 / 초기화 막아두기 -> 안막아두면 memo에서 수정시 null값됨
    if (isEdit) {
      return;
    }

    // 추가 -> 현재 선택된 일정이 여전히 리스트에 존재하면 그대로 유지
    const stillExists =
      selectedItem &&
      sortedDailyEvents.some(
        (ev) => ev.type === selectedItem.type && ev.id === selectedItem.id
      );

    if (stillExists) {
      // console.log("기존 선택 유지");
      return;
    }

    // 아무것도 선택 안 되어 있을때 -> 제일 빠른 일정 자동 선택
    if (sortedDailyEvents.length > 0) {
      dispatch({
        type: "SET_SELECTED_ITEM",
        payload: sortedDailyEvents[0],
      });
    } else {
      // 일정이 하나도 없으면 선택 해제
      dispatch({ type: "SET_SELECTED_ITEM", payload: null });
    }
  }, [dailyEvents, summaryDailyEvents, dispatch]);

  // 일정 삭제
  const onDelete = async (events) => {
    if (!window.confirm("일정을 삭제하시겠습니까?")) return;

    try {
      if (events.type === "local") {
        await deleteUserSchedule(events.id);
      } else {
        await deleteSummary(events.id);
      }
      alert("삭제 완료");
    } catch (e) {
      console.error(e);
    } finally {
      trigger();
    }
  };

  const setSelectedItem = (events) => {
    dispatch({ type: "SET_SELECTED_ITEM", payload: events });
  };

  if (loading)
    return (
      <aside className="sched-list">
        <h4 className="section-title">오늘의 일정</h4>
        <div className="loading">불러오는 중…</div>
      </aside>
    );

  return (
    <aside className="sched-list">
      <h4 className="section-title">오늘의 일정</h4>
      <ul>
        <li>
          <div className="badge-box"></div>
          <div className="title">
            {sortedDailyEvents.map((events) => (
              <div
                key={`${events.type}-${events.id}`} // ai-4 식으로 키값 지정
                className="sched-item" // 일정 타일
                onClick={() => setSelectedItem(events)} // 🔹 타일 클릭 시 선택
              >
                {/* 일정 기본 정보 */}
                <div className="sched-item-main">{events.title}</div>
                <div className="sched-item-meta">
                  {events.place && <span>{events.place}</span>}
                  {events.eventDate && <span>{events.eventDate}</span>}
                  {events.eventTime && (
                    <span>{formatToHHmm(events.eventTime)}</span>
                  )}
                </div>

                {/* 발신자 이메일, 이름 정보 출력 (유무에 따라 다르게 지정함)  */}
                <div className="sched-item-meta-sender">
                  {events.senderName && events.senderEmail && (
                    <span>
                      {events.senderName} - {events.senderEmail}
                    </span>
                  )}

                  {events.senderName && !events.senderEmail && (
                    <span>{events.senderName}</span>
                  )}

                  {!events.senderName && events.senderEmail && (
                    <span>{events.senderEmail}</span>
                  )}
                </div>

                {/* 삭제 버튼 - 클릭해도 타일 onClick은 막기 */}
                <div className="sched-item-actions">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // 타일 클릭 이벤트 막기
                      onDelete(events);
                    }}
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </li>
      </ul>
    </aside>
  );
};

export default CalendarList;
