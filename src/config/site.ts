/**
 * 홈페이지 텍스트 설정
 * 이 파일에서 모든 텍스트를 수정할 수 있어요!
 */

export const siteConfig = {
  // 사이트 제목
  title: 'claraexmachina.room',

  // 프로필 설정
  profile: {
    emoji: '🍒',                          // 프로필 이모지
    name: 'Ab imo pectore',               // 닉네임
    bio: '햇빛 희, 물모일 주 🌸',          // 한줄 소개
    statsLabels: {
      posts: '글',                         // 글 수 라벨
      likes: '♥',                          // 좋아요 라벨
    },
  },

  // NOW PLAYING 위젯
  nowPlaying: {
    artist: 'YOASOBI',                     // 아티스트 명
    title: 'たぶん',                        // 곡 제목
  },

  // 메인 룸 영역
  room: {
    title: '✧ MY PIXEL ROOM ✧',           // 룸 타이틀
    subtitle: 'cyberpunk cozy space',      // 룸 부제목
    decorations: ['🖥️', '🐱', '🪴', '💜'], // 장식 이모지들
    placeholder: '픽셀 룸 이미지를 여기에 추가하세요',
  },

  // 위젯 타이틀들
  widgetTitles: {
    profile: 'PROFILE',
    category: 'CATEGORY',
    nowPlaying: 'NOW PLAYING',
    recentPosts: 'RECENT POSTS',
  },

  // 빈 상태 메시지
  emptyState: {
    message: '아직 작성된 글이 없어요',
    buttonText: '첫 글 쓰러 가기',
  },

  // 버튼 텍스트
  buttons: {
    viewAllPosts: '전체 글 보기 →',
  },

  // 푸터 메시지
  footer: {
    message: '평화를 빕니다',
  },
};
