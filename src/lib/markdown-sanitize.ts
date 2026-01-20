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
    ],
    p: [
      ...(defaultSchema.attributes?.p || []),
      ['style', /^text-align:\s*(left|center|right|justify);?$/],
    ],
    span: [
      ...(defaultSchema.attributes?.span || []),
      ['style', /^text-align:\s*(left|center|right|justify);?$/],
    ],
    // video 태그 속성 허용
    video: ['src', 'controls', 'width', 'height', 'autoplay', 'loop', 'muted', 'poster'],
  },
  tagNames: [
    ...(defaultSchema.tagNames || []),
    'video',
  ],
};
