import axios from "axios";
import { Fragment, useState, useRef } from "react"
import { Link } from "react-router-dom";
import '../../_style/loginScreen.css'

const Register = () => {
    // --- [1. 상태 관리(State)] ---
    const [idInfo, setIdInfo] = useState({
        id: '',
        email: '',
        pw: '',
        checkpw: ''
    });
    const [codeVerification, setCodeVerification] = useState(''); // 사용자가 입력한 인증번호
    const [codeMode, setCodeMode] = useState(false);              // 인증번호 입력 화면 전환 여부

    const [showpw, setShowPw] = useState('password');             // 비밀번호 보이기/숨기기 (type="password" vs "text")
    const imageInput = useRef();                                  // 파일 선택창(input type="file")에 접근하기 위한 Ref
    const [profileImage, setProfileImage] = useState();           // 실제 이미지 파일 객체 저장
    const [imageName, setImageName] = useState("프로필 이미지를 꼭 선택해주세요. ( 필수 ) "); // 화면에 표시할 파일명
    const [isProcessing, setProcessing] = useState(false);        // 가입 버튼 중복 클릭 방지

    // 입력값 변경 시 idInfo 객체 업데이트
    const setinfo = (e) => {
        const { name, value } = e.target;
        setIdInfo({ ...idInfo, [name]: value });
    }

    // 인증번호 입력값 업데이트
    const inputCodeVerification = (e) => {
        setCodeVerification(e.target.value);
    }

    // 비밀번호 표시 체크박스 토글
    const showPwBt = () => { 
        showpw === 'password' ? setShowPw('text') : setShowPw('password'); 
    }

    // --- [2. 이미지 유효성 검사] ---
    const checkValidImage = (e) => {
        const file = e.target.files[0];
        if (!file) return false;

        // 1. 용량 제한 (10MB)
        if (file.size > 10 * 1024 * 1024) {
            alert("10MB가 넘는 파일은 제외되었습니다.");
            return false;
        } 
        // 2. 파일명 길이 제한
        else if (file.name.length > 30) {
            alert("파일명이 30자가 넘는 파일은 제외되었습니다.");
            return false;
        } 
        // 3. 확장자 제한 (jpg, png만 허용)
        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType === 'jpg' || fileType === 'png') {
            setImageName(file.name);
            return true;
        }

        alert("jpg, png 파일만 업로드할 수 있습니다.");
        return false;
    }

    // 이미지 업로드 핸들러
    const uploadImage = (e) => {
        if (checkValidImage(e)) {
            setProfileImage(e.target.files); // 검증 통과 시 파일 상태 저장
        }
    }

    // --- [3. 가입 데이터 유효성 검사] ---
    const checkValid = () => {
        if (imageName.includes("필수")) {
            alert('프로필 이미지를 꼭 선택해주세요.');
            return false;
        }
        if (idInfo.email.length <= 3) {
            alert('이메일을 꼭 입력해주세요.');
            return false;
        }
        if (idInfo.id.length <= 3) {
            alert('아이디는 4자 이상 입력해주세요.');
            return false;
        }
        if (idInfo.pw.length <= 5) {
            alert('비밀번호는 6자 이상 입력해주세요.');
            return false;
        }
        if (idInfo.pw !== idInfo.checkpw) {
            alert('비밀번호가 일치하지 않습니다.');
            return false;
        }
        return true;
    }

    // --- [4. 이메일 인증번호 전송] ---
    const sendCode = async () => {
        if (!checkValid()) return;

        // 먼저 아이디/이메일 중복 체크 (서버 상황에 맞춰 GET 요청)
        await axios({
            method: "GET",
            mode: "cors",
            url: `/users/${idInfo.email}/${idInfo.id}`
        })
        .then(async (response) => {
            alert("인증번호가 전송되었습니다.");
            setCodeMode(true); // 인증번호 입력창으로 전환

            // 실제 메일 발송 API 호출
            await axios({
                method: "POST",
                mode: "cors",
                url: `/mail/send`,
                headers: { "Content-Type": "application/json" },
                data: JSON.stringify({ "email": idInfo.email })
            });
        })
        .catch((e) => alert(e.response.data.message));
    }

    // --- [5. 인증번호 확인 후 회원가입 실행] ---
    const checkVerificationCode = async () => {
        await axios({
            method: "POST",
            mode: "cors",
            url: `/mail/check`,
            headers: { "Content-Type": "application/json" },
            data: JSON.stringify({ "email": idInfo.email, "code": codeVerification })
        }).then((response) => {
            regist(); // 인증 성공 시 실제 가입 함수 호출
        }).catch((e) => {
            alert(e.response.data.message)
        });
    }

    // --- [6. 최종 회원가입 (FormData 전송)] ---
    const regist = async () => {
        if(!isProcessing) {
            setProcessing(true); // 가입 절차 시작 (버튼 비활성화 효과)
        } else {
            alert("처리중입니다.");
            return;
        }

        // JSON 데이터와 이미지 파일을 함께 보내기 위해 FormData 사용
        const jsonData = { 
            "id": idInfo.id, 
            "email": idInfo.email, 
            "password": idInfo.pw, 
            "checkPassword": idInfo.checkpw 
        };
        
        let requestForm = new FormData();
        // JSON 데이터를 Blob 객체로 만들어 "data"라는 이름으로 추가 (Spring의 @RequestPart와 매칭)
        requestForm.append("data", new Blob([JSON.stringify(jsonData)], { type: "application/json" }));
        // 이미지 파일 추가
        requestForm.append('image', profileImage[0]);

        await axios({
            method: "POST",
            mode: "cors",
            url: `/registers`,
            headers: { 'Content-Type': 'multipart/form-data' }, // 파일 전송 필수 헤더
            data: requestForm
        })
        .then((response) => { 
            alert(response.data.message); 
            window.location.replace('/login'); 
        })
        .catch((e) => {
            alert(e.response.data.message);
            setProcessing(false); // 에러 시 다시 클릭 가능하게 변경
        });
    }

    return (
        <Fragment>
            <div className="loginBackGround">
                <div className="loginFrame">
                    {/* 뒤로 가기 화살표 */}
                    <Link to="/login">
                        <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" className="bi bi-arrow-left Arrows" viewBox="0 0 16 16">
                            <path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z" />
                        </svg>
                    </Link>

                    {!codeMode ? (
                        /* 단계 1: 정보 입력 및 이미지 선택 화면 */
                        <div className="registerArea">
                            <form onSubmit={(e) => e.preventDefault()}>
                                <input type="text" className="idInput" placeholder="Username" name="id" onChange={setinfo} />
                                <input type="text" className="pwInput" placeholder="Email" name="email" onChange={setinfo} />
                                <input type={showpw} className="pwInput" placeholder="password" name="pw" onChange={setinfo} />
                                <input type={showpw} className="pwInput" placeholder="Confirm password" name="checkpw" onChange={setinfo} /><br />
                            </form>
                            <label className="showPw">
                                <input type="checkbox" className="showPw" onClick={showPwBt} /> 비밀번호 표시
                            </label>
                            <br />
                            <span className="pwChecking">아이디는 4자 이상, 비밀번호는 6자 이상 입력해주세요.</span>
                            
                            {/* 실제 파일 input은 숨기고, 커스텀 버튼으로 클릭 유도 */}
                            <button type="button" onClick={() => imageInput.current.click()} className="sbButton">프로필 사진</button>
                            <input type="file" onChange={uploadImage} name="file" ref={imageInput} style={{ display: "none" }} />
                            <span className="imageName">{imageName}</span>
                            
                            <button type="submit" className="sbButton" onClick={sendCode}>인증번호 전송</button>
                        </div>
                    ) : (
                        /* 단계 2: 인증번호 확인 화면 */
                        <div className="codeVerification">
                            <form onSubmit={(e) => e.preventDefault()}>
                                {/* 자동완성 방지용 가짜 input들 */}
                                <input type="text" style={{display:"none"}}/><input type="text" style={{display:"none"}}/>
                                <input type="text" className="verificationInput" placeholder="인증번호 입력" name="verification" onChange={inputCodeVerification} />
                            </form>
                            <button type="submit" className="sbButton" onClick={checkVerificationCode}>회원가입</button>
                        </div>
                    )}
                </div>                
            </div>
        </Fragment>
    )
}

export default Register;