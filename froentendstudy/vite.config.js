import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Vite 설정 시작
export default defineConfig({
  // 1. 사용할 플러그인 (리액트 지원)
  plugins: [react()],

  // 2. 경로 별칭 설정 (특정 라이브러리 충돌 방지용)
  resolve: {
    alias: {
      'react/jsx-runtime.js': 'react/jsx-runtime',
    },
  },

  // 3. 개발 서버 및 프록시(중계) 설정 [핵심!]
  server: {
    port: 3000,      // 리액트 실행 포트 (기본 3000번)
    strictPort: true, // 3000번 포트가 사용 중이면 에러 내고 멈춤 (포트 꼬임 방지)

    // [중요] 브라우저의 CORS(보안 정책) 에러를 해결하기 위한 대리인 설정
    // 브라우저는 3000번 주소로 요청을 보내지만, Vite가 8080번으로 배달해줍니다. //비트는 프록시 js못읽음 config로 설정해야함!!!!
    // proxy: {
    //   // (1) 관리자 기능 관련 요청 (/admin/login, /admin/report 등)
    //   '/admin': {
    //     target: 'http://localhost:8080', // 실제 데이터가 있는 스프링 서버 주소
    //     changeOrigin: true,             // 서버가 요청 주소를 8080으로 인식하게 속임
    //     secure: false,                  // https가 아닌 http 환경에서도 허용
    //     ws: true,                       // 웹소켓(카프카/채팅) 통신 허용
    //   },

    //   // (2) 일반 유저 기능 관련 요청 (/users 등)
    //   '/users': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false,
    //   },

    //   // (3) 공통 API 요청 (추후 API 경로를 따로 쓸 경우 대비)
    //   '/api': {
    //     target: 'http://localhost:8080',
    //     changeOrigin: true,
    //     secure: false,
    //   }
    // }
  }
})