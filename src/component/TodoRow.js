import React, { useEffect, useRef, useState } from "react";

// Todo -> 할일 하나 관련 (체크박스, 텍스트, 수정, 삭제)
export default function TodoRow({
  item,
  onEdit,
  onRemove,
  onToggle,
  disabled,
}) {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState(item.text);
  const ref = useRef(null);

  // 수정관련
  useEffect(() => {
    if (editing) ref.current?.focus(); //input DOM에 커서
  }, [editing]); // editing값 바뀔때 마다

  const commit = () => {
    if (disabled) return setEditing(false); // 로그인 안된 상태에서 쓰지 못하게 처리
    const trimmed = (val ?? "").trim(); //val이 null이거나 undefined면 빈문자
    if (trimmed && trimmed !== item.text) onEdit(item.id, trimmed); // 비어있지 않고, 기존내용과 다를때 onEdit호출
    setEditing(false);
  };

  return (
    <li className={`todo-row ${item.done ? "done" : ""}`}>
      <input
        type="checkbox"
        className="todo-check"
        checked={!!item.done} // !! : boolean으로 바꾸기
        onChange={onToggle}
        disabled={disabled} // 컴포넌트가 비활성이면 체크박스 비활성화
        title={disabled ? "로그인 후 체크 가능" : "완료/취소"} // 마우스 올렸을때 -> 비로그인:로그인
      />

      {editing ? (
        <input
          ref={ref} // input DOM -> ref.current연결 -> useEffect에서 focus() 호출
          className="todo-edit"
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onBlur={commit} //blur(포커스 빠져나가면) -> commit()호출 -> 편집끝내기
          onKeyDown={(e) => e.key === "Enter" && commit()}
          disabled={disabled}
        />
      ) : (
        <span
          className={`todo-text ${disabled ? "disabled" : ""}`}
          onDoubleClick={() => !disabled && setEditing(true)} // disabled(비로그인) 아니면 editing
          title={disabled ? "로그인 후 편집 가능" : "더블클릭으로 편집"}
        >
          {item.text}
        </span>
      )}

      <div className="todo-actions">
        {!editing && (
          <button
            className="icon-btn"
            onClick={() => !disabled && setEditing(true)}
            disabled={disabled}
          >
            ✏️
          </button>
        )}
        <button className="icon-btn" onClick={onRemove} disabled={disabled}>
          🗑️
        </button>
      </div>
    </li>
  );
}
