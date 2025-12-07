// Chat에 이용되는 State와 Reducer export 내보내기
export const initialChatState = {
  messages: [], // 모든 메시지 배열 (환영 메시지도 포함)
  text: "", // 현재 작성하는 내용
  connected: false, // 연결 여부
  error: null, // 에러
};

export function chatReducer(state, action) {
  switch (action.type) {
    case "SET_MESSAGES": // 이전 채팅 기록 불러오기
      return { ...state, messages: action.payload };
    case "ADD_MESSAGE": // 메시지 추가
      return { ...state, messages: [...state.messages, action.payload] };
    case "SET_TEXT":
      return { ...state, text: action.payload };
    case "CLEAR_TEXT":
      return { ...state, text: "" };
    case "CONNECT":
      return { ...state, connected: true, error: null };
    case "DISCONNECT":
      return { ...state, connected: false };
    case "SET_ERROR":
      return { ...state, error: action.payload };
    case "RESET":
      return initialChatState;
    default:
      return state;
  }
}
