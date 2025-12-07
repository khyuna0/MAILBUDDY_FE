import CalendarNav from "./CalendarNav";
import CalendarHome from "./CalendarHome";
import { useContext, useEffect, useState } from "react";
import { formatToYMD } from "../../utils/DateTimeUtils";
import api from "../../api/axiosConfig";
import {
  useScheduleDispatch,
  useScheduleState,
} from "../../context/ScheduleContext";
import CalendarList from "../calendarpopup/CalendarList";
import CalendarHeader from "../calendarpopup/CalendarHeader";
import CalendarDetail from "../calendarpopup/CalendarDetail";
import CalendarWriteForm from "../calendarpopup/CalendarWriteForm";
import { useRefresh } from "../../context/RefreshContext";
import LoadingOverlay from "../LoadingOverlay";
import "../../css/Loading.css";
import { UserContext } from "../../context/UserContext";

// Schedule(일정 Pages) : CalendarContainer(달력), Todo(투두) , Memo(메모)
// CalendarContainer(달력 Component)
// : CalendarNav (상단) + Memo(날짜 없는 ai 요약 메일 모음)
// + CalendarHome (캘린더 월 화면)
// + CalendarDetail (일정 상세보기) + CalendarWrite (일정 추가) + CalendarEdit (일정 수정)

// 달력 부분의 컴포넌트 및 팝업 부분을 모아둔 컨테이너.
// 아마 이 부분에 api 호출 관련을 전부 모아둘 예정 ??? (아직모름)
const CalendarContainer = ({ writeFormOpen, setWriteFormOpen }) => {
  //ai 로딩상태 -> 캘린더 전체 덮는 오버레이로 제어해야해서 여기로 옮김
  const [aiLoading, setAiLoading] = useState(false);
  const { activeStartDate, isEdit, isWrite, popupOpen } = useScheduleState();
  const dispatch = useScheduleDispatch();
  const { refreshCount } = useRefresh();
  const { user } = useContext(UserContext);

  // 현재 날짜(activeStartDate)에 맞는 월별 로컬 일정 가져오기 + type 필드 추가
  const loadMonthlyEvents = async () => {
    try {
      const date = formatToYMD(activeStartDate); // 2025-11-01
      const res = await api.get("/api/schedules/month?month=" + date);
      const monthlyEventsWithType = res.data.map((event) => ({
        ...event,
        type: "local",
      }));
      dispatch({ type: "SET_MONTHLY_EVENTS", payload: monthlyEventsWithType });
    } catch (e) {
      console.error(e);
      dispatch({ type: "SET_MONTHLY_EVENTS", payload: [] });
    }
  };

  // 현재 날짜(activeStartDate)에 맞는 월별 ai 요약 일정 가져오기 + type 필드 추가
  const loadSummaryMonthlyEvents = async () => {
    try {
      const date = formatToYMD(activeStartDate); // 2025-11-01
      const res = await api.get("/api/summarize/month?month=" + date);
      const summaryMonthlyEventsWithType = res.data.map((event) => ({
        ...event,
        type: "summary",
      }));
      dispatch({
        type: "SET_SUMMARY_MONTHLY_EVENTS",
        payload: summaryMonthlyEventsWithType,
      });
    } catch (e) {
      console.error(e);
      dispatch({ type: "SET_SUMMARY_MONTHLY_EVENTS", payload: [] });
    }
  };

  //요약 끝난 후 월별 일정/요약 같이 다시 불러줄 함수
  const reloadMonthlyData = async () => {
    await Promise.all([loadMonthlyEvents(), loadSummaryMonthlyEvents()]);
    //promise - 비동기 작업 미래 결과 담는 객체
    //
  };

  // currentDate가 바뀔 때마다 월별 일정과 월별 요약을 다시 가져오기
  useEffect(() => {
    loadMonthlyEvents();
    loadSummaryMonthlyEvents();
  }, [activeStartDate, refreshCount]); // 리프레시 신호 받으면 리랜더

  useEffect(() => {
    if (!popupOpen) {
      setWriteFormOpen(false);
    }
    if (writeFormOpen && user) {
      dispatch({
        type: "SET_POPUPOPEN",
        payload: true,
      });
      dispatch({
        type: "SET_ISWRITE",
        payload: true,
      });
    } else if (writeFormOpen) {
      dispatch({
        type: "SET_POPUPOPEN",
        payload: true,
      });
    }
  }, [writeFormOpen, popupOpen]);

  return (
    <div className="mb-calendar-shell">
      {/* aiLoading이 true일 때만 캘린더 영역을 덮는 오버레이 */}
      {aiLoading && <LoadingOverlay text="AI가 메일을 요약하는 중입니다..." />}

      <div className="calpage-wrap">
        <div className="cal-body">
          <div className="cal-card cal-left-card">
            {/* 캘린더 상단 버튼 영역 */}
            <CalendarNav
              aiLoading={aiLoading}
              setAiLoading={setAiLoading}
              loadSummaries={reloadMonthlyData} // AI 끝나면 월별 데이터 다시 로드
            />
            <div className="cal-left">
              {/* 리액트 캘린더 라이브러리, 캘린더 전체를 감싸는 컴포넌트 */}
              <CalendarHome />
            </div>
          </div>
        </div>

        {/* 팝업: 헤더가 오버레이 + 패널을 감싸고,
          안쪽에 리스트 / 디테일 / 작성폼을 children 으로 넘김 */}
        {popupOpen && (
          <CalendarHeader>
            <div className="modal-2col">
              <CalendarList />
              {isWrite || isEdit ? <CalendarWriteForm /> : <CalendarDetail />}
            </div>
          </CalendarHeader>
        )}
      </div>
    </div>
  );
};

export default CalendarContainer;
