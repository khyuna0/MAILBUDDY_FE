import React from "react";
import "../css/ErrorPage.css";
import { useNavigate, useSearchParams } from "react-router-dom";
//useSearchParams -> URL쿼리스트링(?status=400&message=...)에서 값을 읽어오기 위해 사용

const ErrorPage = ({
  statusCode: propStatusCode,
  message: propMessage,
} = {}) => {
  // props가 아예 안 넘어오는 경우도 허용 -> ={} : 기본값이 빈 객체 -> props없이 호출해도 에러나지 않게
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // URL 쿼리에서 값 읽기
  const queryStatus = searchParams.get("status");
  const queryMessage = searchParams.get("message");
  // 백엔드에서 리다이렉트 -> response.sendRedirect("http://localhost:3000/error?status=400&message=" + encodedMsg);
  // queryString -> 문자열 400 ,queryMessage → "이미 다른 계정(...)에 연동된 구글 계정입니다.

  // 최종 statusCode / message 결정
  const finalStatusCode =
    propStatusCode ?? (queryStatus ? Number(queryStatus) : undefined) ?? 404;

  const finalMessage = propMessage ?? queryMessage;

  const defaultMessage = {
    401: "로그인 또는 구글 로그인 정보가 없거나, 권한이 없습니다.",
    404: "요청하신 페이지를 찾을 수 없습니다.",
    500: "서버에 문제가 발생했습니다. 관리자에게 문의하세요.",
    default: "알 수 없는 에러가 발생했습니다.",
  };
  return (
    <div style={{ textAlign: "center", padding: "50px" }}>
      <h1>Error {finalStatusCode}</h1>
      <p>
        {finalMessage ||
          defaultMessage[finalStatusCode] ||
          defaultMessage.default}
      </p>
      <button className="error-btn" onClick={() => navigate("/")}>
        홈으로 이동하기
      </button>
      {/*400 에러일 때만 버튼 보여주기 */}
      {String(finalStatusCode) === "400" && (
        <button
          className="login-btn"
          onClick={() =>
            (window.location.href =
              "http://ec2-3-37-42-189.ap-northeast-2.compute.amazonaws.com:8888/oauth2/authorization/google")
          }
        >
          다른 Google 계정으로 다시 시도
        </button>
      )}
    </div>
  );
};
export default ErrorPage;
