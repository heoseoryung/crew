import React from 'react';
import axios from 'axios';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Fragment } from 'react';
import '../../_style/loginScreen.css'; // 화면 스타일링 불러오기

const FindID = () => {
    // --- [1. 상태 관리(State)] ---
    const [email, setEmail] = useState('');                   // 사용자가 입력한 이메일
    const [codeVisible, setVisible] = useState(false);        // 인증번호 입력칸을 보여줄지 여부
    const [passwordInputVisible, setPasswordInputVisible] = useState(false); // 비번 변경 칸을 보여줄지 여부
    const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력한 인증번호
    const [isProcess, setProcess] = useState(false);          // 이메일 전송 중 "중복 클릭" 방지용
    const [newPassword, setPassword] = useState({             // 새로운 비밀번호 객체
        'password': '',
        'checkPassword': ''
    });

    // --- [2. 핸들러 함수] ---

    // 비밀번호 입력값 변경 처리
    const changePassword = (e) => {
        const { name, value } = e.target;
        // 기존 비번 객체를 유지하면서, 바뀐 필드(name)만 새로운 값(value)으로 업데이트
        setPassword({ ...newPassword, [name]: value });
    }

    // 최종 비밀번호 변경 요청 (PATCH)
    const requestChangePassword = async () => {
        // 1차 검증: 글자 수
        if (newPassword.password.length <= 5) {
            alert('비밀번호는 6자 이상입력해주세요.');
            return;
        }

        // 2차 검증: 두 입력값이 일치하는지
        if (newPassword.password !== newPassword.checkPassword) {
            alert("비밀번호가 일치하지 않습니다.");
            return;
        }

        // 백엔드 서버에 변경 요청 전송
        await axios({
            method: "PATCH",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            url: `/password`,
            data: JSON.stringify({ "email" : email , "password": newPassword.password })
        })
        .then((response) => {
            alert("비밀번호가 변경되었습니다.");
            window.location.replace("/login"); // 성공 시 로그인 페이지로 이동
        })
        .catch((e) => {
            alert(e.response.data.message); // 서버에서 보낸 에러 메시지 표시
        });
    }

    // 이메일 입력값 세팅
    const setEmails = (e) => {
        setEmail(e.target.value)
    }

    // 인증번호 입력값 세팅
    const inputVerificationCode = (e) => {
        setVerificationCode(e.target.value);
    }

    // [핵심 로직] 인증메일 발송 또는 인증번호 체크
    const findId = async () => {
        // 상황 A: 이메일만 입력하고 인증번호를 아직 안 보낸 상태 (또는 전송 중)
        if (!codeVisible) {
            if (!isProcess) {
                setProcess(true); // 전송 시작! (중복 클릭 막기)
            } else {
                alert("처리 중입니다.");
                return;
            }

            // 1단계: 인증 메일 발송 요청
            await axios({
                method: "POST",
                mode: "cors",
                headers: { "Content-Type": "application/json" },
                url: `/mail/send`,
                data: JSON.stringify({ "email": email })
            })
            .then((response) => {
                setVisible(true); // 전송 성공하면 인증번호 입력칸 보여주기
                alert("해당 이메일로 인증 번호가 전송되었습니다.");
            })
            .catch((e) => {
                alert(e.response.data.message);
                setProcess(false); // 에러 나면 다시 버튼 활성화
            });

            return;
        }

        // 상황 B: 인증번호 입력칸이 떠 있고, 번호를 확인해야 하는 상태
        await axios({
            method: "POST",
            mode: "cors",
            headers: { "Content-Type": "application/json" },
            url: `/mail/check`,
            data: JSON.stringify({ "email": email, "code": verificationCode })
        })
        .then((response) => {
            setVisible(false);           // 인증번호 칸 닫기
            setPasswordInputVisible(true); // 비밀번호 재설정 칸 열기
        })
        .catch((e) => alert(e.response.data.message));
    }

    // --- [3. 화면 렌더링(UI)] ---
    return (
        <Fragment>
            <div className="loginBackGround">
                <div className="loginFrame">
                    {/* 뒤로가기 버튼 (로그인 페이지로) */}
                    <Link to="/login">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-arrow-left Arrows" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </Link>

                    {/* 삼항 연산자를 이용한 조건부 렌더링 */}
                    {passwordInputVisible ? 
                        /* 인증 성공 후: 비밀번호 변경 화면 */
                        <div className="findIDArea">
                            <span className="findIddescription">Please enter your new password.</span>
                            {/* 브라우저 자동완성 방지용 가짜 input */}
                            <input type="password" style={{ display: "none" }} />
                            
                            <input type="password" className="idInput forgotNameInput" placeholder="새로운 password" name="password" onChange={changePassword} style={{ marginBottom: "0px" }} /><br />
                            <input type="password" className="idInput forgotNameInput" placeholder="password 확인" name="checkPassword" onChange={changePassword} style={{ marginBottom: "0px" }} /><br />
                            <button type="submit" className="forgotButton" onClick={requestChangePassword}>비밀번호 재설정</button>
                            <Link to="/login" style={{ textDecoration: "none" }}><span className="backtosignin">Back to Sign in</span></Link>
                        </div>
                        : 
                        /* 인증 전: 이메일 입력 & 인증번호 입력 화면 */
                        <div className="findIDArea">
                            <span className="findIddescription">Please enter the email you use to sign in.</span>
                            <input type="text" className="idInput forgotNameInput" placeholder="Email 입력" onChange={setEmails} style={{ marginBottom: "0px" }} /><br />
                            
                            {/* 인증메일이 발송된 후에만 인증번호 입력창이 나타남 */}
                            {codeVisible ? <input type="text" className="idInput forgotNameInput" placeholder="인증 번호" onChange={inputVerificationCode} style={{ marginBottom: "30px" }} /> : null}
                            
                            <button type="submit" className="forgotButton" onClick={findId}>
                                {codeVisible ? "인증번호 확인" : "인증번호 받기"}
                            </button>
                            <Link to="/login" style={{ textDecoration: "none" }}><span className="backtosignin">Back to Sign in</span></Link>
                        </div>
                    }
                </div>
            </div>
        </Fragment>
    )
}

export default FindID;