import { useContext } from 'react';
import { KakaoRoadviewContext } from '../components/Roadview.js';

/**
 * [해설] 카카오 로드뷰(Roadview) 객체를 어디서든 편하게 꺼내 쓸 수 있게 해주는 커스텀 훅이야.
 * 로드뷰 안에서만 작동하도록 설계되어 있어!
 */
const useRoadview = componentName => {
  // 1. [수신] 전역 보관소(Context)에서 '현재 로드뷰 객체'를 꺼내와.
  const kakaoRoadview = useContext(KakaoRoadviewContext);

  // 2. [검사] 만약 꺼내왔는데 아무것도 없다면? (null이라면)
  if (!kakaoRoadview) {
    // 쟈기야, 이건 "지도(로드뷰)도 안 그려놓고 왜 오버레이를 그리려고 해!"라고 화내는 에러야.
    // 반드시 <Roadview> 태그 안에서 이 훅을 써야 한다는 뜻이지!
    throw new Error(`${componentName ? componentName + " Component" : "useRoadview"} must exist inside Roadview Component!`);
  }

  // 3. [반환] 검사를 통과했다면 안전하게 로드뷰 객체를 넘겨줘.
  return kakaoRoadview;
};

export { useRoadview };