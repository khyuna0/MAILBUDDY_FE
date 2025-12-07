/**
 * Kakao Maps 스크립트를 동적으로 로드하는 함수
 * 이미 로드된 경우 바로 resolve
 */
export function loadKakaoSdk() {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve();
      return;
    }

    const script = document.createElement("script");
    script.src =
      "//dapi.kakao.com/v2/maps/sdk.js?appkey=&libraries=services&autoload=false";
    script.onload = () => resolve();
    script.onerror = () => reject("Kakao SDK 로딩 실패");

    document.head.appendChild(script);
  });
}

/**
 * 주소 → 좌표 변환 유틸
 * - 주소 검색 실패 시 키워드 검색으로 fallback
 * - 성공 시 {lat, lon} 반환
 */
export async function getCoordsByAddress(address) {
  await loadKakaoSdk();

  return new Promise((resolve, reject) => {
    const geocoder = new window.kakao.maps.services.Geocoder();
    const ps = new window.kakao.maps.services.Places();

    // 1️⃣ 주소 검색
    geocoder.addressSearch(address, (result, status) => {
      if (status === window.kakao.maps.services.Status.OK && result.length > 0) {
        const lat = parseFloat(result[0].y);
        const lon = parseFloat(result[0].x);
        resolve({ lat, lon });
        return;
      }

      // 2️⃣ 주소 실패 → 키워드 검색
      ps.keywordSearch(address, (places, status2) => {
        if (status2 === window.kakao.maps.services.Status.OK && places.length > 0) {
          const lat = parseFloat(places[0].y);
          const lon = parseFloat(places[0].x);
          resolve({ lat, lon });
        } else {
          reject("위치를 찾을 수 없습니다.");
        }
      });
    });
  });
}
