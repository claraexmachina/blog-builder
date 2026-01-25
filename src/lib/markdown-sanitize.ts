import { defaultSchema } from 'rehype-sanitize';
import type { Options } from 'rehype-sanitize';

// rehype-sanitize 커스텀 스키마
// text-align 스타일을 허용하여 텍스트 정렬 기능 지원
export const sanitizeSchema: Options = {
  ...defaultSchema,
  attributes: {
    ...defaultSchema.attributes,
    // div, p, span 태그에 style 속성 허용
    div: [
      ...(defaultSchema.attributes?.div || []),
      ['style', /^text-align:\s*(left|center|right|justify);?$/],
      ['style', /^position:\s*relative;\s*padding-bottom:\s*[\d.]+%;\s*height:\s*0;\s*overflow:\s*hidden;?$/],
      ['className', /^(youtube-embed|image-gallery(-cols-[1-4]|-fit-(cover|contain|auto)|-ratio-(auto|1x1|4x3|3x4|16x9)|-gap-(none|sm|md|lg)|-[23])?)$/],
    ],
    p: [
      ...(defaultSchema.attributes?.p || []),
      ['style', /^text-align:\s*(left|center|right|justify);?$/],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['style', /^text-align:\s*(left|center|right|justify);?$/],
    ],
    // img 태그 속성 허용 (width, height for resizing)
    img: [
      ...(defaultSchema.attributes?.img || []),
      'src', 'alt', 'title', 'width', 'height',
    ],
    // figure 태그에 style 허용
    figure: [
      ['style', /^text-align:\s*(left|center|right);?$/],
    ],
    // video 태그 속성 허용
    video: ['src', 'controls', 'width', 'height', 'autoplay', 'loop', 'muted', 'poster'],
    // iframe 태그 속성 허용 (YouTube 임베드용, src는 youtube.com만 허용)
    iframe: [
      ['src', /^https:\/\/www\.youtube\.com\/embed\/[\w-]+(\?.*)?$/],
      ['style', /^position:\s*absolute;\s*top:\s*0;\s*left:\s*0;\s*width:\s*100%;\s*height:\s*100%;?$/],
      'width',
      'height',
      'title',
      'frameBorder',
      'allow',
      'allowFullScreen',
      'referrerPolicy',
    ],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'video',
    'figure',
    'figcaption',
    'iframe',
  ],
};
