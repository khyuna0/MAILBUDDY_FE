import React, { useEffect } from "react";

const KakaoMap = ({ latitude, longitude }) => {
  useEffect(() => {
    const script = document.createElement("script");
    // (//) 사용하는 이유 : http, https 환경에 따라 자동으로 해당 프로토콜을 따라가게
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=&libraries=services&autoload=false`;
    script.async = true;
    document.head.appendChild(script);

    // 스크립트가 다 로딩되고 실행 완료되면 호출되는 함수
    script.onload = () => {
      window.kakao.maps.load(() => {
        const kakao = window.kakao;
        const container = document.getElementById("map");
        const options = {
          // 지도를 생성할 때 필요한 기본 옵션 (center : 지도의 중심좌표, level : 지도의 레벨)
          center: new kakao.maps.LatLng(latitude, longitude),
          level: 3,
        };
        const map = new kakao.maps.Map(container, options); // 지도 생성 및 객체 리턴

        const marker = new kakao.maps.Marker({
          position: new kakao.maps.LatLng(latitude, longitude),
        });
        marker.setMap(map);
      });
    };
  }, [latitude, longitude]);

  return <div id="map" style={{ width: "500px", height: "400px" }}></div>;
};

export default KakaoMap;
