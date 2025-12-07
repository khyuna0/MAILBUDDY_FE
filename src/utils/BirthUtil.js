import Confetti from "react-confetti";

export function isBirth(date, birth) {
  //생일인지 비교
  if (date?.slice(5, 10) === birth?.slice(5, 10)) return true;
  return false;
}

// 아이콘 출력
export function birthIcon() {
  return (
    <div
      style={{
        position: "relative",
        top: 4,
        left: 4,
        fontSize: "1rem",
      }}
    >
      🎂
    </div>
  );
}

// 컨페티
export function birthConfetti() {
  return (
    <Confetti
      width={window.innerWidth}
      height={window.innerHeight}
      numberOfPieces={180}
      gravity={0.4}
      recycle={false}
    />
  );
}
