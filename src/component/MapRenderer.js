import { useState, useEffect } from "react";
import KakaoMap from "./KaKaoMap";
import { getCoordsByAddress } from "../utils/MapUtil";
import useApi from "../hooks/useApi";

const MapRenderer = ({ place }) => {
  const [coords, setCoords] = useState(null);
  const { error, loading, request, setError } = useApi();

  useEffect(() => {
    if (!place) return;
    getCoordsByAddress(place)
      .then(({ lat, lon }) => {
        setCoords({ lat, lon });
        setError(null);
      })
      .catch(() => {
        setCoords(null);
        setError("위치 정보를 찾을 수 없습니다.");
      });
  }, [place]);

  if (!place) return <div>장소 정보 없음</div>;
  if (error) return <div>{error}</div>;
  if (!coords) return <div>지도 로딩 중...</div>;

  return (
    <div className="map-box">
      <KakaoMap latitude={coords.lat} longitude={coords.lon} />
    </div>
  );
};

export default MapRenderer;
