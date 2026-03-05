/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-undef */
import React, { useEffect, useRef, useState } from "react";
import '../../_style/meeting/meetingList.css'
import search from '../../_image/search.png'
import pen from '../../_image/pen.png'
import line_3 from '../../_image/line-3.svg'
import PostPointer from "../noticeboard/postpagenation"; // 페이지 번호 컴포넌트
import MeetingContent from "./meetingContent.jsx";     // 모임 카드 목록 컴포넌트
import MeetingDetail from "./meetingDetail";           // 모임 상세 팝업 컴포넌트
import axios from "axios";

const MeetingList = ({idStatus}) => {

  // --- [1. 모임 생성 페이지 이동] ---
  const newmeeting = () => {
    window.location.href = "/newmeeting";
  }

  // --- [2. 모임 필터 옵션 상태] ---
  // false: 전체 모임 보기, true: 내가 참여한 모임 보기
  const [meetingOption, setMeetingOption] = useState(false); 

  const setTrueOption = () => {
    if(idStatus === undefined) {
      alert("로그인 후 사용할 수 있습니다.");
      return;
    }
    setMeetingOption(true); // '나의 모임' 탭 활성화
  }
  const setFalseOption = () => {
    setMeetingOption(false); // '전체 모임' 탭 활성화
  }

  // --- [3. 검색 기능] ---
  const [searchData , setSearch] = useState(""); // 검색어 입력값 저장
  const onChangeSearchData = (e) => {
    setSearch(e.target.value);
  }

  // 엔터 키를 누르거나 검색 시 호출
  const searchRequest = async (e) => {
    // 1. 검색 결과에 맞는 전체 컨텐츠 개수 요청 (페이지네이션 계산용)
    await axios({
      method: "GET",
      mode: "cors",
      url: `/meeting/title-address/count?data=${searchData}`
    }).then((response) => {
      setPageAmount(response.data);
    }).catch((err) => console.log(err));

    // 2. 엔터키를 눌렀을 때 실제 검색 데이터 목록 요청
    if(e.key === 'Enter') {
      await axios({
        method: "GET",
        mode: "cors",
        url: `/meeting/title-address?data=${searchData}&page=${pages - 1}&size=6`
      }).then((response) => {
        setMeetingList(response.data);
      }).catch((err) => console.log(err));
    }
  }

  // --- [4. 모임 상세 팝업 제어] ---
  const [meetingDetail , setMeetingDetail] = useState(false); // 상세창 노출 여부
  const [detailNumber , setDetailNumber] = useState(0);       // 클릭한 모임의 ID

  // 모임 카드를 클릭하면 상세 창을 띄워줌
  const showMeetingDetail = (number) => {
    if(meetingDetail) {
      setMeetingDetail(false);
    } else {
      setMeetingDetail(true);
      setDetailNumber(number);
    }
  }

  const exitMeetingDetail = () => {
    setMeetingDetail(false);
  }

  // --- [5. 페이지네이션(Pagination) 관련 상태] ---
  const [meetingList, setMeetingList] = useState(); // 현재 화면에 뿌려줄 모임 배열
  const [pageAmount, setPageAmount] = useState(0);   // 전체 모임 개수 (서버에서 받아옴)
  const [pages, setPages] = useState(1);            // 현재 페이지 번호
  const maxPages = useRef(1);                       // 최대 페이지 수 (계산값)

  // 다음/이전 페이지 이동 함수
  const gotoNext = () => {
    if (pages < maxPages.current) setPages(parseInt(pages) + 1);
  }
  const gotoPrevious = () => {
    if (pages > 1) setPages(parseInt(pages) - 1);
  }
  const setNowPages = async (value) => {
    setPages(value);
  }

  // 페이지 번호 리스트 생성 및 렌더링 함수
  const pushData = () => {
    maxPages.current = Math.ceil(pageAmount / 6); // 한 페이지당 6개씩
    const arrs = [];
    for (let i = 1; i <= maxPages.current; i++) {
      arrs.push([i]);
    }
    return <PostPointer pages={arrs} nowPage={pages} setPage={setNowPages} />
  }

  // --- [6. 핵심: 데이터 로딩 라이프사이클] ---
  // meetingOption(탭 변경)이나 pages(페이지 번호)가 바뀔 때마다 실행됨
  useEffect(() => {
    const fetchData = async () => {
      if (meetingOption) {
        // [나의 모임] 모드일 때
        const countRes = await axios.get(`/meeting/user/count`);
        setPageAmount(countRes.data);

        const listRes = await axios.get(`/meeting/user?page=${pages - 1}&size=6`);
        setMeetingList(listRes.data);
      } else {
        // [전체 모임] 모드일 때
        const countRes = await axios.get(`/meeting/count`);
        setPageAmount(countRes.data);

        const listRes = await axios.get(`/meeting?page=${pages - 1}&size=6`);
        setMeetingList(listRes.data);
      }
    };
    fetchData();
  }, [meetingOption, pages]); // 탭을 바꾸거나 페이지를 넘기면 자동으로 API 다시 호출

  return (
    <div className="screen">
        {/* 모임 상세 팝업창 (열려있을 때만 렌더링) */}
        {meetingDetail ? <div className="meetingDetails"><MeetingDetail hideDetail={exitMeetingDetail} detailNumber={detailNumber} meetingOption={meetingOption}/></div> : null}
      
      <div className="div">
        <div className="text-wrapper">참여</div>
        
        {/* 검색 영역 (나의 모임 탭에서는 숨김) */}
        <div className="overlap">
          {meetingOption ? null :
            <div>
              <img className="light-s" alt="검색" src={search} />
              <input className="rectangle" onChange={onChangeSearchData} onKeyDown={searchRequest} placeholder="지역 혹은 이름을 입력해주세요." />
            </div>
          }
        </div>

        {/* 모임 생성 버튼 (나의 모임 탭에서는 숨김) */}
        {meetingOption ? null :
          <div className="overlap-group" onClick={newmeeting}>
            <img className="thin-s" alt="글쓰기" src={pen} />
          </div>
        }

        {/* 상단 탭 (새로운 모임 / 나의 모임) */}
        <div className="text-wrapper-7" onClick={setFalseOption}>새로운 모임</div>
        <div className="text-wrapper-8" onClick={setTrueOption}>나의 모임</div>
        
        {/* 하단 탭 강조 라인 애니메이션용 레이어 */}
        <div className="overlap-3">
          <img className="line" alt="Line" src={line_3} />
          {meetingOption ? <div className="rectangle-3-mine" /> : <div className="rectangle-3" />}
        </div>

        {/* 실제 모임 목록 카드 영역 */}
        <div className="meetingContentArea">
          <MeetingContent data={meetingList} showDetail={showMeetingDetail} />
        </div>

        {/* 하단 페이지네이션 UI */}
        <div className="meetingPageNation">
          <nav aria-label="Page navigation example" className="pagenations">
            <ul className="pagination">
              <li className="page-item"><a className="page-link" onClick={gotoPrevious} href="#" style={{ boxShadow: "none" }}>&lt;</a></li>
              {pushData()}
              <li className="page-item"><a className="page-link" href="#" onClick={gotoNext} style={{ boxShadow: "none" }}>&gt;</a></li>
            </ul>
          </nav>
        </div>
      </div>
    </div>
  )
}

export default MeetingList;