import type { Components } from 'react-markdown';

// YouTube 사이즈 프리셋
const YOUTUBE_SIZES = {
  small: { width: 320, height: 180 },
  medium: { width: 560, height: 315 },
  large: { width: 853, height: 480 },
  full: { width: '100%', height: 'auto' },
} as const;

export type YouTubeSize = keyof typeof YOUTUBE_SIZES;

// YouTube URL/ID에서 비디오 ID 추출
export function extractYouTubeId(input: string): string | null {
  // 이미 VIDEO_ID인 경우 (11자리 알파벳/숫자/하이픈/언더스코어)
  if (/^[\w-]{11}$/.test(input)) {
    return input;
  }

  // VIDEO_ID?start=123 형식 (마크다운에서 시작 시간과 함께 저장된 경우)
  const idWithParams = input.match(/^([\w-]{11})\?/);
  if (idWithParams) {
    return idWithParams[1];
  }

  // URL 패턴들
  const patterns = [
    // https://www.youtube.com/watch?v=VIDEO_ID
    /(?:youtube\.com\/watch\?v=)([\w-]{11})/,
    // https://youtu.be/VIDEO_ID
    /(?:youtu\.be\/)([\w-]{11})/,
    // https://www.youtube.com/embed/VIDEO_ID
    /(?:youtube\.com\/embed\/)([\w-]{11})/,
    // https://www.youtube.com/v/VIDEO_ID
    /(?:youtube\.com\/v\/)([\w-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = input.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

// YouTube URL에서 시작 시간 추출 (초 단위)
export function extractStartTime(url: string): number | null {
  // t=123 또는 start=123 또는 t=1m30s 형식 지원
  const timeMatch = url.match(/[?&](?:t|start)=(\d+)/);
  if (timeMatch) {
    return parseInt(timeMatch[1], 10);
  }

  // t=1m30s 형식
  const complexTimeMatch = url.match(/[?&]t=(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/);
  if (complexTimeMatch) {
    const hours = parseInt(complexTimeMatch[1] || '0', 10);
    const minutes = parseInt(complexTimeMatch[2] || '0', 10);
    const seconds = parseInt(complexTimeMatch[3] || '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return null;
}

// YouTube 임베드 URL 생성
export function buildYouTubeEmbedUrl(videoId: string, startTime?: number | null): string {
  let url = `https://www.youtube.com/embed/${videoId}`;
  if (startTime && startTime > 0) {
    url += `?start=${startTime}`;
  }
  return url;
}

// alt 텍스트에서 YouTube 사이즈 파싱
// 예: "youtube", "youtube:small", "youtube:large"
function parseYouTubeAlt(alt: string): { isYouTube: boolean; size: YouTubeSize } {
  const match = alt.match(/^youtube(?::(\w+))?$/i);
  if (!match) {
    return { isYouTube: false, size: 'medium' };
  }

  const sizeKey = (match[1]?.toLowerCase() || 'medium') as YouTubeSize;
  const size = sizeKey in YOUTUBE_SIZES ? sizeKey : 'medium';

  return { isYouTube: true, size };
}

// YouTube iframe 컴포넌트
interface YouTubeEmbedProps {
  videoId: string;
  size: YouTubeSize;
  startTime?: number | null;
}

function YouTubeEmbed({ videoId, size, startTime }: YouTubeEmbedProps) {
  const dimensions = YOUTUBE_SIZES[size];
  const embedUrl = buildYouTubeEmbedUrl(videoId, startTime);

  const isFull = size === 'full';
  const containerStyle = isFull
    ? { position: 'relative' as const, paddingBottom: '56.25%', height: 0, overflow: 'hidden' as const }
    : undefined;
  const iframeStyle = isFull
    ? { position: 'absolute' as const, top: 0, left: 0, width: '100%', height: '100%' }
    : undefined;

  return (
    <div className="youtube-embed" style={containerStyle}>
      <iframe
        src={embedUrl}
        width={isFull ? '100%' : dimensions.width}
        height={isFull ? '100%' : dimensions.height}
        style={iframeStyle}
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
      />
    </div>
  );
}

// ReactMarkdown용 커스텀 img 컴포넌트 생성
export function createMarkdownComponents(baseComponents?: Components): Components {
  return {
    ...baseComponents,
    img: ({ alt, src, ...props }) => {
      const { isYouTube, size } = parseYouTubeAlt(alt || '');

      if (isYouTube && src && typeof src === 'string') {
        const videoId = extractYouTubeId(src);
        if (videoId) {
          const startTime = extractStartTime(src);
          return <YouTubeEmbed videoId={videoId} size={size} startTime={startTime} />;
        }
      }

      // 일반 이미지는 그대로 렌더링 (ReactMarkdown에서 사용하므로 next/image 대신 img 사용)
      // eslint-disable-next-line @next/next/no-img-element
      return <img alt={alt} src={src} {...props} />;
    },
  };
}

// YouTube 마크다운 문법 생성 헬퍼 (deprecated - HTML 블록 안에서 작동하지 않음)
export function generateYouTubeMarkdown(
  videoIdOrUrl: string,
  size: YouTubeSize = 'medium'
): string | null {
  const videoId = extractYouTubeId(videoIdOrUrl);
  if (!videoId) return null;

  const startTime = extractStartTime(videoIdOrUrl);
  const src = startTime ? `${videoId}?start=${startTime}` : videoId;
  const sizeStr = size === 'medium' ? '' : `:${size}`;

  return `![youtube${sizeStr}](${src})`;
}

// YouTube HTML iframe 생성 헬퍼 (HTML 블록 안에서도 작동)
export function generateYouTubeHtml(
  videoIdOrUrl: string,
  size: YouTubeSize = 'medium'
): string | null {
  const videoId = extractYouTubeId(videoIdOrUrl);
  if (!videoId) return null;

  const startTime = extractStartTime(videoIdOrUrl);
  const embedUrl = buildYouTubeEmbedUrl(videoId, startTime);
  const dimensions = YOUTUBE_SIZES[size];

  if (size === 'full') {
    return `<div class="youtube-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden;">
<iframe src="${embedUrl}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>`;
  }

  return `<div class="youtube-embed" style="text-align: center;">
<iframe src="${embedUrl}" width="${dimensions.width}" height="${dimensions.height}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>`;
}

export { YOUTUBE_SIZES };
