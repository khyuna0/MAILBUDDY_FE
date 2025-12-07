import { useEffect } from "react";
import Calendar from "react-calendar";
import { formatToYMD } from "../../utils/DateTimeUtils";
import { useScheduleDispatch, useScheduleState } from "../../context/ScheduleContext";
import { splitAndSortEvents } from "../../utils/EventUtils";
import CalendarTile from "./CalendarTile";

// Schedule(일정 Pages) : CalendarContainer(달력), Todo(투두)
// CalendarContainer(달력 Component)
// : CalendarNav (상단) + Memo(날짜 없는 ai 요약 메일 모음)
// + CalendarHome (캘린더 월 화면)
// + CalendarDetail (일정 상세보기) + CalendarWrite (일정 추가) + CalendarEdit (일정 수정)

const CalendarHome = () => {
  const { selectedDate, activeStartDate, summaryMonthlyEvents, monthlyEvents, sortedMonthlyEvents } =
    useScheduleState();
  const dispatch = useScheduleDispatch();

  // 날짜 선택 시 호출, 변경된 날짜(date)를 받아 상태 변경
  const onDateChange = (date) => {
    dispatch({ type: "SET_SELECTED_DATE", payload: date });
    // console.log("지금 날짜 : ", selectedDate);
  };

  // 월이 바뀔 때 호출, activeStartDate는 월의 첫날
  const handleActiveMonthChange = ({ activeStartDate }) => {
    if (!activeStartDate) return;
    // 그 달의 첫날로 selectedDate 설정
    dispatch({ type: "SET_ACTIVE_START_DATE", payload: activeStartDate });
  };

  // 로컬 일정 + ai 일정 모두 가져와서 시간순 정렬해주는 함수 (달력용, MEMO용 나뉨)
  const loadAllEvents = async () => {
    const { sortedMonthlyEvents, unsortedMonthlyEvents } = splitAndSortEvents(
      monthlyEvents, // 타입이 들어있다?
      summaryMonthlyEvents,
      "MonthlyEvents"
    );
    dispatch({
      type: "SET_SORTED_MONTHLY_EVENTS",
      payload: sortedMonthlyEvents,
    });
    dispatch({
      type: "SET_UNSORTED_MONTHLY_EVENTS",
      payload: unsortedMonthlyEvents,
    });
  };

  useEffect(() => {
    loadAllEvents();
  }, [monthlyEvents, summaryMonthlyEvents]);

  // 날짜 타일 클릭 시 실행되는 커스텀 함수
  const onClickDay = () => {
    // 날짜 타일을 누르면 디테일 폼이 열리게 만듬.
    dispatch({
      type: "SET_POPUPOPEN",
      payload: true,
    });
  };

  return (
    <div>
      {/* 이 클래스네임 두개 다 지워도 될듯? 아직 */}
      <div className="cal-card">
        <div className="cal-left">
          <Calendar
            minDetail="decade" // 가장 넓게 볼 수 있는 뷰 (100년 -> 10년 변경)
            maxDetail="month" // 가장 세부적으로 볼 수 있는 뷰
            minDate={new Date(2020, 0, 1)} // 달력을 사용할 수 있는 범위 기간
            maxDate={new Date(2035, 11, 31)}
            // 선택에 따라 value 변경하는 함수 (setValue의 역할)
            onChange={onDateChange}
            // value : 선택한 날짜 (Date 형태)
            value={selectedDate}
            locale="ko-KR"
            // 날짜를 클릭하면 호출되는 함수 (상세보기가 떠야 하는 거 아닌가? 흠? selectedDate 바꿔주는 용도인가?)
            onClickDay={onClickDay}
            // 보여지는 월의 시작일
            activeStartDate={activeStartDate}
            // 달력에서 월이 바뀔 때(예, 다음 달로 이동) 호출되는 이벤트 **
            onActiveStartDateChange={handleActiveMonthChange} // 다음달 이동시 제일 첫날선택 -> todo 그달꺼 보여주기위해
            tileContent={({ date, view }) => {
              // 날짜 셀에 추가 정보 표시하기 예시
              if (view !== "month") return null;
              // 날짜별 일정 타이틀 등을 보여줄 수 있음
              const tileDate = formatToYMD(date); // 2025-11-17
              // 현재 날짜 셀에 해당하는 일정만 추려냄
              const dailyEvents = sortedMonthlyEvents.filter((ev) => ev.eventDate === tileDate);
              return (
                <div>
                  <CalendarTile tileDate={tileDate} view={view} dailyEvents={dailyEvents} />
                </div>
              );
            }}
          />
        </div>
      </div>
    </div>
  );
};
export default CalendarHome;
