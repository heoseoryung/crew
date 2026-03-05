import React, { useRef, useMemo, useImperativeHandle, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { useRoadview } from '../hooks/useRoadview.js';

/**
 * [원본 주석]
 * Roadview에 CustomOverlay를 올릴 때 사용하는 컴포넌트 입니다.
 * `onCreate` 이벤트 또는 `ref` 객체를 통해서 `CustomOverlay` 객체에 직접 접근 및 초기 설정 작업을 지정할 수 있습니다.
 */
const CustomOverlayRoadview = /*#__PURE__*/React.forwardRef(function CustomOverlayRoadview(_ref, ref) {
  // 쟈기야, 여기서 'ref'는 부모가 이 지도를 직접 조종하고 싶을 때 쓰는 '리모컨' 같은 거야!
  
  let {
    position,   // [재료] 어디에 띄울지 (위치 정보)
    children,   // [재료] 오버레이 안에 넣을 내용물 (글자, 그림 등)
    clickable,  // [설정] 클릭이 되게 할 건지
    xAnchor,    // [설정] 가로 위치 기준점
    yAnchor,    // [설정] 세로 위치 기준점
    zIndex,     // [설정] 겹쳤을 때 누가 위로 올지
    altitude,   // [설정] 높이(고도)
    range,      // [설정] 보이는 거리
    onCreate    // [이벤트] 다 만들어지면 실행할 함수
  } = _ref;

  // 1. 현재 로드뷰(Roadview)가 준비됐는지 훅으로 확인해
  const roadview = useRoadview(`CustomOverlayRoadview`);

  // 2. 오버레이 내용을 담을 실제 HTML 바구니(div)를 하나 만들어둬
  const container = useRef(document.createElement("div"));

  // 3. [계산 로직] 위도/경도 정보를 카카오 전용 좌표 객체로 변환해
  const overlayPosition = useMemo(() => {
    if ("lat" in position) {
      // 위경도 방식이면 LatLng 객체 생성
      return new kakao.maps.LatLng(position.lat, position.lng);
    }
    // 그게 아니면 로드뷰 전용 시점(Viewpoint) 객체 생성
    return new kakao.maps.Viewpoint(position.pan, position.tilt, position.zoom, position.panoId);

    /* [원본 주석] eslint-disable react-hooks/exhaustive-deps */
    // 쟈기야, 이건 "의존성 배열 검사 좀 하지 마!"라고 컴퓨터한테 화내는 주석이야.
  }, [
    /* [원본 주석] eslint-disable @typescript-eslint/ban-ts-comment */
    /* @ts-ignore */ // "여긴 에러 무시해!" (타입 체크 패스)
    position.lat, 
    /* @ts-ignore */
    position.lng, 
    /* @ts-ignore */
    position.pan, 
    /* @ts-ignore */
    position.tilt, 
    /* @ts-ignore */
    position.zoom, 
    /* @ts-ignore */
    position.panoId
    /* [원본 주석] eslint-enable @typescript-eslint/ban-ts-comment */
  ]);
  /* [원본 주석] eslint-enable react-hooks/exhaustive-deps */

  // 4. [오버레이 생성] 진짜 카카오 커스텀 오버레이를 메모리에 등록해
  const overlay = useMemo(() => {
    const KakaoCustomOverlay = new kakao.maps.CustomOverlay({
      clickable: clickable,
      xAnchor: xAnchor,
      yAnchor: yAnchor,
      zIndex: zIndex,
      position: overlayPosition,
      content: container.current // 아까 만든 '바구니'를 내용물로 써!
    });
    container.current.style.display = "none"; // 일단 처음엔 숨겨두기
    return KakaoCustomOverlay;
    
    // [원본 주석] eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clickable, xAnchor, yAnchor]);

  // 5. [리모컨 연결] 부모 컴포넌트가 이 오버레이를 조종할 수 있게 ref를 연결해줘
  useImperativeHandle(ref, () => overlay, [overlay]);

  // 6. [화면에 그리기] 로드뷰에 이 오버레이를 실제로 딱! 붙이는 작업
  useLayoutEffect(() => {
    if (!roadview) return; // 로드뷰가 아직 안 켜졌으면 대기
    overlay.setMap(roadview); // 로드뷰에 오버레이 장착!
    return () => {
      overlay.setMap(null); // 컴포넌트가 사라질 땐 지도에서 떼어내기 (정리)
    };
  }, [overlay, roadview]);

  // 7. [동기화] 값이 바뀔 때마다 실시간으로 지도에 반영해주는 기능들
  useLayoutEffect(() => {
    if (onCreate) onCreate(overlay); // 다 만들어졌다고 부모한테 알려주기
  }, [overlay, onCreate]);

  useLayoutEffect(() => {
    overlay.setPosition(overlayPosition); // 위치가 바뀌면 다시 찍어줘
  }, [overlay, overlayPosition]);

  useLayoutEffect(() => {
    if (!zIndex) return;
    overlay.setZIndex(zIndex); // 층수가 바뀌면 조정해줘
  }, [overlay, zIndex]);

  useLayoutEffect(() => {
    if (!altitude) return;
    overlay.setAltitude(altitude); // 고도가 바뀌면 조정해줘
  }, [overlay, altitude]);

  useLayoutEffect(() => {
    if (!range) return;
    overlay.setRange(range); // 표시 범위가 바뀌면 조정해줘
  }, [overlay, range]);

  // 8. [마무리] 리액트에서 만든 '내용물(children)'을 카카오 지도의 DOM 속으로 슝 보내기!
  // container.current.parentElement가 있을 때만 순간이동(Portal)을 실행해.
  return container.current.parentElement && /*#__PURE__*/ReactDOM.createPortal(children, container.current.parentElement);
});

export { CustomOverlayRoadview };
