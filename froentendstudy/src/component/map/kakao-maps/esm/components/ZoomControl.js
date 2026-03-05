import React, { useMemo, useImperativeHandle, useEffect } from 'react';
import { useMap } from '../hooks/useMap.js';

/**
 * [해설] 지도에 확대/축소(+/-) 버튼을 달아주는 컴포넌트야.
 */
const ZoomControl = /*#__PURE__*/React.forwardRef(function ZoomControl(_ref, ref) {
  // 1. [설정] 부모가 위치(position)를 안 정해주면 기본으로 '오른쪽(RIGHT)'에 둬.
  let {
    position: _position = kakao.maps.ControlPosition.RIGHT
  } = _ref;

  // 2. [수신] 이 컨트롤이 올라갈 '지도 객체'를 가져와.
  const map = useMap(`ZoomControl`);

  // 3. [변환] 위치값이 'TOPRIGHT' 같은 문자열로 들어오면 카카오 전용 숫자값으로 바꿔줘.
  const position = typeof _position === "string" ? kakao.maps.ControlPosition[_position] : _position;

  // 4. [생성] 카카오의 진짜 ZoomControl 객체를 딱 한 번만 메모리에 만들어둬.
  const ZoomControl = useMemo(() => {
    return new kakao.maps.ZoomControl();
  }, []);

  // 5. [연결] 부모 컴포넌트가 이 버튼 객체를 직접 제어하고 싶을 때를 대비한 리모컨(ref) 연결.
  useImperativeHandle(ref, () => ZoomControl, [ZoomControl]);

  // 6. [장착 및 해제] 핵심! 지도가 준비되면 버튼을 달고, 컴포넌트가 사라지면 버튼을 떼.
  useEffect(() => {
    // "지도야, 이 버튼을 지정된 위치에 달아줘!"
    map.addControl(ZoomControl, position);

    // "이 컴포넌트가 사라질 땐 지도에서 버튼도 빼줘!" (Clean-up)
    return () => {
      map.removeControl(ZoomControl);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, position]); // 지도나 위치가 바뀌면 다시 실행해!

  // 7. [출력] 화면에 리액트 HTML을 직접 그리지는 않으니까 null을 반환해.
  return null;
});

export { ZoomControl };
