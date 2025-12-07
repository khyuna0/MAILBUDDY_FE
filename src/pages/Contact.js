import { useEffect, useRef, useContext, useReducer, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import SockJS from "sockjs-client";
import { Client } from "@stomp/stompjs";
import "../css/Contact.css";
import { UserContext } from "../context/UserContext";
import api from "../api/axiosConfig";
import { chatReducer, initialChatState } from "../context/ChatReducer";
import useApi from "./../hooks/useApi";
import { formatToHHmm } from "../utils/DateTimeUtils";
import LoadingOverlay from "../component/LoadingOverlay";

function Contact() {
  // useContext는 너무 큰 범위 .... useReducer만 이용해보기 ..
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  const { user, userRole, authLoading, token } = useContext(UserContext);

  // userRole에 따른 유저의 username을 가져오기
  const isAdmin = userRole === "ADMIN"; // true
  const isUser = userRole === "USER"; // false
  const adminUsername = isAdmin && user;
  const userUsername = isUser && user;

  const { roomId } = useParams(); // 채팅방 번호
  const stompClient = useRef(null);
  const listRef = useRef(null); // 스크롤 위치
  const endOfMessagesRef = useRef(null); // 마지막 메시지

  const { loading, request } = useApi(); // 추후 수정?
  const navigate = useNavigate();

  // 관리자의 최초 환영 메시지 + 안내 버튼 표시 + 자동응답 답변 변수 설정
  const welcomeMessage = {
    sender: adminUsername,
    text: `${user}님, MailBuddy에 오신 걸 환영합니다! 궁금한 점을 선택해주세요 😊`,
    buttons: [
      { id: 1, label: "Gmail 연동 문의" },
      { id: 2, label: "일반 문의" },
    ],
    type: "welcome",
  };
  const [guideStep, setGuideStep] = useState(0); // 0: 선택 전, 1: Gmail, 2: 일반, 3: 기존 메세지 존재 시, 버튼 클릭 후

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      navigate("/err401", { replace: true });
      return;
    }
  }, [user, authLoading]);

  // ✅ STOMP 연결
  // STOMP 브로커가 /topic/chat/방번호 로 보내는 모든 메시지를 구독
  useEffect(() => {
    if (authLoading) return;
    if (!user || !token) return;

    // 1) SockJS 소켓 생성 (서버 웹소켓 엔드포인트 주소)
    const socket = new SockJS(
      `http://ec2-52-79-115-253.ap-northeast-2.compute.amazonaws.com:8888/ws/chat?token=${token}`
    ); // 파라미터로 JWT 토큰 주게 변경
    // 2) STOMP 클라이언트 생성, SockJS 연결 사용, (5초 후) 자동 재접속 설정
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });

    // 3) 연결 성공 시 호출되는 함수 (연결 완료 후)
    client.onConnect = () => {
      dispatch({ type: "CONNECT" });
      // 4) 특정 토픽(=채팅방) 구독, 서버가 보낸 메시지 받음
      client.subscribe(`/topic/chat/${roomId}`, (msg) => {
        try {
          const content = JSON.parse(msg.body); // msg.body = 서버에서 보낸 실제 메시지 JSON 문자열.
          const serverMessage = {
            sender: content.sender || "상대", // 백엔드가 sender 필드 보내면 그대로 사용, 없으면 상대
            role: content.role || "USER", // 메시지 보낸 사람의 userrole을 가져오고 기본값은 user
            text: content.content || content.text, // 백엔드에서 오는 형식 두 가지로 대응
            // ts: new Date().toISOString(), // 보낸 시간 설정
            ts: content.createdAt, // 보낸 시간 설정 *** 이렇거 해도 되나요..?????
            isRead: content.read ?? content.isRead ?? false, // 읽음 여부
          };
          dispatch({ type: "ADD_MESSAGE", payload: serverMessage });
          // 기존 메시지 리스트 뒤에 새 chat 객체 추가
          setTimeout(() => {
            listRef.current?.scrollTo({
              top: listRef.current.scrollHeight,
              behavior: "smooth",
            });
          }, 100); // 새 메시지 온 뒤 스크롤 부드럽게 이동
        } catch {
          // msg.body가 JSON 타입이 아닌 경우 - 전체 공지용인데 아직 기능 추가는 없습니다.
          dispatch({
            type: "ADD_MESSAGE",
            payload: {
              sender: "관리자",
              text: msg.body,
              ts: new Date().toISOString(),
            },
          });
        }
      });
    };

    // 5) STOMP 오류 발생 시 호출 (디버깅용)
    client.onStompError = (frame) => {
      console.error("❌ STOMP 에러:", frame);
      dispatch({ type: "SET_ERROR", payload: "채팅 서버 연결 실패" });
    };

    // 6) STOMP 클라이언트 활성화 (연결 시도 시작)
    client.activate();
    // 7) 컴포넌트 언마운트 시 연결 해제
    stompClient.current = client;
    return () => client.deactivate();
  }, [roomId, user, token, authLoading]);
  // ✅ STOMP 연결 끝

  // 사용자 할당 채팅 방 확인
  // 할당된 채팅 방이 없으면 채팅 방을 새로 생성한 후 고유 키 반환
  useEffect(() => {
    (async () => {
      if (!user) return;
      if (isAdmin) return;
      // ADMIN 이 접속하면 채팅을 보낸 USER의 채팅방으로 갑니다.
      // ADMIN 끼리는 서로 채팅을 보낼 수 없고, 할당된 채팅 방도 가질 수 없게 설정했습니다.
      try {
        const res = await api.post("/api/chat/hasroom", {
          withCredentials: true,
        });
        if (res.data.roomId) {
          navigate(`/contact/${res.data.roomId}`);
        }
      } catch (err) {
        console.error("채팅방 생성 실패:", err);
      }
    })();
  }, [user]);

  // 이전 채팅 기록 보기 ****************************
  const loadMessages = async () => {
    if (!roomId || !user) return;
    try {
      const res = await request(() => api.get(`/api/chat/${roomId}`));
      const chatMessages = res.map((c) => ({
        sender: c.username,
        role: c.userRole,
        text: c.content,
        ts: c.createdAt,
        isRead: c.isRead,
      }));
      // 이전 채팅 기록이 있는 경우 guideStep을 3으로 변경해서 input창을 활성화 시키기
      if (chatMessages.length > 0) {
        setGuideStep(3);
      }
      // 환영 메시지가 이미 있으면 중복 제거. some() : 하나라도 특정 조건을 만족하면 true를 반환
      // 관리자가 아니면 환영 메시지!
      if (userRole !== "ADMIN") {
        const hasWelcome = chatMessages.some((msg) => msg.type === "welcome");
        const listMessages = hasWelcome
          ? chatMessages
          : [welcomeMessage, ...chatMessages]; // 환영 메시지 앞에 넣기
        dispatch({
          type: "SET_MESSAGES",
          payload: listMessages,
        });
      } else {
        // 관리자의 경우 환영 메시지를 제외한 이전 모든 채팅 가져오기
        const listMessages = chatMessages;
        dispatch({
          type: "SET_MESSAGES",
          payload: listMessages,
        });
      }
    } catch (err) {
      console.error("이전 채팅 불러오기 실패:", err);
    }
  };
  useEffect(() => {
    loadMessages();
  }, [roomId, user, userRole]);

  // 안내 버튼 클릭 (선택 시 자동응답 send) - db에 저장하지 않을 예정 - 새로고침하면 내용 사라짐
  const handleMenuClick = (id) => {
    let reply = "";
    if (id === 1) {
      reply =
        "Gmail 연동을 원하시면 아이디와 이메일을 다음과 같이 보내주세요.\n[admin, admin@gmail.com]";
      setGuideStep(1);
    } else if (id === 2) {
      reply = "무엇이 궁금하신가요? 궁금증을 자유롭게 입력해주세요.";
      setGuideStep(2);
    }
    dispatch({
      type: "ADD_MESSAGE",
      payload: {
        sender: adminUsername,
        text: reply,
        type: "response",
        ts: new Date().toISOString(),
      },
    });
  };

  // 메시지 전송 함수 + 서버에 발행(Publish) + 자동응답에 맞는 답변 제공
  const send = () => {
    if (!state.text.trim() || !stompClient.current?.connected) return;
    const body = JSON.stringify({ content: state.text.trim() });
    stompClient.current.publish({
      destination: `/app/chat/${roomId}/send`,
      body,
    });
    dispatch({ type: "CLEAR_TEXT" });
  };

  // 유저 메시지 ADD 후 자동응답 보내기!
  useEffect(() => {
    // messages 배열에 변화가 있을 때마다 실행!
    if (state.messages.length === 0) return;

    const lastMsg = state.messages[state.messages.length - 1];
    // 마지막 메시지가 내(user) 메시지면 자동응답 보냄
    if (
      guideStep === 1 &&
      lastMsg.role === "USER" &&
      lastMsg.sender === userUsername
    ) {
      if (lastMsg.text.includes("@") && lastMsg.text.length > 6) {
        // 간단한 이메일 유효성 검증
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            sender: adminUsername,
            text: "답변을 잘 받았습니다! 24시간 내로 답변을 드릴게요.",
            type: "response",
            ts: new Date().toISOString(),
          },
        });
        setGuideStep(3);
      } else {
        dispatch({
          type: "ADD_MESSAGE",
          payload: {
            sender: adminUsername,
            text: "올바른 형식이 아닙니다. 아이디와 이메일을 예시처럼 입력해주세요.",
            type: "response",
            ts: new Date().toISOString(),
          },
        });
      }
    }
    if (
      guideStep === 2 &&
      lastMsg.role === "USER" &&
      lastMsg.sender === userUsername
    ) {
      dispatch({
        type: "ADD_MESSAGE",
        payload: {
          sender: adminUsername,
          text: "문의해주셔서 감사합니다! 빠르게 답변드릴게요.",
          type: "response",
          ts: new Date().toISOString(),
        },
      });
      setGuideStep(3); // 단계변경은 꼭!
    }
  }, [state.messages]);

  // 채팅 창의 마지막 메세지로 스크롤 자동 이동 기능
  useEffect(() => {
    if (endOfMessagesRef.current) {
      // 첫 진입 시에는 auto, 이후에는 smooth 스크롤
      endOfMessagesRef.current.scrollIntoView({
        behavior: state.messages.length > 0 ? "smooth" : "auto",
      });
    }
  }, [state.messages]);

  // 엔터키로도 메시지 전송될 수 있게 해주는 함수
  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  if (loading) return <div className="loading">불러오는 중…</div>;
  // if (!user) {return <div className="loading">로그인 후 사용해주세요</div>};

  return (
    <div className="chat-wrap">
      <div className="chat-card">
        <div className="chat-header">
          <div className="chat-title">문의하기</div>
        </div>

        {user && !state.connected && (
          <LoadingOverlay text="채팅창에 연결중입니다..." />
        )}
        {state.error && (
          <div
            style={{
              margin: "8px 0",
              color: "#b91c1c",
              border: "1px solid #f7cbcb",
              borderRadius: 10,
              padding: "8px 10px",
              fontWeight: 700,
            }}
          >
            {state.error}
          </div>
        )}

        {/* 메시지 찍어주기 */}
        <div className="chat-list" ref={listRef}>
          {state.messages.map((m, i) => {
            // const isMe = m.sender === user; // 내 메시지인지 *****************************
            const isMe =
              (isAdmin && m.sender === "admin") ||
              (userRole !== "ADMIN" && m.sender === user);

            const cls = ["chat-item"];
            if (isMe) cls.push("isMe");

            const hideTime = m.buttons && m.buttons.length > 0;

            return (
              <div key={i} className={cls.join(" ")}>
                <div className="bubble">
                  {/* 메시지 보낸 사람 표시*/}
                  <div className="sender">{m.sender}</div>
                  <div className="text">{m.text}</div>

                  {/* 자동응답용 버튼 */}
                  {m.buttons && m.buttons.length > 0 && (
                    <div className="bubble-btns">
                      {m.buttons.map((btn) => (
                        <button
                          key={btn.id}
                          onClick={() => handleMenuClick(btn.id)}
                          className="bubble-btn"
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                  {!hideTime && (
                    <div className="meta-row">
                      <div className="time">{formatToHHmm(m.ts)}</div>
                      {/* ✔ 카톡 스타일: 내 메시지에만 읽음 여부 표시
                    {isMe && (
                      <div className="read-state">
                        {m.isRead ? "읽음" : "안읽음"}
                      </div>
                    )} */}
                    </div>
                  )}
                  <div ref={endOfMessagesRef}></div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 입력창: 문의 선택 이후에만 보임 */}
        {guideStep !== 0 || isAdmin ? (
          <div className="chat-input-row">
            <textarea
              className="chat-input"
              rows={2}
              placeholder={
                state.connected ? "메시지를 입력하세요…" : "서버 연결 중입니다…"
              }
              value={state.text}
              onChange={(e) => {
                const text = e.target.value;

                if (text.length > 300) {
                  dispatch({
                    type: "SET_ERROR",
                    payload: "문의는 300자를 초과할 수 없습니다.",
                  });
                } else {
                  dispatch({ type: "SET_ERROR", payload: null });
                }
                dispatch({ type: "SET_TEXT", payload: text });
              }}
              onKeyDown={onKeyDown}
              disabled={!state.connected}
            />
            <button
              className="chat-send"
              onClick={send}
              disabled={
                !state.connected ||
                !state.text?.trim() ||
                state.text?.length > 300 // 300자 초과일 때 전송버튼 막음
              }
            >
              보내기
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Contact;
