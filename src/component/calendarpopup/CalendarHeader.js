import { useContext, useMemo } from "react";
import { BirthContext } from "../../context/BirthContext";
import {
  useScheduleDispatch,
  useScheduleState,
} from "../../context/ScheduleContext";
import useApi from "../../hooks/useApi";
import { birthConfetti, birthIcon, isBirth } from "../../utils/BirthUtil";
import { formatDateKorean, formatToYMD } from "../../utils/DateTimeUtils";
import { UserContext } from "../../context/UserContext";

// CalendarHearder 가 이제 팝업의 "껍데기 + 상단바" 역할
// 안쪽 리스트 / 디테일 / 작성폼은 children 으로 받음
const CalendarHeader = ({ children }) => {
  const { selectedDate } = useScheduleState();
  const dispatch = useScheduleDispatch();
  const birth = useContext(BirthContext);
  const { user } = useContext(UserContext);
  const { error, loading, request, setError } = useApi();

  const onWrite = () => {
    dispatch({ type: "SET_ISWRITE", payload: true });
    dispatch({ type: "SET_SELECTED_ITEM", payload: null });
  };

  const offPopUp = () => {
    // 팝업 창 전체 닫기, 수정, 쓰기 모두 off, 안전하게 selectedItem 도 없앰
    dispatch({ type: "SET_POPUPOPEN", payload: false });
    dispatch({ type: "SET_ISEDIT", payload: false });
    dispatch({ type: "SET_ISWRITE", payload: false });
    dispatch({ type: "SET_SELECTED_ITEM", payload: {} });
  };

  // 날짜 헤더 텍스트 (2025년 1월 5일 → ‘2025년 1월 5일 일요일’ 등)
  const headerDateText = useMemo(() => {
    return formatDateKorean(selectedDate);
  }, [selectedDate]);

  return (
    // 이 "modal-overlay" 클래스가 클릭을 막는대서 schedule.css 임시로 제거함
    // → 다시 전체 팝업 오버레이 용도로 사용
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="modal-panel"
        onClick={(e) => e.stopPropagation()} // 팝업 안쪽 클릭 시 배경 클릭으로 닫히는 것 방지
      >
        {/* 상단 날짜/아이콘/버튼 영역 */}
        <div className="modal-topbar">
          <div className="date-title">
            <span className="date-text">
              {headerDateText}
              {/* 생일이면 아이콘, 컨페티 */}
              {/* // yyyy-mm-dd 형태로 selectedDate 포맷해서 사용 date 객체면 오류나서?  */}
              {isBirth(formatToYMD(selectedDate), birth) && birthIcon()}
              {isBirth(formatToYMD(selectedDate), birth) && birthConfetti()}
            </span>
          </div>

          <div className="topbar-actions">
            {user && (
              <button
                type="button"
                className="topbar-btn topbar-btn-primary"
                onClick={onWrite}
              >
                일정 추가
              </button>
            )}
            <button type="button" className="topbar-btn" onClick={offPopUp}>
              닫기
            </button>
          </div>
        </div>

        {/* 여기 안에 CalendarList + CalendarDetail/CalendarWriteForm 이 들어옴 */}
        {children}
      </div>
    </div>
  );
};

export default CalendarHeader;
