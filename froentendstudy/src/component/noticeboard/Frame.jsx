/* eslint-disable react-hooks/exhaustive-deps */
import { Link, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import React, { Fragment, useEffect, useMemo, useState } from "react";
import '../../_style/noticeFrame.css';

import NewPost from "./newPost.jsx";
import NoticeList from "./postlist.jsx";
import PostView from "./postview.jsx";
import Profile from './Profile.jsx';
import Notificate from './notificate.jsx';

import qs from 'qs';
import axios from 'axios';
import { deleteAllToken } from './DeleteAllCookie';

import NewMeeting from '../meeting/newmetting.jsx';
import Chat from '../meeting/chat.jsx';
import MeetingList from '../meeting/meetingList.jsx';
import MeetingView from '../meeting/meetingView.jsx';
import NewReservation from '../meeting/newReservation.jsx';
import ModifyMeeting from '../meeting/modifyMeeting.jsx';

import defaultALT from '../../_image/defaultALT.png';
import OAuthMessageHandler from '../login/OAuthMessageHandler';

const NoticeFrame = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ 핵심: userId를 state로 관리 (로컬스토리지만 바꿔서는 리렌더 안 됨)
  const [userId, setUserId] = useState(() => localStorage.getItem("userId"));

  const [dropBoxs, setDropBox] = useState(false);
  const [notified, setNotified] = useState(false);
  const [chatDrop, setChatDrop] = useState(false);
  const [profileImage, setProfileImage] = useState("");
  const [userOption, setUserOption] = useState();

  // ✅ query를 router 기반으로 파싱 (window.location 직접 접근 줄이기)
  const query = useMemo(() => {
    return qs.parse(location.search, { ignoreQueryPrefix: true });
  }, [location.search]);

  const urlInfo = useMemo(() => location.pathname.split('/')[1], [location.pathname]);
  const noticeInfo = urlInfo;

  // ✅ 잘못된 경로 접근 시 noticelist로 (OAuth code 있을 땐 튕기지 않게)
  useEffect(() => {
    if (!query.code && urlInfo !== 'login' && (noticeInfo === undefined || noticeInfo === '') &&
      !['profile', 'newpost', 'login', 'Register', 'meeting', 'viewpost', 'modified'].includes(urlInfo)) {
      navigate("/noticelist", { replace: true });
    }
  }, [query.code, urlInfo, noticeInfo]);

  // ✅ 서버에서 유저 정보 가져오기
  const getInitData = async () => {
    try {
      const response = await axios({
        method: "GET",
        mode: "cors",
        url: "/users",
        withCredentials: true,
      });

      const data = response?.data?.data;
      if (!data) {
        console.log("유저 정보가 비어있습니다.");
        return false;
      }

      // ✅ 여기서 localStorage + state 둘 다 세팅해야 “로그인 표시”가 즉시 바뀜
      localStorage.setItem("userId", data.id);
      setUserId(data.id);

      setUserOption({ notified: data.options });
      setProfileImage(data.profileImage);

      return true;
    } catch (e) {
      console.log(e);
      return false;
    }
  };

  // ✅ 로그아웃 (프론트 상태 + localStorage 초기화)
  const logout = () => {
    localStorage.removeItem("userId");
    setUserId(null);
    setUserOption(undefined);
    setProfileImage("");
    setDropBox(false);
    setNotified(false);
    setChatDrop(false);
  };

  // ✅ OAuth 돌아온 흐름 + 일반 진입 흐름 정리
  useEffect(() => {
    const fetchData = async () => {
      // 1) OAuth code가 있을 때: 유저정보 먼저 받고 → noticelist로 이동 (code 제거)
      if (query.code) {
        const ok = await getInitData();
        if (ok) {
          // ✅ replace로 code가 URL에서 사라져서, 다시 들어와도 useEffect 반복 실행 안 함
          navigate("/noticelist", { replace: true });
        }
        return;
      }

      // 2) code가 없고 userId가 없으면: 쿠키 세션 기반 로그인일 수도 있으니 확인
      if (!userId) {
        await getInitData();
      }
    };

    fetchData();
  }, [query.code]);

  // UI 제어
  const setNotifiedPops = () => {
    setDropBox(false);
    setNotified(v => !v);
  };

  const setChatPops = () => {
    setDropBox(false);
    setChatDrop(v => !v);
  };

  const setDropers = () => setDropBox(v => !v);

  // 버그 리포트
  const bugReport = async () => {
    const reason = window.prompt("버그 내용을 입력해주세요. ( 100자 이내 )" + "");
    if (reason == null) return;
    if (reason.length > 100) {
      alert("신고 사유는 100자 이내로 작성해주세요.");
      return;
    }

    try {
      await axios({
        method: "POST",
        mode: "cors",
        url: `/admin/report/bug`,
        data: { content: reason }
      });
      alert("신고가 완료되었습니다.");
    } catch (e) {
      alert("로그인 후에 사용해주세요.");
    }
  };

  return (
    <Fragment>
      <div className="noticeFrame">
        <header className="noticeFrameHeader">
          <div id="buttonArea">
            {notified && userOption ? (
              <Notificate
                dropDownSet={() => setNotified(false)}
                notifiedMode={userOption.notified}
                userId={userId}
              />
            ) : null}

            {chatDrop ? <Chat dropDownSet={setChatPops} /> : null}

            <span><Link to="/noticelist" id="notDecor">게시판</Link></span>
            <span><Link to="/meeting" id="notDecor">모임</Link></span>
          </div>

          <div id="loginStatus">
            <span id="loginUser">
              {/* ✅ 핵심: userId state로 로그인 여부 판단 */}
              {userId ? (
                <Fragment>
                  <div className='noticeLogin' onClick={setDropers}>
                    <div className="profileimage">
                      <img
                        src={profileImage || defaultALT}
                        alt="img"
                        className="profileImageData"
                      />
                    </div>

                    <span style={{ borderRight: "none" }}>
                      {userId} 님
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"
                        fill="currentColor" className="bi bi-caret-down-fill profilepointer"
                        viewBox="0 0 16 16">
                        <path d="M7.247 11.14 2.451 5.658C1.885 5.013 2.345 4 3.204 4h9.592a1 1 0 0 1 .753 1.659l-4.796 5.48a1 1 0 0 1-1.506 0z" />
                      </svg>
                    </span>
                  </div>

                  {dropBoxs ? (
                    <div className='LoginDropBox'>
                      <div className="profileIcon">
                        <svg xmlns="http://www.w3.org/2000/svg" onClick={setDropers}
                          width="20" height="20" fill="currentColor"
                          className="bi bi-x-lg" viewBox="0 0 16 16">
                          <path fillRule="evenodd"
                            d="M13.854 2.146a.5.5 0 0 1 0 .708l-11 11a.5.5 0 0 1-.708-.708l11-11a.5.5 0 0 1 .708 0Z" />
                          <path fillRule="evenodd"
                            d="M2.146 2.146a.5.5 0 0 0 0 .708l11 11a.5.5 0 0 0 .708-.708l-11-11a.5.5 0 0 0-.708 0Z" />
                        </svg>
                      </div>

                      <ul>
                        <Link to="/profile" id="textDesign">
                          <li className='DropBoxContent' onClick={setDropers} style={{ marginLeft: "-2px" }}>
                            My Profile
                          </li>
                        </Link>

                        <li className='DropBoxContent' onClick={bugReport} style={{ marginLeft: "-1px" }}>
                          Bug Report
                        </li>

                        <li className='DropBoxContent' onClick={setNotifiedPops} style={{ marginLeft: "-1px" }}>
                          Notification
                        </li>

                        <li className='DropBoxContent' onClick={setChatPops} style={{ marginLeft: "-1px" }}>
                          Chat
                        </li>

                        <Link to="/profile" id="textDesign">
                          <li className='DropBoxContent' onClick={setDropers} style={{ marginLeft: "-1px" }}>
                            Settings
                          </li>
                        </Link>

                        {/* ✅ 로그아웃: 프론트 상태 초기화 + token 삭제 */}
                        <Link
                          to="/login"
                          id="textDesign"
                          onClick={() => {
                            deleteAllToken();
                            logout();
                          }}
                        >
                          <li className='DropBoxContent'>Logout</li>
                        </Link>
                      </ul>
                    </div>
                  ) : null}
                </Fragment>
              ) : (
                <div className="logincommitsetting">
                  <Link to="/login" className='noticeLogin'>Login</Link>
                  <Link to="/Register" className='noticeRegister'>Register</Link>
                </div>
              )}
            </span>
          </div>
        </header>

        <Routes>
          <Route path='/noticelist' element={<NoticeList />} />
          <Route path='/newpost' element={<NewPost idStatus={userId} />} />
          <Route path='/modified/:id' element={<NewPost idStatus={userId} />} />
          <Route path='/viewpost/:id' element={<PostView idStatus={userId} />} />
          <Route path='/profile' element={<Profile idStatus={userId} rerenders={logout} profileImageUrl={profileImage} />} />

          <Route path="/meeting" element={<MeetingList idStatus={userId} />} />
          <Route path="/newmeeting" element={<NewMeeting idStatus={userId} />} />
          <Route path="/modify/meeting/:id" element={<ModifyMeeting idStatus={userId} />} />
          <Route path="/meeting/:id" element={<MeetingView />} />
          <Route path="/newmeeting/:id" element={<NewReservation idStatus={userId} />} />

          <Route path="/oauth/error" element={<OAuthMessageHandler />} />
        </Routes>
      </div>
    </Fragment>
  );
};

export default NoticeFrame;