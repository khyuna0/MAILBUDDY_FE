import React, { useEffect, useRef, useState } from "react";
import api from "../api/axiosConfig";
import "../css/Todo.css";
import TodoRow from "./TodoRow";
import { useScheduleState } from "../context/ScheduleContext";
import { formatToYM } from "../utils/DateTimeUtils";
import useApi from "../hooks/useApi";

// const getMsg = (e, fallback) =>
//   e?.response?.data?.message || e?.message || fallback;

export default function Todo({ userKey }) {
  const [list, setList] = useState([]);
  const [text, setText] = useState("");
  const [authMsg, setAuthMsg] = useState(""); // 401 안내 배너

  const { error, loading, request, setError } = useApi();

  const inputRef = useRef(null);
  const disabled = !userKey; // userKey 없으면 비로그인 취급

  const { activeStartDate } = useScheduleState();
  const ymKey = formatToYM(activeStartDate); // yyyy-mm 으로 가져오기

  // 401 공통 처리
  const handleAuthError = (err, fallbackMsg) => {
    if (err?.response?.status === 401) {
      setAuthMsg(err.response.data?.message || fallbackMsg);
      setError(null); // 일반 에러 메시지는 지움
      return true; // 401 처리했다는 뜻
    }
    return false;
  };

  // 추가,수정,삭제시 공통으로 쓰기
  const safeRequest = async (apiCall, authFallbackMsg) => {
    try {
      const data = await request(apiCall); // useApi.request 사용
      return data;
    } catch (err) {
      // 401이면 배너에만 표시
      if (handleAuthError(err, authFallbackMsg)) {
        return;
      }
      // 401이 아닌 에러는 useApi가 error에 메시지를 넣어 둠
      throw err;
    }
  };

  // 목록 로드
  const load = async () => {
    if (!ymKey) return setList([]);

    if (!userKey) {
      setList([]);
      setError(null);
      return;
    }

    try {
      const data = await safeRequest(
        () =>
          api.get("/api/todo", {
            params: { ym: ymKey },
            withCredentials: true,
          }),
        "로그인이 필요합니다."
      );
      if (data) {
        setList(Array.isArray(data) ? data : []);
        setAuthMsg("");
      }
    } catch (err) {
      setList([]);
    }
  };

  useEffect(() => {
    setText("");
    setList([]);
    setError(null);
    setAuthMsg("");

    if (userKey) {
      load();
    }
  }, [ymKey, userKey]);

  // 할 일 추가
  const add = async () => {
    if (disabled) return;
    const t = text.trim();
    if (!t) return;

    try {
      await safeRequest(
        () => api.post("/api/todo", { ym: ymKey, text: t }, { withCredentials: true }),
        "로그인이 필요합니다."
      );
      setText("");
      inputRef.current?.focus();
      await load();
    } catch (err) {
      // 401이 아닌 에러는 error state로 이미 들어가 있음
    }
  };

  // 완료 체크 토글
  const toggleDone = async (id, cur) => {
    if (disabled) return;

    try {
      await safeRequest(
        () => api.patch(`/api/todo/${id}`, { done: !cur }, { withCredentials: true }),
        "로그인이 필요합니다."
      );
      await load();
    } catch (err) {}
  };

  // 수정
  const edit = async (id, newText) => {
    if (disabled) return;
    const t = (newText ?? "").trim();
    if (!t) return;

    try {
      await safeRequest(
        () => api.patch(`/api/todo/${id}`, { text: t }, { withCredentials: true }),
        "로그인이 필요합니다."
      );
      await load();
    } catch (err) {}
  };

  // 삭제
  const remove = async (id) => {
    if (disabled) return;

    try {
      await safeRequest(() => api.delete(`/api/todo/${id}`, { withCredentials: true }), "로그인이 필요합니다.");
      await load();
    } catch (err) {}
  };

  // 완료 목록 모두 삭제
  const clearCompleted = async () => {
    if (disabled) return;

    try {
      await safeRequest(
        () =>
          api.delete("/api/todo/completed", {
            params: { ym: ymKey },
            withCredentials: true,
          }),
        "로그인이 필요합니다."
      );
      await load();
    } catch (err) {}
  };

  const doneCount = list.filter((it) => it.done).length;

  return (
    <div className="todo-card">
      <div className="todo-head">
        <div className="todo-title">📝 To-Do</div>
        <div className="todo-date">{ymKey}</div>
      </div>

      {authMsg && <div className="todo-banner">{authMsg}</div>}

      <div className="todo-input-block">
        <input
          ref={inputRef}
          className="todo-input"
          placeholder={disabled ? "로그인 후 입력 가능" : "할 일 입력후 Enter"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          disabled={disabled || loading} // loading은 useApi에서
        />
        <div className="todo-button-row">
          <button className="todo-btn primary" onClick={add} disabled={disabled || loading}>
            {loading ? "처리 중..." : "추가"}
          </button>
          <button
            className="todo-btn ghost"
            onClick={clearCompleted}
            disabled={disabled || doneCount === 0 || loading}
            title={doneCount ? `완료 ${doneCount}개 삭제` : "완료 항목 없음"}
          >
            완료삭제
          </button>
        </div>
      </div>

      {error && <div className="todo-error">{error}</div>}

      <ul className="todo-list">
        {list.length === 0 && <li className="todo-empty">{loading ? "불러오는 중..." : "할 일이 없어요."}</li>}
        {list.map((it) => (
          <TodoRow
            key={it.id}
            item={it}
            onEdit={edit}
            onRemove={() => remove(it.id)}
            onToggle={() => toggleDone(it.id, it.done)}
            disabled={disabled || loading}
          />
        ))}
      </ul>
    </div>
  );
}
