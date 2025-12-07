import { useContext, useEffect, useMemo, useState } from "react";
import "react-calendar/dist/Calendar.css";
import "../css/Schedule.css";
import { BirthContext } from "../context/BirthContext";
import { UserContext } from "../context/UserContext";
import { useNavigate, useSearchParams } from "react-router-dom";
import Todo from "../component/Todo";
import CalendarContainer from "../component/calendar/CalendarContainer";
import Memo from "./../component/Memo";
import { formatToYM } from "../utils/DateTimeUtils";
import { ScheduleProvider } from "../context/ScheduleContext";
import useApi from "../hooks/useApi";
import DailyBriefBar from "../component/DailyBriefBar";

// Schedule(일정 Pages) : CalendarContainer(달력), Todo(투두)
// CalendarContainer(달력 Component)
// : CalendarNav (상단) + Memo(날짜 없는 ai 요약 메일 모음)
// + CalendarDetail (일정 상세보기) + CalendarWrite (일정 추가) ....

function Schedule() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [writeFormOpen, setWriteFormOpen] = useState(false);

  const birth = useContext(BirthContext);
  const { googleLinked, user } = useContext(UserContext);
  const navigate = useNavigate();
  const { error, loading, request, setError } = useApi();

  // 일단 userKey -> 나중에 다른거 가져와서 사용할 수 있으면 변경하기
  const userKey = useMemo(() => {
    if (typeof user === "string" && user.trim().length > 0) return user.trim();
    const candidates = [user?.username];
    return (
      candidates.find((v) => typeof v === "string" && v.trim().length > 0) || ""
    );
  }, [user]);

  const [SearchParams] = useSearchParams();

  const homeNav = SearchParams.get("homeNav");
  const formOpen = SearchParams.get("formOpen"); // 홈에서 일정 관리 눌렀을 때, 바로 글쓰기 팝업 뜨게
  useEffect(() => {
    if (formOpen) setWriteFormOpen(true);
    navigate("/schedule", { replace: true });
  }, [formOpen, navigate]);

  useEffect(() => {
    if (homeNav && (!user || !googleLinked)) {
      alert("메일 자동 추출 기능은 구글 로그인 후 이용 가능합니다!");
    }
    navigate("/schedule", { replace: true });
  }, [homeNav, navigate, user, googleLinked]);

  return (
    <ScheduleProvider key={user}>
      <div className="calpage-wrap">
        <div className="cal-layout">
          {/* 왼쪽: 캘린더 카드 영역 */}
          <div className="cal-left-column">
            <div className="cal-card cal-left-card">
              {/* ✨ 캘린더 카드 상단 오른쪽 브리핑 바 */}
              <div className="cal-brief-row">
                <DailyBriefBar />
              </div>

              {/* 실제 캘린더 */}
              <CalendarContainer
                writeFormOpen={writeFormOpen}
                setWriteFormOpen={setWriteFormOpen}
              />
            </div>
          </div>

          {/* 오른쪽: Todo + Memo */}
          <div className="cal-right-column">
            <div className="cal-card cal-right-card">
              <Todo eventDate={formatToYM(selectedDate)} userKey={userKey} />
            </div>
            <div className="cal-card cal-right-card">
              <Memo />
            </div>
          </div>
        </div>
      </div>
    </ScheduleProvider>
  );
}

export default Schedule;
