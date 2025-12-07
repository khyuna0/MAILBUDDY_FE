import "../css/AddressBook.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import api from "../api/axiosConfig";
import { UserContext } from "../context/UserContext";
import useApi from "../hooks/useApi";
import ErrorPage from "../component/ErrorPage";
import { useNavigate } from "react-router-dom";

function AddressBook() {
  const { user, googleLinked, authLoading } = useContext(UserContext);
  const { error, loading, request, setError } = useApi();
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  //추가 : 검색어 상태
  const [search, setSearch] = useState("");

  // 페이징 (백엔드 없이 가져온 주소록 배열 잘라서 페이징)
  const [currentPage, setCurrentpage] = useState(0);
  const itemsPerPage = 7; // 페이지 당 주소의 개수

  // 추가 : 검색 적용된 리스트
  const filteredAddresses = addresses.filter((a) => {
    const q = search.trim().toLowerCase();
    if (!q) return true; // 검색어 없으면 전체
    const name = (a.senderName || "").toLowerCase();
    const email = (a.senderEmail || "").toLowerCase();
    return name.includes(q) || email.includes(q);
  });

  // 검색 결과 기준 페이징
  const totalPages = Math.ceil(filteredAddresses.length / itemsPerPage);
  const startIndex = currentPage * itemsPerPage;
  // 현재 페이지에 해당하는 일부 데이터만 자름
  const currentData = filteredAddresses.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // 검색어 바뀌면 1페이지로 돌려놓기
  useEffect(() => {
    setCurrentpage(0);
  }, [search]);

  // Gmail 작성창 열기 (to 보내는 사람, subject 제목, body 내용)
  const openGmailCompose = (to, subject = "", body = "") => {
    const qs = new URLSearchParams({
      view: "cm", // compose mode, 새 메일 작성 창을 연다
      fs: "1", // full screen 모드
      to: to || "",
      su: subject,
      body: body,
    }).toString();
    window.open(
      `https://mail.google.com/mail/?${qs}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  // 주소록 가져오기
  const getAllAddress = async () => {
    try {
      const res = await request(() => api.get("/api/address/list"));
      setAddresses(res ?? []);
    } catch (err) {
      setError(err);
      //setError(error.response?.data?.message || error.message);
      console.error(err);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (googleLinked) {
      getAllAddress();
    } else {
      navigate("/err401", { replace: true });
      return;
    }
  }, [googleLinked, authLoading]);

  if (!googleLinked)
    return <div className="ab-error">구글 로그인 후 이용하실 수 있습니다.</div>;
  if (loading) return <div className="ab-wrap">불러오는 중...</div>;
  if (error && typeof error === "string" && error.includes("서버")) {
    // 문자열 에러 메시지 내 "서버" 키워드 체크 (이걸 잘 모르겠음 ..)
    return <ErrorPage statusCode={500} message={error} />;
  }

  if (loading) return <div className="ab-wrap">불러오는 중...</div>;

  if (error && typeof error === "string" && error.includes("서버")) {
    return <ErrorPage statusCode={500} message={error} />;
  }

  return (
    <div className="ab-wrap">
      <div className="ab-title-row">
        <h2 className="ab-title">주소록👤</h2>

        {/* 검색 + Gmail 버튼  */}
        <div className="ab-actions">
          <input
            type="text"
            className="ab-search-input"
            placeholder="이름 또는 이메일 검색"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="ab-error">{error}</div>}

      <div className="ab-card">
        <div className="ab-head">
          <div className="ab-col ab-name">이름</div>
          <div className="ab-col ab-email">이메일</div>
          <div className="ab-col ab-action">메일쓰기</div>
        </div>
        <div className="ab-body">
          {addresses.length === 0 && (
            <div className="ab-empty">주소록이 비어 있습니다.</div>
          )}

          {currentData.map(
            (
              a
              // p // p => 페이징
            ) => (
              <div className="ab-row" key={a.senderEmail}>
                <div className="ab-col ab-name">{a.senderName || "-"}</div>
                <div className="ab-col ab-email">{a.senderEmail}</div>
                <div className="ab-col ab-action">
                  <button
                    className="ab-mail-btn"
                    type="button"
                    onClick={() =>
                      openGmailCompose(
                        a.senderEmail,
                        `[MailBuddy] ${a.senderName ?? ""}님께 메일`,
                        ""
                      )
                    }
                  >
                    메일쓰기
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* 페이징 버튼 */}
      {totalPages > 1 && (
        <div className="ab-pagination">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentpage(i)}
              className={`ab-page-btn ${i === currentPage ? "active" : ""}`}
              type="button"
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default AddressBook;
