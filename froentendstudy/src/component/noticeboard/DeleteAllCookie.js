import axios from "axios";

/**
 * [해설] 로그아웃 시 서버와 클라이언트의 인증 정보를 모두 삭제하는 함수야.
 */
export function deleteAllToken () {
    // 1. [서버 통신] 우리 백엔드 서버한테 로그아웃 사실을 알려줘.
    axios({
        method: "POST",
        mode: "cors", // 다른 도메인(포트)끼리 통신할 수 있게 해주는 보안 설정
        url: `/user/logout`,
    });

    // 2. [로컬 삭제] 브라우저(LocalStorage)에 저장해뒀던 유저 아이디를 삭제해.
    // 쟈기야, 이걸 안 지우면 다음에 접속했을 때 여전히 로그인된 것처럼 보일 수 있어!
    localStorage.removeItem("userId");

    // 3. [구글 로그아웃] 쟈기가 주석 처리해둔 부분이야. 
    // 구글 계정 자체를 로그아웃시키고 다시 우리 사이트 로그인 페이지로 보내는 코드네!
    
    // window.location.href = 
    // "https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000/login";
    
    /* 쟈기의 요청대로 수정한 코드야! 
       실제 배포할 때는 localhost:3000 대신 쟈기의 진짜 도메인 주소를 써야 해. */
    // window.location.href = "https://accounts.google.com/Logout?continue=https://appengine.google.com/_ah/logout?continue=http://localhost:3000/login";
}