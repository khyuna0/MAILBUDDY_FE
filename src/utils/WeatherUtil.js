import api from "../api/axiosConfig";
import { getCoordsByAddress } from "./MapUtil";

// 날씨 코드 → 아이콘 매핑
export const weatherIcons = {
  0: "☀️",
  1: "🌤️",
  2: "⛅",
  3: "☁️",
  45: "🌫️",
  48: "🌫️",
  51: "🌦️",
  61: "🌧️",
  63: "🌧️",
  65: "🌧️",
  71: "❄️",
  73: "❄️",
  75: "❄️",
  80: "🌦️",
  81: "🌧️",
  82: "🌧️",
  95: "⛈️",
  99: "🌩️",
};

// 기본 지역 날씨 아이콘 가져오기 (lat, lon 없을 때 서울 기준)

export async function getWeatherIcon(date, lat = 37.55, lon = 127.0) {
  if (!date) return null;

  try {
    const res = await api.get("/api/weather", {
      params: { lat, lon, date },
    });

    const code =
      res.data?.current?.weathercode ?? res.data?.daily?.weathercode?.[0] ?? 0;

    const icon = weatherIcons[code] || null;
    return icon || null;
  } catch {
    return null;
  }
}

// 주소(place) 기반 eventTime 날씨 가져오기
export async function getWeatherIconByPlace(place, date, time) {
  if (!place || !date) return { icon: null, rain: false };

  try {
    // 1) 주소 → 좌표 변환
    const { lat, lon } = await getCoordsByAddress(place);

    // 2) ISO 시간 조합
    const isoTime = `${date}T${time}:00`;

    // 3) 백엔드 호출
    const res = await api.get("/api/weather/eventTime", {
      params: { lat, lon, time: isoTime },
    });

    const code =
      res.data?.weathercode ??
      res.data?.current?.weathercode ??
      res.data?.daily?.weathercode?.[0] ??
      0;

    const icon = weatherIcons[code] || null;
    const isRain = [51, 61, 63, 65, 80, 81, 82, 95, 99].includes(code);

    return { icon, rain: isRain };
  } catch (e) {
    return { icon: null, rain: false };
  }
}
