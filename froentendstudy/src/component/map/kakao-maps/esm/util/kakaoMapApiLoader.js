import { SIGNATURE } from './constants.js';

const { kakao } = window;

// 1. [상태 표지판] 로딩 상태를 숫자로 정의해둔 거야 (0: 시작, 1: 로딩중, 2: 성공, 3: 실패)
let LoaderStatus = /*#__PURE__*/function (LoaderStatus) {
  LoaderStatus[LoaderStatus["INITIALIZED"] = 0] = "INITIALIZED";
  LoaderStatus[LoaderStatus["LOADING"] = 1] = "LOADING";
  LoaderStatus[LoaderStatus["SUCCESS"] = 2] = "SUCCESS";
  LoaderStatus[LoaderStatus["FAILURE"] = 3] = "FAILURE";
  return LoaderStatus;
}({});

const DEFAULT_ID = `${SIGNATURE}_Loader`;

/**
 * Kakao Map Api Loader
 * 지도를 그리기 전, 카카오 서버에서 스크립트를 비동기로 가져오는 핵심 클래스야.
 */
class Loader {
  static loadEventCallback = new Set(); // 지도 로딩 후 실행할 함수들을 모아두는 바구니
  callbacks = []; // 이 로더가 끝난 뒤 실행할 콜백 리스트
  done = false;   // 완료 여부
  loading = false; // 현재 로딩 중인지
  errors = [];    // 에러 기록

  constructor(_ref) {
    let {
      appkey,           // 카카오 앱키 (필수!)
      id = DEFAULT_ID,  // 스크립트 태그에 붙일 ID
      libraries = [],   // 추가로 쓸 라이브러리 (drawing, services 등)
      nonce,            // 보안용 암호화 값
      retries = 3,      // 실패 시 몇 번 더 시도할 건지
      url = "//dapi.kakao.com/v2/maps/sdk.js" // 카카오 서버 주소
    } = _ref;

    this.id = id;
    this.appkey = appkey;
    this.libraries = libraries;
    this.nonce = nonce;
    this.retries = retries;
    this.url = url;

    // [싱글톤 패턴] 로더가 여러 개 생기지 않게 관리해. 이미 있으면 기존 거 쓰게 함!
    if (Loader.instance) {
      if (Loader.instance.status !== LoaderStatus.FAILURE && !Loader.equalOptions(this.options, Loader.instance.options)) {
        throw new Error(`로더는 다른 옵션으로 중복 호출될 수 없어 쟈기야!`);
      }
      Loader.instance.reset();
    }
    Loader.instance = this;
  }

  // 현재 설정값들을 가져오는 도구
  get options() {
    return {
      appkey: this.appkey,
      id: this.id,
      libraries: this.libraries,
      nonce: this.nonce,
      retries: this.retries,
      url: this.url
    };
  }

