import { useContext, useEffect, useState } from "react";
import "../../css/CalendarDetail.css";
import { getWeatherIconByPlace } from "../../utils/WeatherUtil";
import {
  useScheduleDispatch,
  useScheduleState,
} from "../../context/ScheduleContext";
import useApi from "../../hooks/useApi";
import MapRenderer from "../MapRenderer";
import { formatToHHmm } from "../../utils/DateTimeUtils";
import { UserContext } from "../../context/UserContext";

const CalendarDetail = () => {
  const { selectedItem } = useScheduleState();
  const dispatch = useScheduleDispatch();
  const { error } = useApi();

  const [weather, setWeather] = useState(null);
  const [rainAdvice, setRainAdvice] = useState("");
  const [showMap, setShowMap] = useState(false);
  const { user } = useContext(UserContext);

  const onEdit = (item) => {
    dispatch({ type: "SET_ISEDIT", payload: true });
    dispatch({ type: "SET_SELECTED_ITEM", payload: item });
  };

  const loadWeather = async () => {
    try {
      const { icon, rain } = await getWeatherIconByPlace(
        selectedItem.place,
        selectedItem.eventDate,
        selectedItem.eventTime
      );
      setWeather(icon);
      setRainAdvice(rain);
    } catch {
      setWeather("");
      setRainAdvice(false);
    }
  };

  useEffect(() => {
    if (selectedItem) {
      loadWeather();
      setShowMap(false); // 상세 보기 이동 시 지도는 다시 닫힌 상태로
    }
  }, [selectedItem]);

  return (
    <section className="detail-form">
      {/* 상단 날씨 */}
      <div className="detail-top">
        <div className="detail-weather">
          {selectedItem?.place && weather && (
            <>
              <span>이 시간의 날씨 {weather}</span>
              {/* {rainAdvice && <span>☂️ 우산 챙기세요!</span>} */}
            </>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="detail-view">
        {selectedItem ? (
          <div className="detail-field">
            {/* 제목 */}
            <span className="detail-label">제목</span>
            <div className="detail-box">{selectedItem.title || ""}</div>

            {/* 날짜 */}
            <span className="detail-label">날짜</span>
            <div className="detail-datechip">
              {selectedItem.eventDate || ""}
            </div>

            {/* 시간 */}
            <span className="detail-label">시간</span>
            <div className="detail-time">
              {formatToHHmm(selectedItem.eventTime) || ""}
            </div>

            {/* 내용 — 있을 때만 */}
            {selectedItem.notes && (
              <>
                <span className="detail-label">내용</span>
                <div className="detail-notes">{selectedItem.notes}</div>
              </>
            )}

            {/* 장소 — 있을 때만 */}
            {selectedItem.place && (
              <>
                <span className="detail-label">장소</span>
                <div className="detail-box">{selectedItem.place}</div>

                {/* 지도 토글 */}
                <button
                  className="detail-map-toggle"
                  onClick={() => setShowMap((prev) => !prev)}
                >
                  {showMap ? "지도 닫기 ▲" : "지도 보기 ▼"}
                </button>

                {/* 지도 영역 — 슬라이드 애니메이션 */}
                <div className={`detail-map-wrapper ${showMap ? "open" : ""}`}>
                  {showMap && (
                    <MapRenderer
                      place={selectedItem.place}
                      className="detail-map"
                    />
                  )}
                </div>
              </>
            )}

            {/* 수정 버튼 */}
            <button
              className="detail-edit-btn"
              onClick={() => onEdit(selectedItem)}
            >
              수정하기
            </button>
          </div>
        ) : (
          <div className="detail-empty">
            {user ? "일정이 없습니다." : "로그인 하고 일정을 추가해 보세요!"}
          </div>
        )}

        {error && <div className="detail-error">{error}</div>}
      </div>
    </section>
  );
};

export default CalendarDetail;
