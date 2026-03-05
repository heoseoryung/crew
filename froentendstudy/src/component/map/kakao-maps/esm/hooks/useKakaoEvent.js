import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect.js';

/**
 * 카카오 지도 객체(마커, 타원, 지도 등)에 이벤트를 등록하는 커스텀 훅이야.
 * @param target   - 이벤트를 걸 대상 (예: 생성된 타원 객체, 마커 객체)
 * @param type     - 이벤트 종류 (예: 'click', 'mouseover', 'dragend')
 * @param callback - 이벤트가 발생했을 때 실행할 쟈기의 함수
 */
const useKakaoEvent = (target, type, callback) => {

  // 1. 브라우저 전역 객체(window)에서 카카오 지도 API를 가져와
  const { kakao } = window;
  
  // 2. 화면이 그려지기 직전에 이벤트를 등록해 (useLayoutEffect의 변형)
  useIsomorphicLayoutEffect(() => {
    // 대상이나 콜백 함수가 없으면 아무것도 안 하고 돌아가 (방어 코드)
    if (!target || !callback) return;

    // 3. [래퍼 함수] 카카오가 주는 인자(arguments)들을 정리해서 쟈기의 콜백에 전달해주는 역할
    const wrapCallback = function () {
      // 카카오 이벤트가 던져주는 인자들을 배열(arg)로 다 수집해
      for (var _len = arguments.length, arg = new Array(_len), _key = 0; _key < _len; _key++) {
        arg[_key] = arguments[_key];
      }
      
      // 인자가 없으면 대상(target)만 보내고, 있으면 대상과 인자를 함께 보내줘
      if (arg === undefined) return callback(target);
      else return callback(target, ...arg);
    };

    // 4. [등록] 카카오 지도 전용 이벤트 리스너를 실행!
    // "이 target에 이 type의 이벤트가 생기면 wrapCallback을 실행해줘"라는 뜻이야.
    kakao.maps.event.addListener(target, type, wrapCallback);

    // 5. [정리] 컴포넌트가 사라지거나 업데이트될 때 등록했던 이벤트를 지워줘 (메모리 관리)
    // 이걸 안 하면 이벤트가 중복으로 계속 쌓여서 사이트가 느려져!
    return () => {
      kakao.maps.event.removeListener(target, type, wrapCallback);
    };
  }, [target, type, callback]); // 대상, 종류, 함수가 바뀔 때마다 다시 설정해
};

export { useKakaoEvent };