  // API가 로드되면 실행할 함수를 등록해
  static addLoadEventLisnter(callback) {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(callback); // 이미 로딩됐으면 바로 실행
    }
    Loader.loadEventCallback.add(callback);
    return callback;
  }

  // 2. [핵심 함수] 실제로 지도를 불러오기 시작하는 함수 (Promise 반환)
  load() {
    return new Promise((resolve, reject) => {
      this.loadCallback(err => {
        if (!err) {
          resolve(window.kakao); // 성공하면 kakao 객체를 돌려줌
        } else {
          reject(err); // 실패하면 에러를 던짐
        }
      });
    });
  }

  // 현재 상태를 글자가 아닌 숫자로 알려줘 (상태값 체크용)
  get status() {
    if (this.onEvent) return LoaderStatus.FAILURE;
    if (this.done) return LoaderStatus.SUCCESS;
    if (this.loading) return LoaderStatus.LOADING;
    return LoaderStatus.INITIALIZED;
  }

  // 재시도까지 다 했는데도 실패했는지 확인
  get failed() {
    return this.done && !this.loading && this.errors.length >= this.retries + 1;
  }

  loadCallback(fn) {
    this.callbacks.push(fn);
    this.execute();
  }

  // 재시도 실패 시 초기화
  resetIfRetryingFailed() {
    if (this.failed) this.reset();
  }

  // 상태 초기화 및 기존 스크립트 삭제
  reset() {
    this.deleteScript();
    this.done = true;
    this.loading = false;
    this.errors = [];
    this.onEvent = undefined;
  }

  // 3. [실행부] 실제로 로딩을 시작할지 결정
  execute() {
    this.resetIfRetryingFailed();
    if (this.done) {
      this.callback();
    } else {
      // 이미 지도가 있으면 경고 띄우고 바로 콜백 실행
      if (window.kakao && window.kakao.maps) {
        console.warn("카카오 지도가 이미 로딩되어 있어!");
        window.kakao.maps.load(this.callback);
        return;
      }
      // 로딩 시작! 스크립트 태그를 HTML에 삽입해
      if (!this.loading) {
        this.loading = true;
        this.setScript();
      }
    }
  }

  // 4. [태그 삽입] <script> 태그를 만들어 head에 붙여
  setScript() {
    if (document.getElementById(this.id)) {
      this.callback();
    }
    const url = this.createUrl();
    const script = document.createElement("script");
    script.id = this.id;
    script.type = "text/javascript";
    script.src = url;
    script.onerror = this.loadErrorCallback.bind(this); // 에러 나면 여기로
    script.onload = this.callback.bind(this);           // 로드 되면 여기로
    script.defer = true;
    script.async = true;
    if (this.nonce) script.nonce = this.nonce;
    document.head.appendChild(script); // 드디어 HTML에 지도가 들어온다!
  }

  // 5. [에러 처리] 실패하면 일정 시간 뒤에 자동으로 재시도해 (기특하지?)
  loadErrorCallback(event) {
    this.errors.push(event);
    if (this.errors.length <= this.retries) {
      const delay = this.errors.length * 2 ** this.errors.length; // 2초, 4초... 점점 늦게 시도
      console.log(`로딩 실패, ${delay}ms 뒤에 다시 시도할게!`);
      setTimeout(() => {
        this.deleteScript();
        this.setScript();
      }, delay);
    } else {
      // 끝내 안 되면 실패 처리
      this.done = true;
      this.loading = false;
      this.onEvent = this.errors[this.errors.length - 1];
      this.callbacks.forEach(cb => cb(this.onEvent));
      this.callbacks = [];
      Loader.loadEventCallback.forEach(cb => cb(this.onEvent));
    }
  }

  // 카카오 서버에 보낼 URL 조립 (appkey, libraries 등 포함)
  createUrl() {
    let url = this.url;
    url += `?appkey=${this.appkey}`;
    if (this.libraries.length) {
      url += `&libraries=${this.libraries.join(",")}`;
    }
    url += `&autoload=false`; // 자동 실행 방지 (수동으로 제어할 거니까!)
    return url;
  }

  // HTML에서 스크립트 태그 지우기
  deleteScript() {
    const script = document.getElementById(this.id);
    if (script) script.remove();
  }

  // 6. [마무리] 지도가 진짜로 준비됐을 때 실행
  callback() {
    kakao.maps.load(() => { // 카카오 내부 함수인 maps.load를 실행
      this.done = true;
      this.loading = false;
      // 대기 중이던 모든 콜백 함수를 실행시켜!
      this.callbacks.forEach(cb => cb(this.onEvent));
      this.callbacks = [];
      Loader.loadEventCallback.forEach(cb => cb(this.onEvent));
    });
  }

  // 두 로더의 옵션이 같은지 비교하는 함수
  static equalOptions(a, b) {
    if (a.appkey !== b.appkey) return false;
    if (a.id !== b.id) return false;
    if (a.libraries.length !== b.libraries.length) return false;
    for (let i = 0; i < a.libraries.length; ++i) {
      if (a.libraries[i] !== b.libraries[i]) return false;
    }
    if (a.nonce !== b.nonce) return false;
    if (a.retries !== b.retries) return false;
    if (a.url !== b.url) return false;
    return true;
  }
}

export { Loader, LoaderStatus };
