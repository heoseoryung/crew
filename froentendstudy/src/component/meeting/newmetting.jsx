/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import '../../_style/meeting/newMeeting.css';
import exit from '../../_image/exit.png';
import camera from '../../_image/camera.png';
import Maps from '../map/maps'; // 지도 및 주소 선택 컴포넌트
import axios from 'axios';

const ModifyMeeting = ({idStatus}) => {
  // --- [1. 기본 설정 및 상태 관리] ---
  const urlStat = window.location.pathname.split("/"); // URL에서 모임 ID 추출 (/modify/meeting/12 -> 12)
  
  const [arrs , setArrs] = useState([]);      // 인원 수 선택 옵션 리스트 (1~20)
  const [title, setTitle] = useState([]);    // 모임 제목
  const [content, setContent] = useState([]); // 모임 설명
  const [participant, setParticipant] = useState(5); // 최대 참여 인원 (기본값 5)

  const [meetingId , setMeetingId] = useState();
  const [profileImage, setProfileImage] = useState(); // 업로드할 이미지 파일 객체
  const [address, setAddress] = useState();           // 지도로 선택한 기본 주소
  const [locate, setLocate] = useState();            // 지도의 좌표 (X, Y)
  const [detailAddress, setDetailAddress] = useState(); // 상세 주소
  const [imageName, setImageName] = useState("모임 대표 사진 이미지를 필수로 선택해주세요. "); // 선택된 파일명 표시
  const imageInput = useRef(); // 파일 입력(input type='file')을 클릭하기 위한 참조

  // 입력 핸들러 함수들
  const onChangeTitle = (e) => setTitle(e.target.value);
  const onChangeContent = (e) => setContent(e.target.value);
  const onChangeParticipant = (e) => setParticipant(e.target.value);
  const onChangeDetailAddress = (e) => setDetailAddress(e);

  // --- [2. 초기 데이터 로드 (기존 모임 정보 불러오기)] ---
  useEffect(() => {
    const fetchData = async () => {
      // 1) 로그인 여부 확인
      if (idStatus === undefined) {
        alert('로그인 후 사용해주세요.');
        window.history.back();
        return;
      }

      // 2) 참여 인원 드롭다운 옵션 생성 (1명 ~ 20명)
      let data = [];
      for(let i = 1; i <= 20; i++) {
        data.push(<option key={i} value={i} style={{ fontWeight: "600" }}>{i}</option>);
      }
      setArrs(data);

      // 3) 서버에서 기존 모임 정보 요청 (수정 권한 확인 포함)
      try {
        const response = await axios.get(`/meeting/${urlStat[3]}/user`);
        const m = response.data;
        
        // 받아온 데이터를 각 상태에 바인딩 (Input창에 기존 값이 미리 보임)
        setMeetingId(m.meetingId);
        setTitle(m.title);
        setLocate({locateX : m.locateX , locateY : m.locateY});
        setContent(m.description);
        setParticipant(m.maxParticipants);
        setDetailAddress(m.detailAddress);
        setAddress(m.address);
      } catch (err) {
        alert("모임 장만 수정할 수 있습니다.");
        window.location.replace(`/meeting/${urlStat[3]}`);
      }
    };

    fetchData();
  }, []);

  // --- [3. 이미지 업로드 및 유효성 검사] ---
  const uploadImage = (e) => {
    if (checkValidImage(e)) {
      setProfileImage(e.target.files); // 파일 객체 저장
    }
  }

  const checkValidImage = (e) => {
    const file = e.target.files[0];
    if (file.size > 10 * 1024 * 1024) { // 10MB 제한
      alert("10M가 넘는 파일은 제외되었습니다.");
      return false;
    } 
    if (file.name.length > 30) { // 파일명 길이 제한
      alert("파일명이 30자가 넘는 파일은 제외되었습니다.");
      return false;
    } 
    
    // 확장자 체크 (jpg, png만 허용)
    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'jpg' || ext === 'png') {
      setImageName(file.name); // 화면에 파일명 표시
      return true;
    }

    alert("jpg, png 파일만 업로드할 수 있습니다.");
    return false;
  }

  // --- [4. 수정 요청 전송 (PUT)] ---
  const request = async () => {
    // 유효성 검사 (빈 칸 확인)
    if (title.length === 0) { alert("제목을 입력해주세요."); return; }
    if (content.length === 0) { alert("설명을 입력해주세요."); return; }
    if (locate === undefined) { alert("위치를 선택해주세요."); return; }
    if (detailAddress === undefined) { alert("상세 주소를 입력해주세요."); return; }

    // 전송할 데이터 구성
    const jsonPostData = {
      "title": title, 
      "description": content, 
      "detailAddress": detailAddress, 
      "address": address ,
      "locateX": locate.locateX, 
      "locateY": locate.locateY, 
      "maxParticipants": participant
    };

    // FormData 생성 (파일 + JSON 데이터를 함께 전송하기 위함)
    let requestForm = new FormData();
    const blob = new Blob([JSON.stringify(jsonPostData)], { type: "application/json" });
    requestForm.append("meeting", blob); // JSON 데이터 추가
    
    // 이미지를 새로 선택한 경우에만 추가
    if(profileImage !== undefined) {
      requestForm.append('image', profileImage[0]);
    }

    try {
      await axios({
        method: "PUT",
        url: `/meeting/${meetingId}`,
        headers: { 'Content-Type': 'multipart/form-data' },
        data: requestForm
      });
      alert("모임이 성공적으로 수정되었습니다.");
      window.location.replace("/meeting");
    } catch (e) {
      alert(e.response?.data?.message || "수정에 실패했습니다.");
      window.history.back();
    }
  }

  const goBack = () => window.history.back();

  return (
    <div className="screen-newMeeting">
      <div className="div-newMeeting">
        <div className="text-wrapper-newMeeting">우리의 모임 이름은?</div>
        
        {/* 선택된 이미지 이름 표시 */}
        <div className="text-wrapper-2-newMeeting">{imageName}</div>
        
        <div className="text-wrapper-4-newMeeting">모임 제목 ( 최대 30자 ) </div>
        {/* [기존 코드] title이 undefined일 때 리액트가 제어권을 잃어 에러 발생 */}
        {/* <input className="rectangle-3-newMeeting" onChange={onChangeTitle} maxLength={30} value={title}/> */}
        
        {/* [수정 코드] || "" 를 추가하여 데이터가 오기 전에도 빈 문자열을 유지하게 함 */}
        <input 
          className="rectangle-3-newMeeting" 
          onChange={onChangeTitle} 
          maxLength={30} 
          value={title || ""} 
        />

        <div className="text-wrapper-3-newMeeting">모임 설명 ( 최대 200자 )  </div>
        {/* [기존 코드] content가 null이나 undefined면 uncontrolled input 경고 발생 */}
        {/* <textarea className="rectangle-2-newMeeting" onChange={onChangeContent} maxLength={200} value={content} /> */}
        
        {/* [수정 코드] textarea도 input과 마찬가지로 항상 문자열 값이 들어오도록 방어 */}
        <textarea 
          className="rectangle-2-newMeeting" 
          onChange={onChangeContent} 
          maxLength={200} 
          value={content || ""} 
        />

        <img className="light-s-newMeeting" alt="닫기" src={exit} onClick={goBack} />

        {/* 이미지 업로드 영역 */}
        <div className="overlap-group-newMeeting">
          <div className="ellipse-newMeeting" onClick={() => imageInput.current.click()} />
          <img
            className="thin-s-newMeeting"
            alt="카메라"
            src={camera}
            onClick={() => imageInput.current.click()}
          />
          <input type="file" onChange={uploadImage} name="file" ref={imageInput} style={{ display: "none" }} />
        </div>

        {/* 주소 및 지도 선택 컴포넌트 */}
        <div className="text-wrapper-5-newMeeting">주 활동 지역을 선택해주세요!</div>
        <Maps 
          locateData={setLocate} 
          addressData={setAddress} 
          detailAddressData={onChangeDetailAddress} 
          detailAddress={detailAddress} 
          address={address}
        />

        {/* 인원수 선택 섹션 */}
        <div className="text-wrapper-7-newMeeting">최대 인원 수를 선택해주세요.</div>
        <div className="text-wrapper-8-newMeeting">최대 인원은 20명까지 가능해요.</div>
        <div className="overlap-2-newMeeting">
          {/* [기존 코드] participant 초기값이 설정되지 않았을 때 select 태그 에러 방지 필요 */}
          {/* <select onChange={onChangeParticipant} value={participant} className="form-select form-select-sm" ... > */}
          
          {/* [수정 코드] 선택된 값이 없을 때도 리액트가 상태를 추적할 수 있도록 "" 할당 */}
          <select 
            onChange={onChangeParticipant} 
            value={participant || ""} 
            className="form-select form-select-sm"
            style={{ marginTop: "5px", fontWeight: "600", cursor: "pointer" }}
          >
            {arrs}
          </select>
        </div>

        {/* 수정 완료 버튼 */}
        <div className="div-wrapper-newMeeting" onClick={request}>
          <div className="text-wrapper-12-newMeeting">모임 수정</div>
        </div>
      </div>
    </div>
  )
}

export default ModifyMeeting;