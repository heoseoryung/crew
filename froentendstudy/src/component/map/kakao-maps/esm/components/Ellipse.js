import React, { useMemo, useImperativeHandle, useLayoutEffect } from 'react';
import { useKakaoEvent } from '../hooks/useKakaoEvent.js';
import { useMap } from '../hooks/useMap.js';

/**
 * Map 상에 타원을 그리는 컴포넌트입니다.
 */
const Ellipse = /*#__PURE__*/React.forwardRef(function Ellipse(_ref, ref) {
  // 1. 부모로부터 타원을 그릴 때 필요한 설정값(Props)을 다 받아와
  let {
    center,         // 타원의 중심 좌표 (lat, lng)
    rx,             // 가로 반지름
    ry,             // 세로 반지름
    fillColor,      // 채우기 색상
    fillOpacity,    // 채우기 투명도
    strokeColor,    // 선 색상
    strokeOpacity,  // 선 투명도
    strokeStyle,    // 선 스타일 (점선 등)
    strokeWeight,   // 선 두께
    zIndex,         // 겹침 순서
    onMouseover,    // 마우스 올렸을 때 이벤트
    onMouseout,     // 마우스 뺐을 때 이벤트
    onMousemove,    // 마우스 움직일 때 이벤트
    onMousedown,    // 마우스 눌렀을 때 이벤트
    onClick,        // 클릭했을 때 이벤트
    onCreate        // 타원이 생성된 후 실행할 콜백
  } = _ref;

  // 2. 현재 이 타원이 그려질 '지도 객체'를 훅으로 가져와
  const map = useMap(`Ellipse`);

  // 3. [데이터 변환] 리액트의 center 객체를 카카오 전용 좌표 객체로 변환 (useMemo로 최적화)
  const ellipseCenter = useMemo(() => {
    return new kakao.maps.LatLng(center.lat, center.lng);
  }, [center.lat, center.lng]);

  // 4. [객체 생성] 진짜 카카오 타원(kakao.maps.Ellipse) 객체를 딱 한 번만 만들어
  const ellipse = useMemo(() => {
    return new kakao.maps.Ellipse({
      center: ellipseCenter,
      rx,
      ry,
      fillColor,
      fillOpacity,
      strokeColor,
      strokeOpacity,
      strokeStyle,
      strokeWeight,
      zIndex
    });
    // 처음에만 만들고, 나머지는 아래의 useLayoutEffect에서 실시간으로 수정해줄 거야
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 5. [리모컨] 부모가 ref를 통해 이 타원 객체를 직접 제어할 수 있게 연결해줘
  useImperativeHandle(ref, () => ellipse, [ellipse]);

  // 6. [지도 장착] 화면에 나타날 때 지도에 타원을 올리고, 사라질 때 내려 (Clean-up)
  useLayoutEffect(() => {
    ellipse.setMap(map); // 지도에 표시!
    return () => {
      ellipse.setMap(null); // 컴포넌트 삭제 시 지도에서도 삭제!
    };
  }, [map, ellipse]);

  // 7. [생성 알림] 타원이 준비됐으면 부모한테 보고해!
  useLayoutEffect(() => {
    if (onCreate) onCreate(ellipse);
  }, [ellipse, onCreate]);

  // 8. [실시간 동기화] Props(center, rx, ry 등)가 바뀌면 라이브러리 함수를 호출해서 타원을 수정해
  useLayoutEffect(() => {
    if (ellipse) ellipse.setPosition(ellipseCenter); // 중심좌표 변경 시
  }, [ellipse, ellipseCenter]);

  useLayoutEffect(() => {
    ellipse.setRadius(rx, ry); // 반지름 변경 시
  }, [ellipse, rx, ry]);

  useLayoutEffect(() => {
    if (!zIndex) return;
    ellipse.setZIndex(zIndex); // 층수 변경 시
  }, [ellipse, zIndex]);

  // 여러 옵션(색상, 두께 등)을 한꺼번에 업데이트!
  useLayoutEffect(() => {
    ellipse.setOptions({
      fillColor,
      fillOpacity,
      strokeColor,
      strokeOpacity,
      strokeStyle,
      strokeWeight
    });
  }, [ellipse, fillColor, fillOpacity, strokeColor, strokeOpacity, strokeStyle, strokeWeight]);

  // 9. [이벤트 연결] 카카오 전용 이벤트 시스템과 리액트 함수를 연결해줘
  useKakaoEvent(ellipse, "mouseover", onMouseover);
  useKakaoEvent(ellipse, "mouseout", onMouseout);
  useKakaoEvent(ellipse, "mousemove", onMousemove);
  useKakaoEvent(ellipse, "mousedown", onMousedown);
  useKakaoEvent(ellipse, "click", onClick);

  // 10. 중요! 타원은 지도 라이브러리가 직접 그리는 거라 리액트가 따로 HTML을 뱉을 필요가 없어.
  return null; 
});

export { Ellipse };