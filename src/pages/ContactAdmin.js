import { useContext, useEffect, useState } from "react";
import api from "../api/axiosConfig";
import { useNavigate } from "react-router-dom";
import "../css/ContactAdmin.css";
import { UserContext } from "../context/UserContext";
import useApi from "../hooks/useApi";

function ContactAdmin() {
  // UserRole 이 ADMIN 인 유저만 들어올 수 있는 페이지임
  const [rooms, setRooms] = useState([]);
  // const [loading, setLoading] = useState(true);
  const { loading, request } = useApi();
  const navigate = useNavigate();
  const { user, userRole } = useContext(UserContext);

  useEffect(() => {
    if (user === null) return;
    if (userRole !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
      return;
    }
    loadChatRooms();
  }, [user, userRole]);

  // USER 가 보낸 전체 채팅방 리스트 조회
  const loadChatRooms = async () => {
    try {
      const res = await api.get("/api/admin/chat");
      console.log("관리자모든채팅방조회", res.data);
      setRooms(res.data);
    } catch (err) {
      console.error("채팅방 불러오기 실패:", err);
    }
  };

  // 유저의 채팅 방 지우기 - 지우면 그 방의 채팅 기록도 다 같이 지워집니다.
  const deleteRoom = async (roomId) => {
    if (!window.confirm("정말 채팅을 삭제하시겠습니까?")) return;
    try {
      await api.delete(`/api/admin/chat/${roomId}`, {
        withCredentials: true,
      });
      await loadChatRooms();
    } catch (err) {
      console.error("채팅방 삭제 실패 : ", err);
    } finally {
      navigate("/contact_admin");
    }
  };

  if (loading) return <div className="chatlist-wrap">불러오는 중...</div>;

  return (
    <div className="chatlist-wrap">
      <h2 className="chatlist-title">전체 문의 리스트</h2>
      <div className="chatlist-container">
        {rooms.length === 0 && <div className="chatlist-empty">아직 생성된 채팅방이 없습니다.</div>}

        {rooms.map((room) => (
          <div
            key={room.id}
            className="chatlist-item"
            onClick={() => navigate(`/contact/${room.id}`)} // ✅ 여기서 roomId 전달
          >
            <div className="chatlist-user">{room.username}</div>
            <div className="chatlist-msg">{room.lastMessage || "메시지 없음"}</div>
            <button
              className="chat-delete"
              onClick={(e) => {
                e.stopPropagation(); // 클릭 이벤트 부모로 전달 막기 **********
                deleteRoom(room.id);
              }}
            >
              채팅 방 삭제
            </button>
            <div className="chatlist-date">
              {room.updatedAt
                ? room.updatedAt.slice(0, 16).replace("T", " ")
                : room.createdAt?.slice(0, 16).replace("T", " ")}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContactAdmin;
