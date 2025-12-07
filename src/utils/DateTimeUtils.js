// yyyy-mm-dd
export const formatToYMD = (val) => {
  if (val instanceof Date) {
    const y = val.getFullYear();
    const m = String(val.getMonth() + 1).padStart(2, "0");
    const d = String(val.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }
  if (typeof val === "string") return val.slice(0, 10);
  return "";
};

// yyyy-mm
export const formatToYM = (d) => {
  const dd = d ? new Date(d) : new Date();
  if (Number.isNaN(dd.getTime())) return "";

  const y = dd.getFullYear();
  const m = String(dd.getMonth() + 1).padStart(2, "0");

  return `${y}-${m}`;
};

// HH:mm
export const formatToHHmm = (input) => {
  if (!input) return "00:00";
  // "HH:MM:SS" 형태일 경우 앞의 "HH:MM" 추출
  const simpleMatch = input.match(/^(\d{2}:\d{2})/);
  if (simpleMatch) return simpleMatch[1];
  // 복잡한 경우 Date 객체로 변환 후 시간, 분 추출
  try {
    const d = new Date(input.includes("T") ? input : input.replace(" ", "T"));
    if (isNaN(d.getTime())) return "";
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    return `${hh}:${mm}`;
  } catch {
    return "";
  }
};

// YYYY년 MM월 DD일 (요일)
export const formatDateKorean = (ymd) => {
  if (!ymd) return "";

  // ymd가 Date 객체면 문자열로 변환 (처음에 들어가면 selectedDate, currentDate가 date 객체여서...)
  const str = typeof ymd === "string" ? ymd : formatToYMD(ymd);

  const [y, m, d] = str.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = ["일", "월", "화", "수", "목", "금", "토"][dt.getDay()];
  return `${y}년 ${m}월 ${d}일 (${wd})`;
};
