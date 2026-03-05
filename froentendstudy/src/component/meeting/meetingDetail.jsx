/* eslint-disable react-hooks/exhaustive-deps */
import '../../_style/meeting/meetingDetail.css'
import exit from '../../_image/exit.png';
import locate from '../../_image/locate.png';
import people from '../../_image/people.svg';
import { Fragment, useEffect, useState } from 'react';
import axios from 'axios';

/**
 * MeetingDetail 컴포넌트
 * @param {Function} hideDetail - 상세창을 닫는 함수
 * @param {Number} detailNumber - 조회할 모임의 고유 ID
 * @param {Boolean} meetingOption - 사용자가 이미 참여 중인 모임인지 여부 (true면 '이동', false면 '참가')
 */
const MeetingDetail = ({hideDetail , detailNumber , meetingOption}) => {
  // 로컬 스토리지에서 현재 로그인한 유저의 ID를 가져옴 (로그인 체크용)
  let sessionUserId = localStorage.getItem("userId");
  
  // 서버에서 받아온 모임 상세 데이터를 저장하는 상태
  const [meeting , setMeeting] = useState(undefined);

  // 컴포넌트가 마운트될 때(열릴 때) 모임 정보를 서버에 요청
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await axios({
          method: "GET",
          mode: "cors",
          url: `/meeting/${detailNumber}` // URL 파라미터로 모임 ID 전달
        });

        if(response.data === undefined) {
          alert("모임을 불러오는데 오류가 발생했습니다.");
          return;
        }
        setMeeting(response.data); // 서버에서 받은 데이터로 상태 업데이트
      } catch (err) {
        console.error("데이터 로드 실패:", err);
      }
    };

    fetchDetail();
  }, [detailNumber]); // 상세 번호가 바뀔 때마다 다시 실행

  // --- [함수: 모임 참가하기] ---
  const joinMeeting = async () => {
    // 1. 로그인 여부 확인
    if(sessionUserId === undefined || sessionUserId === null) {
      alert("로그인 후 사용해주세요.");
      return;
    }

    // 2. 인원 수 제한 확인
    if(meeting.nowParticipants >= meeting.maxParticipants) {
      alert("모임 내 인원이 가득찼습니다.");
      return;
    }

    // 3. 서버에 참가 요청 전송 (POST)
    await axios({
      method: "POST",
      mode: "cors",
      url: `/meeting/${detailNumber}`
    }).then((response) => {
      alert("모임에 참여하셨습니다. 모임 방은 \" 나의 모임 \" 란에서 이동이 가능합니다.");
      hideDetail(); // 성공 시 상세창 닫기
    }).catch((err) => {
      // 서버에서 이미 참여 중이라는 에러를 보냈을 경우 처리
      alert("모임에 이미 참여하고 있습니다.");
    });
  }

  // --- [함수: 모임 페이지로 이동] ---
  const moveMeeting = () => {
    window.location.replace(`/meeting/${detailNumber}`);
  }

  // --- [렌더링 조건 처리] ---
  // 데이터를 불러오기 전에는 화면을 그리지 않음 (null 반환)
  if(meeting === undefined) {
    return null;
  } else {
    return(
      <Fragment>
      <div className="screen-detail">
        <div className="div-detail">
          {/* 모임 대표 이미지 */}
          <img className="overlap-group-detail" alt="images" src={meeting.meetingImage} />
          
          <div className="ellips-detaile" />
          
          <div className="text-wrapper-10-detail">모임 이름</div>
          <div className="text-wrapper-detail">{meeting.title}</div>
          
          <div className="text-wrapper-11-detail">모임 설명</div>
          <p className="element-detail">
            {meeting.description}
          </p>
          
          <div className="text-wrapper-3-detail">주 모임 장소</div>
          <p className="p-detail">{meeting.address} / {meeting.detailAddress}</p>
          
          {/* 인원 현황 표시 */}
          <div className="text-wrapper-5-detail">현재 {meeting.nowParticipants}명 / 최대 {meeting.maxParticipants} 명</div>
          
          {/* 아이콘 이미지들 */}
          <img className="light-s-detail" alt="위치 아이콘" src={locate} />
          <img className="vector-detail" alt="사람 아이콘" src={people} />
          
          <div className="text-wrapper-6-detail">참여</div>

          {/* [조건부 버튼 렌더링] 
              meetingOption이 true면 이미 가입된 모임 -> '이동' 버튼
              meetingOption이 false면 미가입 모임 -> '참가' 버튼
          */}
          {meetingOption ? 
            <div className="overlap-detail" onClick={moveMeeting}>
              <div className="text-wrapper-7-detail-join">모임 방으로 이동</div>
            </div>
            :
            <div className="overlap-detail" onClick={joinMeeting}>
              <div className="text-wrapper-7-detail">모임 참가</div>
            </div>
          }
          
          {/* 닫기(X) 버튼 */}
          <img src={exit} className="exit-meetingDetail" alt="exit" onClick={() => hideDetail()}/>
        </div>
      </div>
      </Fragment>
    )
  }
}

export default MeetingDetail;