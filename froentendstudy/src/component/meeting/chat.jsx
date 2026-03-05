/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/jsx-no-undef */
import '../../_style/meeting/chat.css'
import '../../_style/meeting/chatData.css'
import line from '../../_image/line-3.svg'
import exit from '../../_image/exit.png'
import defaultALT from '../../_image/defaultALT.png'
import React, { Fragment, useEffect, useRef, useState } from 'react'
import axios from "axios";

const Chat = ({ dropDownSet }) => {
  // --- [1. 상태 관리(State)] ---
  const [chatRoom, setChatRoom] = useState([]);    // 내가 참여 중인 채팅방 목록
  const [meetingId, setMeetingId] = useState(0);   // 현재 선택된 채팅방(모임) ID
  const [toogle, setToogle] = useState(true);      // true: 방 목록 보기, false: 채팅 내용 보기
  const [chatData, setChatData] = useState([]);    // 현재 방의 채팅 메시지들
  const [userInfo, setUserInfo] = useState({ userKey: 0, userId: "", profileImage: "" }); // 내 정보

  // --- [2. 채팅 스크롤 제어] ---
  const messagesEndRef = useRef(null); // 채팅창 최하단을 가리키는 참조

  // 새 메시지가 오면 화면을 맨 아래로 부드럽게 내림
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom();
  }, [chatData]); // 채팅 데이터가 업데이트될 때마다 실행

  // --- [3. WebSocket 설정] ---
  const webSocketUrl = `ws://localhost:8080/chat`; // 웹소켓 서버 주소
  let ws = useRef(null); // 재렌더링 시에도 소켓 객체를 유지하기 위해 useRef 사용

  const [socketConnected, setSocketConnected] = useState(false); // 소켓 연결 완료 여부

  // --- [4. 메시지 전송 로직] ---
  const [inputData, setInputData] = useState(""); // 사용자가 입력 중인 텍스트

  const onChangeInputData = (e) => {
    setInputData(e.target.value);
  }

  // 엔터키를 눌렀을 때 메시지 전송
  const onPushEnter = (e) => {
    if (e.key === 'Enter') {
      if(inputData === "") {
        alert("메세지를 입력해 주세요.");
        return;
      }
      
      if (socketConnected) {
        // 서버에 JSON 형태로 메시지 전송 (메시지 타입: SEND)
        ws.current.send(
          JSON.stringify({
            sender: userInfo.userId,
            message: inputData,
            meetingId: meetingId,
            senderImage: userInfo.profileImage,
            messageType: "SEND"
          })
        );
        setInputData(""); // 전송 후 입력칸 초기화
      }
    }
  }

  // --- [5. 소켓 연결 및 해제 (Lifecycle)] ---
  useEffect(() => {
    // 채팅창으로 진입(toogle이 false)했을 때만 소켓 연결 시도
    if (toogle === false) {
      if (!ws.current) {
        ws.current = new WebSocket(webSocketUrl);

        // 연결 성공 시
        ws.current.onopen = () => {
          console.log("connected to " + webSocketUrl);
          setSocketConnected(true);
        };

        // 연결 해제 시
        ws.current.onclose = (error) => {
          console.log("disconnect from " + webSocketUrl);
          setSocketConnected(false);
        };

        // 에러 발생 시
        ws.current.onerror = (error) => {
          console.log("connection error " + webSocketUrl);
        };

        // 서버로부터 메시지를 받았을 때
        ws.current.onmessage = (evt) => {
          const data = JSON.parse(evt.data);
          // 기존 메시지 리스트에 새 메시지 추가
          setChatData((prevItems) => [...prevItems, data]);
        };
      }

      // 컴포넌트가 사라지거나 다시 그려질 때 소켓 닫기 (Cleanup)
      return () => {
        if (ws.current) {
          console.log("clean up: close socket");
          ws.current.close();
          ws.current = null; // 초기화
        }
      };
    }
  }, [toogle]);

  // 소켓이 연결되면 서버에 "입장(ENTER)" 메시지 전송
  useEffect(() => {
    if (socketConnected) {
      ws.current.send(
        JSON.stringify({
          sender: userInfo.userId,
          message: "",
          meetingId: meetingId,
          senderImage: "",
          messageType: "ENTER"
        })
      );
    }
  }, [socketConnected]);

  // --- [6. 초기 데이터 로딩 (API 요청)] ---
  useEffect(() => {
    // async를 useEffect 외부 함수로 분리 (Vite/React 표준 방식)
    const fetchData = async () => {
      // 1. 참여 중인 채팅방 목록 가져오기
      try {
        const roomRes = await axios.get(`/chat/participants`);
        setChatRoom(roomRes.data);
      } catch (err) {
        console.log("채팅방 목록 로딩 실패", err);
      }

      // 2. 현재 로그인한 유저 정보 가져오기
      try {
        const userRes = await axios.get(`/users`);
        setUserInfo({ 
          userKey: userRes.data.data.userKey, 
          userId: userRes.data.data.id, 
          profileImage: userRes.data.data.profileImage 
        });
      } catch (err) {
        console.log("유저 정보 로딩 실패", err);
      }
    };

    fetchData();
  }, []);

  // 특정 채팅방을 클릭했을 때 과거 대화 내역을 불러오는 함수
  const getChatData = async (roomId, meetingId) => {
    setMeetingId(meetingId);
    setToogle(false); // 채팅창 화면으로 전환
    try {
      const response = await axios.get(`/chat/${meetingId}`);
      setChatData(response.data);
    } catch (err) {
      console.log("과거 대화 내역 로딩 실패", err);
    }
  }

  // --- [7. 서브 컴포넌트: 채팅방 목록 뷰] ---
  const ChatRoomContent = ({ room }) => {
    return room.map(data => (
      <div className="chatContent" key={data.chatId} onClick={() => getChatData(data.chatId, data.meetingId)}>
        <img className="ellipse-chat" alt="img" src={data.meetingImage} />
        <div className="text-wrapper-chat">{data.meetingTitle}</div>
        <div className="text-wrapper-chat-last">모임 개설일 : {data.createDate}</div>
      </div>
    ));
  }

  // --- [8. 서브 컴포넌트: 실제 채팅 메시지 뷰] ---
  const ChatDataContent = ({ data }) => {
    return data.map((detail, index) => (
      /* chatId가 0이면 고유 키 생성을 위해 랜덤값 사용 */
      <div className="overlap-group-chatData" key={detail.chatId === 0 ? `temp-${index}-${Math.random()}` : detail.chatId}>
        <img
          className="mask-group-chatData"
          alt="img"
          src={detail.senderImage || defaultALT}
        />
        <div className="text-wrapper-7-chatData">{detail.sender}</div>
        <span className="rectangle-chatData">
          {detail.message}
        </span>
        <div className="text-wrapper-4-chatData">{detail.sendTime}</div>
        {/* 자동 스크롤을 위한 타겟 지점 */}
        <div ref={messagesEndRef} />
      </div>
    ));
  }

  return (
    <div className="element-chat">
      <div className="div-chat">
        <div className="text-wrapper-4-chat">모임 채팅</div>
        <div className="chatContentArea">
          {toogle ? (
            /* 방 목록 화면 */
            <Fragment>
              <ChatRoomContent room={chatRoom} />
            </Fragment>
          ) : (
            /* 채팅 메시지 화면 */
            <Fragment>
              <div className="element-chatData">
                <div className="div-chatData">
                  <ChatDataContent data={chatData}/>
                </div>
                <div className="rectangle-3-chatData">
                  <input 
                    className="chattingInput" 
                    placeholder="메시지를 입력하세요..."
                    onChange={onChangeInputData} 
                    onKeyDown={onPushEnter} 
                    value={inputData} 
                  />
                </div>
              </div>
            </Fragment>
          )}
        </div>
        {/* 나가기 버튼 */}
        <img className="light-s-chat" alt="Exit" src={exit} onClick={dropDownSet} />
        <img className="line-chat" alt="Line" src={line} />
      </div>
    </div>
  )
}

export default Chat;