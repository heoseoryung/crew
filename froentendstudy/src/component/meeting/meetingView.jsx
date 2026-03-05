/* eslint-disable react-hooks/exhaustive-deps */
import '../../_style/meeting/meetingView.css';
import line from '../../_image/line-3.svg';
import etc from '../../_image/etc.svg';
import locate from '../../_image/locate.png';
import people from '../../_image/people.svg';
import pen from '../../_image/pen.png';
import trash from '../../_image/trash.svg';
import { useEffect, useState } from 'react';
import axios from 'axios';
import defaultALT from '../../_image/defaultALT.png'
import ShowReservation from './reservationContent'; // 일정 예약 표시 컴포넌트

const MeetingView = () => {
  // --- [1. 기초 데이터 설정] ---
  const sessionUserId = localStorage.getItem("userId"); // 로그인 여부 확인용
  const urlStat = window.location.pathname.split("/");   // URL에서 모임 ID 추출 (예: /meeting/12 -> 12)

  const [meeting, setMeeting] = useState(undefined);    // 모임 상세 정보
  const [participants, setParticipants] = useState([]);  // 참여자 명단
  const [owner, setOwner] = useState({});               // 모임장 정보
  const [moreMember, setMoreMember] = useState(false);   // 멤버 더보기 팝업 토글
  const [reservation, setReservation] = useState([]);    // 예약된 일정 목록

  // --- [2. 네비게이션 함수] ---
  const modifyMeeting = () => {
    window.location.replace(`/modify/meeting/${urlStat[2]}`);
  }

  const gotoReserv = () => {
    window.location.replace(`/newMeeting/${urlStat[2]}`);
  }

  // --- [3. 신고 기능 (Admin 연동)] ---
  const reportContent = async (meeting, owner) => {
    if (!window.confirm("해당 미팅을 신고하시겠습니까?")) return;

    const reason = window.prompt("신고 사유를 입력해주세요. (100자 이내)");
    if (!reason) return;
    if (reason.length > 100) {
      alert("신고 사유는 100자 이내로 작성해주세요.");
      return;
    }

    try {
      await axios({
        method: "POST",
        url: `/admin/report/content`,
        data: {
          "content": reason,
          "reportType": "MEETING",
          "target": {
            "writer": owner.userId,
            "title": meeting.title,
            "content": meeting.description
          }
        }
      });
      alert("신고가 완료되었습니다.");
    } catch (e) {
      alert("로그인 후에 사용해주세요.");
    }
  }

  // --- [4. 초기 데이터 로딩 및 권한 검증] ---
  useEffect(() => {
    const fetchData = async () => {
      // 1) 로그인 체크
      if (!sessionUserId) {
        alert("로그인 후 사용해주세요.");
        window.location.replace(`/meeting`);
        return;
      }

      const meetingId = urlStat[2];

      try {
        // 2) 실제 참여 멤버인지 검증 (보안)
        const checkRes = await axios.get(`/meeting/is-participants/${meetingId}`);
        if (checkRes.data === false) {
          alert("비 정상적인 접근입니다. (참여 멤버가 아님)");
          window.location.replace(`/meeting`);
          return;
        }

        // 3) 모임 상세 정보 로드
        const detailRes = await axios.get(`/meeting/${meetingId}`);
        setMeeting(detailRes.data);

        // 4) 참여자 목록 및 모임장 정보 로드
        const memberRes = await axios.get(`/meeting/participants/${meetingId}`);
        setParticipants(memberRes.data.participantResponses);
        setOwner({ profileImage: memberRes.data.profileImage, userId: memberRes.data.userId });

        // 5) 예약된 일정 정보 로드
        const reservRes = await axios.get(`/meeting/${meetingId}/reservation`);
        setReservation(reservRes.data);

      } catch (err) {
        console.error("데이터 로드 중 오류 발생", err);
      }
    };

    fetchData();
  }, []);

  // --- [5. 멤버 표시 관련 서브 컴포넌트] ---
  // 상단에 대표로 보여줄 멤버 이미지 (최대 4명)
  const ShowMember = ({ member }) => {
    const tmp = member.slice(0, 4);
    return tmp.map(data => (
      <img
        key={data.userKey}
        className="mask-group-2-meetingView"
        alt="member"
        src={data.profileImage || defaultALT}
        title={data.userId}
      />
    ));
  }

  // 전체 멤버 목록 보기 토글
  const showMoreMember = () => {
    setMoreMember(!moreMember);
  }

  // 더보기 클릭 시 나타나는 멤버 리스트
  const MoreMemberContent = ({ member }) => {
    return member.map(data => (
      <div key={data.userKey}>
        <img
          className="mask-group-2-meetingView-viewMore"
          alt="member"
          src={data.profileImage || defaultALT}
        />
        <span className="memberName">{data.userId}</span>
        <div className="memberLine"></div>
      </div>
    ));
  }

  // --- [6. 나가기 및 삭제 로직] ---
  // 모임 탈퇴
  const leaveParty = async () => {
    if (window.confirm("모임을 나가시겠습니까?")) {
      try {
        await axios.delete(`/meeting/participants/${urlStat[2]}`);
        window.location.replace("/meeting");
      } catch (err) {
        alert(err.response.data.message);
      }
    }
  }

  // 모임 전체 삭제 (모임장 전용)
  const deleteParty = async () => {
    if (window.confirm("모임을 삭제하시겠습니까?")) {
      try {
        await axios.delete(`/meeting/${urlStat[2]}`);
        window.location.replace("/meeting");
      } catch (err) {
        alert("모임장만 모임을 삭제할 수 있습니다.");
      }
    }
  }

  // 데이터 로딩 전 렌더링 방지
  if (meeting === undefined) return null;

  return (
    <div className="screen-meetingView">
      <div className="div-meetingView">
        {/* 상단 섹션: 이미지 및 제목 */}
        <div className="partyDescription">
          <img className="overlap-group-meetingView" alt="meeting" src={meeting.meetingImage} />
          <div className="text-wrapper-meetingView">참여 모임원 {meeting.nowParticipants}명</div>
          <img className="line-meetingView" alt="Line" src={line} />
          <img className="img-meetingView" alt="Line" src={line} />

          {/* 참여 멤버 아바타 영역 */}
          <div className="partyGroup">
            <ShowMember member={participants} />
          </div>
          
          {/* 멤버 더보기 아이콘 */}
          <div className="vector-3-meetingView-more" onClick={showMoreMember}>
            <img className="vector-3-meetingView" alt="more" src={etc} />
          </div>

          {/* 멤버 더보기 레이어 */}
          {moreMember && (
            <div className="moreMemberArea">
              <MoreMemberContent member={participants} />
            </div>
          )}

          <div className="text-wrapper-15-meetingView">{meeting.title}</div>
          <p className="element-meetingView">{meeting.description}</p>

          {/* 모임장 프로필 */}
          <img
            className="mask-group-3-meetingView"
            alt="owner"
            title={`모임장: ${owner.userId}`}
            src={owner.profileImage || defaultALT}
          />

          {/* 일정 추가 버튼 */}
          <div className="overlap-meetingView" onClick={gotoReserv}>
            <div className="text-wrapper-5-meetingView">참여</div>
            <div className="rectangle-meetingView" />
            <div className="text-wrapper-6-meetingView">일정 추가</div>
          </div>

          {/* 모임 정보 상세 */}
          <div className="text-wrapper-8-meetingView">주 모임 장소</div>
          <div className="text-wrapper-9-meetingView">모임장</div>
          <p className="text-wrapper-10-meetingView">{meeting.address} / {meeting.detailAddress}</p>
          <div className="text-wrapper-11-meetingView">현재 {meeting.nowParticipants}명 / 최대 {meeting.maxParticipants}명</div>
          
          <img className="line-2-meetingView" alt="Line" src={line} />
          <img className="light-s-3-meetingView" alt="locate" src={locate} />
          <img className="vector-2-meetingView" alt="people" src={people} />
        </div>

        {/* 하단 섹션: 예약된 모임 일정 리스트 */}
        <div className="text-wrapper-12-meetingView rectangle-2-meetingView">예약된 모임</div>
        <div className="overlap-2-meetingView">
          <img className="line-3-meetingView" alt="Line" src={line} />
        </div>

        {/* 예약 내역 컴포넌트 */}
        <div className='reservationArea'>
          <ShowReservation reservation={reservation} meeting={meeting} owner={owner} />
        </div>

        {/* 컨트롤 영역: 나가기, 삭제, 수정, 신고 */}
        <div className="overlap-3-meetingView" onClick={leaveParty}>
          <div className="rectangle-3-meetingView" />
          <div className="text-wrapper-16-meetingView">모임 나가기</div>
        </div>

        {/* 모임 삭제 (휴지통 아이콘) */}
        <div className="overlap-3-meetingDelete" onClick={deleteParty}>
          <img className="thin-s-meetingDelete" alt="delete" src={trash} />
        </div>

        {/* 모임 수정 (연필 아이콘) */}
        <div className="thin-s-wrapper-meetingView" onClick={modifyMeeting}>
          <img className="thin-s-meetingView" alt="modify" src={pen} />
        </div>

        {/* 신고 버튼 (종 아이콘) */}
        <div className="thin-s-wrapper-report" onClick={() => reportContent(meeting, owner)}>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="currentColor" className="bi bi-bell text-wrapper-88-meetingView" viewBox="0 0 16 16">
            <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zM8 1.918l-.797.161A4.002 4.002 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4.002 4.002 0 0 0-3.203-3.92L8 1.917zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5.002 5.002 0 0 1 13 6c0 .88.32 4.2 1.22 6z" />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default MeetingView;