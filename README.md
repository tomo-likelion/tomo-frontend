# TOMO — Chrome Extension (Frontend)

Gmail 작성창 옆 Side Panel에서 문화·언어·업무 관계 맥락을 분석하고
현지화된 이메일을 추천하는 Chrome Extension 프론트엔드입니다.

## 폴더 구조

```
tomo-extension/
├── manifest.json              # MV3 설정 (side_panel, content_script, background)
├── sidepanel.html             # Side Panel React 엔트리
├── vite.config.js
├── package.json
├── scripts/copy-manifest.js   # build 후 manifest.json → dist 복사
├── public/icons/              # 확장 아이콘 (임시 플레이스홀더, 교체 필요)
└── src/
    ├── background/background.js   # 아이콘 클릭 시 Side Panel open
    ├── content/content-script.js  # Gmail DOM 탐색/추출/적용 (F-003~F-005, F-017)
    └── sidepanel/
        ├── App.jsx             # 화면 상태 머신: landing → matched → loading → result
        ├── App.css             # 다크 + 라임 그린 테마
        ├── gmailBridge.js       # content script와 메시지 통신
        ├── api/client.js        # 백엔드 API 클라이언트 (recipients / email-analyses)
        └── components/
            ├── LandingScreen.jsx     # 수신자 미확인 상태
            ├── MatchedScreen.jsx     # 화면1: 수신자 확인 + 분석 요청
            ├── LoadingScreen.jsx     # Frame3: AI 분석 중
            ├── ResultScreen.jsx      # Frame4~7: 점수/위험이슈/변경이유/추천이메일
            └── UsageGuideModal.jsx   # 화면3: 사용 가이드
```

## 화면 흐름 매핑 (첨부 디자인 기준)

| 디자인 프레임 | 컴포넌트 | 상태(screen) |
| --- | --- | --- |
| 랜딩(수신자 없음) | `LandingScreen` | `landing` |
| Frame 1 (수신자 정보 + 분석 요청) | `MatchedScreen` | `matched` |
| Frame 2 (수신자 매칭 요약) | `MatchedScreen` 상단 카드 | `matched` |
| Frame 3 (AI 분석 중) | `LoadingScreen` | `loading` |
| Frame 4 (점수 + 위험 이슈) | `ResultScreen` (분석결과 → 위험 이슈) | `result` |
| Frame 5~6 (추천 이메일) | `ResultScreen` (추천 이메일 탭) | `result` |
| Frame 7 (변경 이유) | `ResultScreen` (분석결과 → 변경 이유) | `result` |
| 사용 가이드 화면 | `UsageGuideModal` | 오버레이 |

## 실행 방법 (VS Code)

```bash
cd tomo-extension
npm install
npm run dev      # 로컬 개발 서버 (side panel만 브라우저 프리뷰용)
npm run build    # dist/ 생성 + manifest.json 자동 복사
```

1. `npm run build` 실행 → `dist/` 폴더 생성
2. Chrome 주소창에 `chrome://extensions` 이동
3. 우측 상단 "개발자 모드" 켜기
4. "압축해제된 확장 프로그램을 로드합니다" 클릭 → `dist/` 폴더 선택
5. Gmail(`https://mail.google.com`)에서 이메일 작성 시작
6. 확장 아이콘 클릭 → Side Panel 열림

코드 수정 후에는 `npm run build`를 다시 실행하고, `chrome://extensions`에서
새로고침 버튼을 눌러 반영합니다. (`npm run watch`로 파일 변경 시 자동 재빌드 가능)

## 백엔드 연동

`src/sidepanel/api/client.js`의 `BASE_URL`이 `http://localhost:8080/api/v1`로
고정되어 있습니다. 백엔드 포트/도메인이 다르면 이 값을 수정하세요.
백엔드가 로컬이 아닌 곳에 배포되면 `manifest.json`의 `host_permissions`에도
해당 origin을 추가해야 CORS/권한 문제가 없습니다.

## 주의사항 / TODO

- `content-script.js`의 Gmail DOM 선택자는 Gmail의 실제 마크업에 맞춰
  **직접 브라우저 개발자 도구로 재확인 후 조정**이 필요합니다. Gmail은
  클래스명이 난독화되어 있고 버전에 따라 달라질 수 있습니다.
- `public/icons/*.png`는 임시 플레이스홀더입니다. 실제 로고로 교체하세요.
- MVP 범위(기능 명세서 기준)에 따라 로그인, 결제, 히스토리 조회 UI는
  구현하지 않았습니다.
- 수신자 프로필은 DB 초기 데이터로 하드코딩(F-006)하는 것이 전제이므로,
  프론트에는 등록 UI가 없습니다.
