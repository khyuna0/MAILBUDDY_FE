import { createContext, useContext, useReducer } from "react";

const RefreshContext = createContext(null); // 전역 새로고침 용 컨텍스트

// 트리거 호출 시 디스패치 실행, State+1 해서 변경됨을 알리는 역할
function refreshReducer(state) {
  return { count: state.count + 1 };
}

// 전역 공유용
export function RefreshProvider({ children }) {
  // useReducer를 사용해 refresh 상태를 관리함
  // state.count → 현재 새로고침 번호
  // dispatch() → trigger()가 호출되면 reducer 실행
  const [state, dispatch] = useReducer(refreshReducer, { count: 0 });
  // 이 함수가 불리면 dispatch() → reducer() → state.count 증가
  // state.count가 바뀌면 useEffect([... , refreshCount]) 훅들이 자동 실행됨
  const trigger = () => dispatch();

  return (
    // 전역으로 제공: refreshCount와 trigger
    // refreshCount가 변하면 refreshCount를 바라보는 모든 컴포넌트가 다시 렌더링
    <RefreshContext.Provider value={{ refreshCount: state.count, trigger }}>
      {children}
    </RefreshContext.Provider>
  );
}

export const useRefresh = () => useContext(RefreshContext);

// 사용 방법

//  const { refreshCount, trigger } = useRefresh(); -- 선언부
//  const { trigger } = useRefresh();

// trigger(); -- 호출하면 리프레시 신호 보냄 refreshCount + 1 해서 refreshCount 값이 바뀜

// useEffect(() => {
// }, [refreshCount]); // ← trigger() 호출될 때마다 자동 재실행됨. 필요한 곳에 추가!
