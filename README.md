# Solar AI

Upstage API 기반 문서 분석 및 AI 채팅 데모 애플리케이션

## 기술 스택

- **Frontend**: React 19 + TypeScript + Vite
- **UI**: Ant Design
- **Backend**: Vercel Serverless Functions
- **AI**: Upstage Solar Pro 2

## 주요 기능

### 구현된 기능

- **AI 채팅**: Upstage Solar Pro 2 모델을 활용한 실시간 스트리밍 대화
- **문서 업로드**: PDF, Word, Excel, PowerPoint, 이미지 파일 지원
- **문서 파싱**: 업로드된 문서를 텍스트/HTML로 변환
- **OCR**: 이미지에서 텍스트 추출
- **정보 추출**: 문서에서 구조화된 데이터 자동 추출 (이름, 계좌번호, 금액 등)
- **다크모드**: 라이트/다크 테마 전환
- **반응형 UI**: 모바일/데스크톱 대응

## 프로젝트 구조

```
solar/
├── src/
│   ├── api/solar.ts          # Upstage 채팅 API 클라이언트
│   ├── components/           # React 컴포넌트
│   │   ├── ChatArea.tsx      # 채팅 영역
│   │   └── Sidebar.tsx       # 사이드바
│   ├── hooks/useChat.ts      # 채팅 상태 관리
│   └── services/             # API 서비스
│       ├── documentService.ts
│       └── extractionService.ts
├── api/                      # Vercel Serverless 함수
│   ├── document-parse.ts     # 문서 파싱
│   ├── information-extract.ts # 정보 추출
│   └── ocr.ts                # OCR
└── ...
```

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build
```

## 환경 변수

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```
UPSTAGE_API_KEY=your_api_key_here
```

## 미구현 사항 및 이유

> **참고**: 본 프로젝트는 실제 프로덕트가 아닌 **데모용**으로, 핵심 AI 기능 시연에 집중하여 제작되었습니다.

### 데이터베이스

- **상태**: 미구현 (MongoDB, PostgreSQL 등 DB 연동 없음)
- **이유**: 데모 목적으로 기능 시연에 집중
- **영향**: 채팅 기록이 새로고침 시 사라짐 (클라이언트 메모리에만 저장)

### 사용자 인증 (JWT)

- **상태**: 미구현 (로그인/회원가입, JWT 토큰 인증 없음)
- **이유**: 데모 목적으로 인증 없이 즉시 사용 가능하도록 구현
- **프로덕션 필요 사항**: 사용자별 채팅 기록 저장, 접근 권한 관리

### 미들웨어

- **상태**: 미구현 (Rate limiting, 요청 검증 등)
- **이유**: 데모용으로 최소한의 구현에 집중
- **프로덕션 필요 사항**: API 남용 방지, 보안 강화, CORS 설정

## API 구조

현재 프로젝트는 API 통신만으로 구성되어 있습니다:

| 엔드포인트 | 설명 |
|-----------|------|
| Upstage Chat API | 프론트엔드에서 직접 호출 (채팅) |
| `/api/document-parse` | Vercel 함수 (문서 파싱) |
| `/api/information-extract` | Vercel 함수 (정보 추출) |
| `/api/ocr` | Vercel 함수 (OCR) |
