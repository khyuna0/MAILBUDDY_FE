// import { createContext, useContext, useReducer } from "react";

// const ChatStateContext = createContext();
// const ChatDispatchContext = createContext();

// const initialState = { messages: [] };

// function chatReducer(state, action) {
//   switch (action.type) {
//     case "LOAD_MESSAGES": // 뭘하고 싶었던 걸까 나는 ..
//       return { ...state, messages: [] };
//     case "ADD_MESSAGE":
//       return { ...state, messages: [...state.messages, action.payload] };
//     case "MARK_READ":
//       return {
//         ...state,
//         messages: state.messages.map((m) => (m.id === action.payload ? { ...m, isRead: true } : m)),
//       };
//     default:
//       return state;
//   }
// }

// export function ChatProvider({ children }) {
//   const [state, dispatch] = useReducer(chatReducer, initialState);

//   return (
//     <ChatStateContext.Provider value={state}>
//       <ChatDispatchContext.Provider value={dispatch}>{children}</ChatDispatchContext.Provider>
//     </ChatStateContext.Provider>
//   );
// }

// export function useChatState() {
//   const context = useContext(ChatStateContext);
//   if (context === undefined) {
//     throw new Error("useChatState must be used within a ChatProvider");
//   }
//   return context;
// }

// export function useChatDispatch() {
//   const context = useContext(ChatDispatchContext);
//   if (context === undefined) {
//     throw new Error("useChatDispatch must be used within a ChatProvider");
//   }
//   return context;
// }
