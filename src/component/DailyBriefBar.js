import { useEffect, useMemo, useState } from "react";
import "../css/DailyBriefBar.css";
import api from "../api/axiosConfig";
import { useScheduleState } from "../context/ScheduleContext";
import { formatToYM, formatToYMD } from "../utils/DateTimeUtils";
import { getWeatherIconByPlace } from "../utils/WeatherUtil";

export default function DailyBriefBar() {
  const { sortedMonthlyEvents, selectedDate, activeStartDate } =
    useScheduleState();

  // 오늘 날짜 문자열 (YYYY-MM-DD)
  const todayStr = useMemo(() => formatToYMD(new Date()), []);

  const [brief, setBrief] = useState(null); // 오늘 요약
  const [loading, setLoading] = useState(false); // 요약 API 로딩
  const [weather, setWeather] = useState({ icon: null, rain: false }); // 날씨
  const [todayFingerprint, setTodayFingerprint] = useState(null); // 오늘 일정 지문

  // 달력이 오늘이 포함된 달인지
  const isTodayMonthVisible = useMemo(() => {
    if (!activeStartDate) return false;
    return formatToYMD(activeStartDate).slice(0, 7) === todayStr.slice(0, 7); // YYYY-MM
  }, [activeStartDate, todayStr]);

  // 선택한 날짜가 오늘인지
  const isTodaySelected = useMemo(() => {
    if (!selectedDate) return false;
    if (!isTodayMonthVisible) return false;
    return formatToYMD(selectedDate) === todayStr;
  }, [selectedDate, todayStr, isTodayMonthVisible]);

  // 오늘 날짜에 해당하는 모든 일정
  const todaysEvents = useMemo(() => {
    if (!Array.isArray(sortedMonthlyEvents)) return [];
    return sortedMonthlyEvents.filter((ev) => ev.eventDate === todayStr);
  }, [sortedMonthlyEvents, todayStr]);

  // 오늘 + 장소가 있는 대표 일정 1개
  const mainEvent = useMemo(() => {
    return todaysEvents.find((ev) => ev.place) || null;
  }, [todaysEvents]);

  // 오늘 일정 → fingerprint 생성
  useEffect(() => {
    // 다른 날짜를 보고 있을 땐 fingerprint 그대로 유지 (오늘 브리핑 유지 목적)
    if (!isTodaySelected) return;

    // 오늘 일정이 하나도 없으면 fingerprint 비우기
    if (todaysEvents.length === 0) {
      setTodayFingerprint(null);
      return;
    }
    const fingerprint = todaysEvents
      .map((ev) => {
        const key = ev.id ?? "";
        const time = ev.eventTime ?? "";
        const title = ev.title ?? "";
        const place = ev.place ?? "";
        // "id|날짜|시간|제목|장소"
        return `${key}|${ev.eventDate}|${time}|${title}|${place}`;
      })
      .sort() // 순서가 달라도 같은 fingerprint
      .join(";");

    setTodayFingerprint(fingerprint);
  }, [isTodaySelected, todaysEvents]);

  // fingerprint + localStorage 기반 오늘 브리핑 API
  useEffect(() => {
    const cacheKey = `mb-brief-${todayStr}`;
    // 오늘 일정이 없으면 브리핑도 없음
    if (!todayFingerprint) {
      setBrief(null);
      setLoading(false);
      return;
    }
    // 캐시 확인
    try {
      const cachedStr = localStorage.getItem(cacheKey);
      if (cachedStr) {
        const cached = JSON.parse(cachedStr);
        if (cached.fingerprint === todayFingerprint && cached.brief) {
          setBrief(cached.brief);
          return;
        }
      }
    } catch (e) {
      console.error("Daily brief 캐시 파싱 실패", e);
    }

    const fetchBrief = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/brief/day", {
          params: { day: todayStr },
        });

        if (res.data && res.data.hasEvents) {
          setBrief(res.data);
          localStorage.setItem(
            cacheKey,
            JSON.stringify({
              fingerprint: todayFingerprint,
              brief: res.data,
            })
          );
        }
      } catch (e) {
        console.error("Daily brief 호출 실패", e);
        setBrief(null);
      } finally {
        setLoading(false);
      }
    };
    fetchBrief();
  }, [todayStr, todayFingerprint]);

  // 대표 일정 기준 날씨
  useEffect(() => {
    // 오늘 날짜를 보고 있을 때만 새로 호출
    if (!isTodaySelected) return;

    // 대표 일정이 없으면 날씨 초기화
    if (!mainEvent) {
      setWeather({ icon: null, rain: false });
      return;
    }

    const fetchWeather = async () => {
      try {
        const result = await getWeatherIconByPlace(
          mainEvent.place,
          mainEvent.eventDate || todayStr,
          mainEvent.eventTime
        );
        setWeather(result); // { icon, rain }
      } catch (e) {
        console.error("날씨 정보 조회 실패", e);
        setWeather({ icon: null, rain: false });
      }
    };
    fetchWeather();
  }, [mainEvent, isTodaySelected, todayStr]);

  // 브리핑이 없으면 컴포넌트 자체를 숨김
  if (!brief || !brief.hasEvents) return null;

  const iconToShow = weather.icon || "🗓️";

  return (
    <div className={`mb-brief-bar mb-brief-mood-`}>
      <div className="mb-brief-icon">{iconToShow}</div>

      <div className="mb-brief-text-wrap">
        <div className="mb-brief-main">{brief.mainLine}</div>
        {brief.subLine && <div className="mb-brief-sub">{brief.subLine}</div>}
      </div>

      {loading && <div className="mb-brief-loading">...</div>}
    </div>
  );
}
