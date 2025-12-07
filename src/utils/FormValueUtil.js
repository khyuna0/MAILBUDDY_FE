export function cleanFormValue(formValue) {
  // FormValue의 값를 검증하는 유틸
  // 수정 시 - 장소, 내용 값을 지워 저장했을 때, 원래 있던 값이 저장되는 오류를 수정하기 위함.
  // handleChange의 기본 trim() 도 여기서 처리 (마이페이지 오류 같은 현상이었음...)

  let cleanErr = "";
  const notes = formValue.notes ?? "";
  const place = formValue.place ?? "";
  const title = formValue.title ?? "";
  const eventDate = formValue.eventDate ?? "";
  const eventTime = formValue.eventTime ?? "";

  if (!title.trim()) {
    return (cleanErr = "제목을 입력해 주세요");
  }

  if (!eventTime.trim()) {
    return (cleanErr = "시간을 입력해 주세요");
  }

  if (!eventDate.trim()) {
    return (cleanErr = "날짜를 입력해 주세요");
  }

  // 문자열 정리(스페이스만 있는 경우 → "")
  const cleaned = {
    ...formValue,
    notes: notes.trim() === "" ? null : formValue.notes.trim(),
    place: place.trim() === "" ? null : formValue.place.trim(),
  };

  return { cleaned, cleanErr };
}
