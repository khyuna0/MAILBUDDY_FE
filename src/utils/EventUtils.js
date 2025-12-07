// 일정 가져와서 시간이 이른 순서대로 정렬해주는 함수
export const splitAndSortEvents = (eventsA, eventsB = [], prefix = "Events") => {
  const allEvents = [...eventsA, ...eventsB];

  // eventdate, eventtime 모두 있는 경우 (달력용)
  const withDateTime = [];
  // eventdate, eventtime 하나만 있는 경우 (memo용)
  const withoutDateTime = [];

  allEvents.forEach((event) => {
    if (event.eventDate && event.eventTime) {
      withDateTime.push(event);
    } else if (!event.event_date || !event.event_time) {
      withoutDateTime.push(event);
    }
  });

  withDateTime.sort((a, b) => {
    const dateTimeA = new Date(`${a.eventDate}T${a.eventTime}`);
    const dateTimeB = new Date(`${b.eventDate}T${b.eventTime}`);
    return dateTimeA - dateTimeB;
  });

  // 결과 객체로 넘기기
  return {
    [`sorted${prefix}`]: withDateTime,
    [`unsorted${prefix}`]: withoutDateTime,
  };
};
