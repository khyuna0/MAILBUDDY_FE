import { useContext } from "react";
import { BirthContext } from "../../context/BirthContext";
import {
  useScheduleDispatch,
  useScheduleState,
} from "../../context/ScheduleContext";

import { birthIcon, isBirth } from "../../utils/BirthUtil";
import { deleteSummary, deleteUserSchedule } from "../../api/ScheduleApi";
import { useRefresh } from "../../context/RefreshContext";
import "../../css/CalendarTile.css";

export default function CalendarTile({ dailyEvents, tileDate, view }) {
  const {} = useScheduleState();
  const dispatch = useScheduleDispatch();
  const birth = useContext(BirthContext);
  const { trigger } = useRefresh();

  if (view !== "month") return null;

  const onDelete = async (item) => {
    if (!window.confirm(`"${item.title}" 일정을 삭제하시겠습니까?`)) return;

    try {
      if (item.type === "local") await deleteUserSchedule(item.id);
      else if (item.type === "summary") await deleteSummary(item.id);
      alert("삭제 완료");
      trigger();
    } catch {
      alert("삭제 실패");
    }
  };

  const summaryCount = dailyEvents?.filter(
    (ev) => ev.type === "summary"
  )?.length;

  const localCount = dailyEvents?.filter((ev) => ev.type === "local")?.length;

  // 미리보기는 상위 2개만
  const previewEvents = dailyEvents?.slice(0, 3);
  const more = dailyEvents?.slice(3).length;

  return (
    <div className="tile-wrap">
      {/* 생일 아이콘 */}
      {isBirth(tileDate, birth) && (
        <div className="tile-birth-icon">{birthIcon()}</div>
      )}
      <div className="tile-more">{more ? `+${more}` : null}</div>
      {/* 일정 미리보기 (2개만) */}
      <div className="tile-events">
        {previewEvents?.map((ev) => (
          <div
            key={`${ev.type}-${ev.id}`}
            className={`tile-event-item ${
              ev.type === "summary" ? "event-summary" : "event-local"
            }`}
            onContextMenu={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(ev);
            }}
          >
            {ev.title}
          </div>
        ))}
      </div>

      {/* 우측 상단 일정 개수 배지 */}
      <div className="tile-badges">
        {summaryCount > 0 && (
          <span className="badge badge-summary">{summaryCount}</span>
        )}
        {localCount > 0 && (
          <span className="badge badge-local">{localCount}</span>
        )}
      </div>

      {/* 타일에 찍힌 일정 외의 n개의 일정 개수 표시 */}
    </div>
  );
}
