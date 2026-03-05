import axios from 'axios';
import { Fragment, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../_style/loginScreen.css'; // 로그인 화면 스타일
// 소셜 로그인 버튼 이미지들
import img02 from '../../_image/googleLoginButton.png';
import img03 from '../../_image/kakaoLogInButton.png';
import img04 from '../../_image/naverLoginButton.png';

const Logins = () => {
    // --- [1. 상태 관리(State)] ---
    const [idInfo, setInfo] = useState({
        id: '', // 사용자 아이디
        pw: ''  // 사용자 비밀번호
    });

    // API 요청 시 공통으로 사용할 헤더 설정
    const headers = {
        "Content-Type": "application/json"
    }

    // 백엔드 서버 주소 (스프링 부트 서버)
    const serverUrl = "localhost:8080";

    // --- [2. 소셜 로그인 함수] ---
    // 백엔드의 OAuth2 엔드포인트로 리다이렉트 시킴
    // 스프링 시큐리티가 이 주소를 낚아채서 각 플랫폼 로그인창으로 보냄
    const kakaoLogin = () => {
        window.location.replace(`http://${serverUrl}/oauth2/authorization/kakao`);
    }
    const googleLogin = () => {
        window.location.replace(`http://${serverUrl}/oauth2/authorization/google`);
    }
    const naverLogin = () => {
        window.location.replace(`http://${serverUrl}/oauth2/authorization/naver`);
    }
    
    // --- [3. 일반 로그인 함수] ---
    const signUp = async () => {
        try {
            const response = await axios({
                method: "POST",
                url: `http://localhost:8080/logins`, // Vite 프록시 설정이 되어있어야 함
                headers: headers,
                 withCredentials: true,
                data: JSON.stringify({ "id": idInfo.id, "password": idInfo.pw })
            });
            
            // 로그인 성공 시 서버 메시지 띄우고 게시판으로 이동
            alert(response.data.message);
            window.location.replace('/noticelist');
        } catch (e) {
            // 로그인 실패 시 에러 메시지 표시
            alert(e.response.data.message);
        }
    }

    // --- [4. 초기 실행 (로그인 체크)] ---
    useEffect(() => {
        // 이미 로그인한 정보(localStorage)가 있는지 확인
        const checkLogin = () => {
            const getCookieStat = localStorage.getItem('userId');
            // 정보가 있다면 굳이 로그인 페이지에 있을 필요 없으니 게시판으로 튕겨냄
            if (getCookieStat !== null && getCookieStat !== undefined) {
                window.location.replace('/noticelist');
            }
        };
        
        checkLogin();
    }, []); // 빈 배열: 컴포넌트가 처음 나타날 때 딱 한 번 실행

    // --- [5. 입력값 처리 핸들러] ---
    const changeIdPw = (e) => {
        const { name, value } = e.target;
        // 아이디나 비번 입력 시 실시간으로 idInfo 상태 업데이트
        setInfo({ ...idInfo, [name]: value });
    }
    
    return (
        <Fragment>
            <div className="loginBackGround">
                <div className="loginFrame">
                    {/* 게시판으로 돌아가는 뒤로가기 화살표 */}
                    <Link to="/noticelist">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-arrow-left Arrows" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </Link>

                    {/* 회원가입 페이지 이동 버튼 */}
                    <Link to="/register"><span className='registers'>Register</span></Link>
                    
                    <div className="loginArea">
                        <form onSubmit={(e) => e.preventDefault()}> {/* form 엔터 시 새로고침 방지 */}
                            {/* 아이디 입력창 */}
                            <input type="text" className="idInput" placeholder="Username" name="id" onChange={changeIdPw} />
                            {/* 비밀번호 입력창 */}
                            <input type="password" className="pwInput" placeholder="password" name="pw" onChange={changeIdPw} /><br />
                            {/* 비밀번호 찾기 이동 */}
                            <Link to="/findid"><span className="findId">Forgot your Password?</span></Link>
                        </form>

                        <div className="loginbuttonarea">
                            {/* 일반 로그인 실행 버튼 */}
                            <button type="submit" className="sbButton" onClick={signUp}>로그인</button>
                            {/* 비회원 구경하기 버튼 */}
                            <button type="button" className="sbButton sbButton2" onClick={() => window.location.replace('/noticelist')}>로그인 없이 보기</button>
                        </div>

                        {/* 소셜 로그인 버튼 모음 */}
                        <div className="socialLogin">
                            <img src={img03} alt="카카오 로그인" className="socialLoginButton" onClick={kakaoLogin}/>
                            <img src={img02} alt="구글 로그인" className="socialLoginButton" onClick={googleLogin}/>
                            <img src={img04} alt="네이버 로그인" className="socialLoginButton" onClick={naverLogin}/>
                        </div>
                    </div>
                </div>
            </div>
        </Fragment>
    )
}

export default Logins;