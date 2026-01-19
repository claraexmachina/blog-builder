# My Blog 🌱

파스텔 핑크 테마의 개인 블로그입니다.

## 주요 기능

- **마크다운 에디터** - 글 작성 시 마크다운 문법 지원
- **이미지 업로드** - Vercel Blob을 통한 이미지/동영상 업로드
- **좋아요 시스템** - 각 글에 좋아요 기능
- **카테고리 분류** - 글을 카테고리별로 정리
- **임시저장** - 작성 중인 글 임시저장
- **macOS 스타일 Dock** - 하단에 고정된 빠른 링크 독
- **버블 커서 효과** - 데스크톱에서 마우스 따라다니는 버블 효과

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Database**: Vercel KV (Redis)
- **Storage**: Vercel Blob
- **Icons**: Lucide React
- **Font**: Noto Sans KR (Google Fonts)

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local` 파일을 생성하고 다음 변수들을 설정하세요:

```env
# Vercel KV
KV_URL=your_kv_url
KV_REST_API_URL=your_kv_rest_api_url
KV_REST_API_TOKEN=your_kv_rest_api_token
KV_REST_API_READ_ONLY_TOKEN=your_kv_read_only_token

# Vercel Blob
BLOB_READ_WRITE_TOKEN=your_blob_token

# Admin Authentication
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=your_jwt_secret
```

### 3. 개발 서버 실행

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## 배포

Vercel에서 배포하는 것을 권장합니다:

1. GitHub 저장소를 Vercel에 연결
2. Environment Variables에 위 환경 변수들 추가
3. Vercel KV와 Vercel Blob 스토리지 연결

## 프로젝트 구조

```
src/
├── app/                  # Next.js App Router 페이지
│   ├── api/              # API 라우트
│   ├── posts/            # 포스트 페이지
│   ├── write/            # 글 작성 페이지
│   ├── admin/            # 관리자 페이지
│   └── login/            # 로그인 페이지
├── components/           # React 컴포넌트
│   ├── Header.tsx        # 헤더 네비게이션
│   ├── Footer.tsx        # 푸터
│   ├── Dock.tsx          # macOS 스타일 독
│   ├── BubbleCursor.tsx  # 버블 커서 효과
│   ├── PostCard.tsx      # 포스트 카드
│   ├── PostList.tsx      # 포스트 목록
│   ├── LikeButton.tsx    # 좋아요 버튼
│   └── MarkdownEditor.tsx # 마크다운 에디터
└── lib/                  # 유틸리티
    ├── db.ts             # Vercel KV 데이터베이스
    └── auth.ts           # 인증 관련
```

## 라이선스

MIT
