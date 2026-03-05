import qs from "qs"; // URL 쿼리 스트링을 파싱(해석)하기 위한 라이브러리

/**
 * OAuthMessageHandler 컴포넌트
 * 역할: 소셜 로그인 완료 후 서버에서 리다이렉트된 URL의 메시지를 처리함
 * 예: http://localhost:5173/oauth-callback?message=로그인성공
 */
const OAuthMessageHandler = () => {
  // 1. window.location.search(URL에서 ? 뒷부분)를 가져와 객체 형태로 변환함
  // ignoreQueryPrefix: true 설정으로 '?' 기호를 제거하고 깔끔하게 데이터만 추출
  const query = qs.parse(window.location.search, {
    ignoreQueryPrefix: true,
  });

  // 2. 서버가 보낸 메시지(query.message)가 있다면 사용자에게 알림창을 띄움
  // 보통 "로그인에 성공했습니다" 또는 에러 메시지가 담겨 있음
  alert(query.message);

  // 3. 처리가 끝났으므로 사용자를 다시 로그인 페이지로 이동시킴
  // replace를 사용하여 뒤로가기 버튼을 눌러도 이 핸들러로 다시 오지 않게 함
  window.location.replace("/login");

  // 이 컴포넌트는 로직만 처리하고 화면에 보여줄 내용은 없으므로 빈 태그 리턴
  return <></>;
};

export default OAuthMessageHandler;
