# My Blog 🌱

파스텔 핑크 테마의 개인 블로그입니다.

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
