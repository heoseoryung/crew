import { useLayoutEffect, useEffect } from 'react';

/**
 * [해설] 
 * Isomorphic(이소모픽)이란 '서버와 클라이언트에서 동일하게 작동한다'는 뜻이야.
 * 브라우저 환경인지 서버 환경인지에 따라 가장 적절한 훅을 골라서 내보내주는 똑똑한 녀석이지!
 */

const useIsomorphicLayoutEffect = 
  // 1. [환경 체크] 지금 이 코드가 '브라우저'에서 돌아가고 있니? (window와 document가 있니?)
  typeof window !== "undefined" && typeof document !== "undefined" 
    ? useLayoutEffect  // 2-1. 브라우저라면? 화면을 그리기 직전에 실행되는 'useLayoutEffect'를 써!
    : useEffect;       // 2-2. 서버(Next.js 등)라면? 화면 개념이 없으니 일반 'useEffect'를 써!

export { useIsomorphicLayoutEffect };
