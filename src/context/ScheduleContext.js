import React, { createContext, useReducer, useContext } from "react";

const ScheduleStateContext = createContext(); // 실제 값들 (state)
const ScheduleDispatchContext = createContext(); // state를 변경하는 함수 (dispatch)

const initialState = {
  selectedDate: new Date(), // 사용자가 선택한 날짜
  activeStartDate: new Date(), // 변경된 날짜의 월의 1일 (캘린더 홈 기준 현재 보여지는 날짜)
  selectedItem: [], // 1개의 일정

  summaryMonthlyEvents: [], // ai 요약 월별 일정
  monthlyEvents: [], // 로컬 월별 일정
  allEvents: [], // ai월별메일 + 로컬월별일정 (필요없는듯?)
  sortedMonthlyEvents: [], // allEvents(summaryMonthlyEvents + monthlyEvents) 중에서 date, time 모두 있는 경우
  unsortedMonthlyEvents: [], // allEvents(summaryMonthlyEvents + monthlyEvents) 중에서 date, time 하나라도 없는 경우 - 날짜는 있는데 시간 없을때

  tbdEvents: [], // 날짜 없는 (미정, to be decided) 일정 - summary 날짜 없는용 , 위에는 monthly 들어가있음 // 날짜없거나 날짜 +시간 없을때

  summaryDailyEvents: [], // ai 요약 일별 메일
  dailyEvents: [], // 로컬 일별 일정
  sortedDailyEvents: [], // summaryDailyEvents + dailyEvents 중에서 date, time 모두 있는 경우
  unsortedDailyEvents: [], // summaryDailyEvents + dailyEvents 중에서 date, time 하나라도 없는 경우
  // ...필요 상태들

  // 글쓰기, 수정, 일정 팝업 열기 트리거 추가
  isEdit: false,
  isWrite: false,
  popupOpen: false,
};

// state : 현재 상태(위에 initialState 같은 모양의 객체)
// action : 어떻게 바꿀것인가 -> type: 어떤동작인지(문자열) , payload:실제 넣어줄 값
// 각 case에서 ...state로 기존 값 복사 -> 바꾸고 싶은 필드만 덮어씌우는 패턴
function scheduleReducer(state, action) {
  switch (action.type) {
    case "SET_SELECTED_DATE":
      return { ...state, selectedDate: action.payload };
    case "SET_ACTIVE_START_DATE":
      return { ...state, activeStartDate: action.payload };
    case "SET_SELECTED_ITEM":
      return { ...state, selectedItem: action.payload };
    case "SET_SUMMARY_MONTHLY_EVENTS":
      return { ...state, summaryMonthlyEvents: action.payload };
    case "SET_MONTHLY_EVENTS":
      return { ...state, monthlyEvents: action.payload };
    case "SET_ALL_EVENTS":
      return { ...state, allEvents: action.payload };
    case "SET_SORTED_MONTHLY_EVENTS":
      return { ...state, sortedMonthlyEvents: action.payload };
    case "SET_UNSORTED_MONTHLY_EVENTS":
      return { ...state, unsortedMonthlyEvents: action.payload };
    case "SET_TBD_EVENTS":
      return { ...state, tbdEvents: action.payload };
    case "SET_SUMMARY_DAILY_EVENTS":
      return { ...state, summaryDailyEvents: action.payload };
    case "SET_DAILY_EVENTS":
      return { ...state, dailyEvents: action.payload };
    case "SET_SORTED_DAILY_EVENTS":
      return { ...state, sortedDailyEvents: action.payload };
    case "SET_UNSORTED_DAILY_EVENTS":
      return { ...state, unsortedDailyEvents: action.payload };
    case "SET_SCHEDULES":
      return { ...state, schedules: action.payload };
    // 팝업 관련, 디테일 창, 수정 창 등...
    case "SET_ISEDIT":
      return { ...state, isEdit: action.payload };
    case "SET_ISWRITE":
      return { ...state, isWrite: action.payload };
    case "SET_POPUPOPEN":
      return { ...state, popupOpen: action.payload };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

// Provider
export function ScheduleProvider({ children }) {
  //useReducer로 전역상태 만들기
  const [state, dispatch] = useReducer(scheduleReducer, initialState);

  return (
    //ScheduleStateContext.Provider에 value={state} 넣어줌
    <ScheduleStateContext.Provider value={state}>
      <ScheduleDispatchContext.Provider value={dispatch}>{children}</ScheduleDispatchContext.Provider>
    </ScheduleStateContext.Provider>
  );
}

// 커스텀 훅
export function useScheduleState() {
  const context = useContext(ScheduleStateContext);
  if (context === undefined) {
    throw new Error("useScheduleState must be used within a ScheduleProvider");
  }
  return context;
}

export function useScheduleDispatch() {
  const context = useContext(ScheduleDispatchContext);
  if (context === undefined) {
    throw new Error("useScheduleDispatch must be used within a ScheduleProvider");
  }
  return context;
}
