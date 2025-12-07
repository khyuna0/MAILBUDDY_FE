import "../css/Schedule.css";

export default function LoadingOverlay({
  text = "AI가 메일을 요약중입니다...",
}) {
  return (
    <div className="mb-calendar-overlay">
      <div className="mb-calendar-overlay-box">
        <div className="mb-calendar-overlay-spinner" />
        <p className="mb-calendar-overlay-text">{text}</p>
      </div>
    </div>
  );
}
