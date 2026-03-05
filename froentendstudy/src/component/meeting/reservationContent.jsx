/* eslint-disable react-hooks/exhaustive-deps */
import line from '../../_image/line-3.svg';
import defaultALT from '../../_image/defaultALT.png'
import locate from '../../_image/locate.png';
import time from '../../_image/time.png';
import people from '../../_image/people.svg';
import axios from 'axios';
import { Fragment, useEffect, useState } from 'react';

/**
 * ShowReservation 컴포넌트
 * @param {Array} reservation - 서버에서 받아온 일정(예약) 리스트 배열
 * @param {Object} meeting - 현재 속해 있는 부모 모임 정보
 * @param {Object} owner - 모임장 정보 (신고 기능 등에 사용)
 */
const ShowReservation = ({ reservation, meeting, owner }) => {

    // --- [1. 일정 참가 함수] ---
    const joinReserv = async (reservationId, maxPart, nowPart) => {
        // 인원 수 체크 (프론트엔드 1차 방어)
        if (nowPart >= maxPart) {
            alert("인원이 꽉 찬 모임입니다.");
            return;
        }

        try {
            await axios({
                method: "POST",
                mode: "cors",
                url: `/meeting/reservation/${reservationId}/join`
            });
            alert("모임에 참가하셨습니다.");
            window.location.reload(); // 데이터 갱신을 위한 새로고침
        } catch (err) {
            alert(err.response?.data?.message || "참가 중 오류가 발생했습니다.");
        }
    }

    // --- [2. 일정 탈퇴 함수] ---
    const leaveReserv = async (reservationId) => {
        try {
            await axios({
                method: "DELETE",
                mode: "cors",
                url: `/meeting/reservation/${reservationId}/leave`
            });
            alert("일정에 나갔습니다.");
            window.location.reload();
        } catch (err) {
            alert(err.response?.data?.message || "탈퇴 중 오류가 발생했습니다.");
        }
    }

    // --- [3. 내부 컴포넌트: 참여자 토글 및 목록 로드] ---
    const ToogleReserv = ({ id }) => {
        const [toogle, setToogle] = useState(false);       // 참여자 명단 노출 상태
        const [participant, setParticipant] = useState([]); // 해당 일정의 참여자 명단

        // 토글 버튼 클릭 핸들러
        const setToogleFunc = () => {
            setToogle(!toogle);
        }

        // 특정 일정의 참여자 리스트를 서버에서 가져옴
        const showParticipant = async (reservationId) => {
            try {
                const response = await axios.get(`/meeting/reservation/${reservationId}`);
                setParticipant(response.data);
            } catch (err) {
                console.error("참여자 로드 실패:", err);
            }
        }

        // 컴포넌트 마운트 시 참여자 미리 로드 (필요에 따라 토글 시 로드로 변경 가능)
        useEffect(() => {
            showParticipant(id);
        }, [id]);

        return (
            <Fragment>
                <span className="showParticipants" onClick={setToogleFunc}>
                    {toogle ? "참여자 숨기기" : "참여자 보기"}
                </span>
                {/* 토글 상태가 true일 때만 명단 렌더링 */}
                {toogle ? (
                    <div className="showParticipantsElement">
                        <ShowMember member={participant} />
                    </div>
                ) : null}
            </Fragment>
        )
    }

    // --- [4. 내부 컴포넌트: 멤버 아바타 렌더링] ---
    const ShowMember = ({ member }) => {
        return member.map(data => (
            <div key={data.userKey} className="memberItem">
                <img
                    className="mask-group-2-meetingView-viewMore"
                    alt="profile"
                    src={data.profileImage || defaultALT}
                    title={data.userId}
                />
                <span className="memberName">{data.userId}</span>
                <div className="memberLine"></div>
            </div>
        ))
    }

    // --- [5. 일정 신고 함수] ---
    const reportContent = async (data) => {
        if (!window.confirm("해당 일정을 신고하시겠습니까?")) return;

        const reason = window.prompt("신고 사유를 작성해주세요. (100자 이내)");
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
                    "reportType": "RESERVATION",
                    "target": {
                        "writer": owner.userId,
                        "content": data.description
                    }
                }
            });
            alert("신고가 완료되었습니다.");
        } catch (e) {
            alert("로그인 후에 사용해주세요.");
        }
    }

    // --- [6. 메인 렌더링 (일정 리스트 반복)] ---
    return (
        reservation.map(data => (
            <div className="reservation" key={data.reservationId}>
                <div className="text-wrapper-122-meetingView">모임 설명</div>
                <div className="text-wrapper-32123-meetingView" onClick={() => reportContent(data)}>일정 신고</div>
                
                <div className="text-wrapper-2-meetingView">장소 및 일정</div>
                
                {/* 시간 정보 */}
                <img className="light-s-meetingView" alt="시간" src={time} />
                <div className="text-wrapper-3-meetingView">{data.date}</div>
                
                {/* 위치 정보 */}
                <img className="light-s-2-meetingView" alt="위치" src={locate} />
                <p className="p-meetingView">{data.address} <br /> {data.detailAddress}</p>
                
                {/* 인원 정보 */}
                <img className="vector-meetingView" alt="인원" src={people} />
                <p className="text-wrapper-4-meetingView">
                    현재 {data.userCount} 명 / 최대 {data.maxParticipants}명
                </p>
                
                {/* 참여자 보기 토글 컴포넌트 */}
                <ToogleReserv id={data.reservationId} />

                {/* 일정 상세 설명 */}
                <p className="element-2-meetingView">
                    {data.description}
                </p>

                {/* 디자인 라인 */}
                <img className="line-4-meetingView" alt="Line" src={line} />
                <img className="line-5-meetingView" alt="Line" src={line} />

                {/* 하단 제어 버튼: 참가 및 탈퇴 */}
                <div className="div-wrapper-meetingView" onClick={() => joinReserv(data.reservationId, data.maxParticipants, data.userCount)}>
                    <div className="text-wrapper-7-meetingView">일정 참가</div>
                </div>
                
                <div className="div-wrapper-meetingView-remove" onClick={() => leaveReserv(data.reservationId)}>
                    <div className="text-wrapper-7-meetingView-remove">일정 탈퇴</div>
                </div>
            </div>
        ))
    )
}

export default ShowReservation;