'use client';

import { useState, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Minus,
  Image as ImageIcon,
  Link as LinkIcon,
  Code,
  Eye,
  Edit3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Film,
} from 'lucide-react';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

export default function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const insertText = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selectedText = value.substring(start, end) || placeholder;
      const newText =
        value.substring(0, start) + before + selectedText + after + value.substring(end);

      onChange(newText);

      // Restore cursor position
      setTimeout(() => {
        textarea.focus();
        const newCursorPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }, 0);
    },
    [value, onChange]
  );

  const handleBold = () => insertText('**', '**', '굵은 텍스트');
  const handleItalic = () => insertText('*', '*', '기울임 텍스트');
  const handleH1 = () => insertText('\n# ', '\n', '제목 1');
  const handleH2 = () => insertText('\n## ', '\n', '제목 2');
  const handleH3 = () => insertText('\n### ', '\n', '제목 3');
  const handleUL = () => insertText('\n- ', '\n', '목록 항목');
  const handleOL = () => insertText('\n1. ', '\n', '번호 목록');
  const handleQuote = () => insertText('\n> ', '\n', '인용문');
  const handleDivider = () => insertText('\n\n---\n\n', '', '');
  const handleCode = () => insertText('`', '`', '코드');
  const handleLink = () => insertText('[', '](url)', '링크 텍스트');

  const handleAlignLeft = () => insertText('<div style="text-align: left;">\n\n', '\n\n</div>', '왼쪽 정렬 텍스트');
  const handleAlignCenter = () => insertText('<div style="text-align: center;">\n\n', '\n\n</div>', '가운데 정렬 텍스트');
  const handleAlignRight = () => insertText('<div style="text-align: right;">\n\n', '\n\n</div>', '오른쪽 정렬 텍스트');

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onImageUpload) {
      try {
        const url = await onImageUpload(file);
        if (type === 'image') {
          insertText(`\n![이미지 설명](${url})\n`, '', '');
        } else {
          insertText(`\n<video src="${url}" controls width="100%"></video>\n`, '', '');
        }
      } catch (error) {
        console.error('Upload failed:', error);
        alert('파일 업로드에 실패했습니다.');
      }
    }

    // Reset input
    e.target.value = '';
  };

  const ToolButton = ({
    onClick,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    icon: React.ElementType;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="p-2 rounded hover:bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)] transition-colors"
    >
      <Icon size={18} />
    </button>
  );

  return (
    <div className="border-2 border-[var(--kuromi-black)] rounded-lg overflow-hidden bg-[var(--kuromi-white)]">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 bg-[var(--kuromi-cream)] border-b-2 border-[var(--kuromi-lavender)]">
        <ToolButton onClick={handleBold} icon={Bold} title="굵게" />
        <ToolButton onClick={handleItalic} icon={Italic} title="기울임" />
        <div className="w-px h-6 bg-[var(--kuromi-lavender)] mx-1" />
        <ToolButton onClick={handleH1} icon={Heading1} title="제목 1" />
        <ToolButton onClick={handleH2} icon={Heading2} title="제목 2" />
        <ToolButton onClick={handleH3} icon={Heading3} title="제목 3" />
        <div className="w-px h-6 bg-[var(--kuromi-lavender)] mx-1" />
        <ToolButton onClick={handleUL} icon={List} title="목록" />
        <ToolButton onClick={handleOL} icon={ListOrdered} title="번호 목록" />
        <ToolButton onClick={handleQuote} icon={Quote} title="인용" />
        <ToolButton onClick={handleDivider} icon={Minus} title="구분선" />
        <div className="w-px h-6 bg-[var(--kuromi-lavender)] mx-1" />
        <ToolButton onClick={handleAlignLeft} icon={AlignLeft} title="왼쪽 정렬" />
        <ToolButton onClick={handleAlignCenter} icon={AlignCenter} title="가운데 정렬" />
        <ToolButton onClick={handleAlignRight} icon={AlignRight} title="오른쪽 정렬" />
        <div className="w-px h-6 bg-[var(--kuromi-lavender)] mx-1" />
        <ToolButton onClick={handleCode} icon={Code} title="코드" />
        <ToolButton onClick={handleLink} icon={LinkIcon} title="링크" />
        <ToolButton onClick={handleImageClick} icon={ImageIcon} title="이미지" />
        <ToolButton onClick={handleVideoClick} icon={Film} title="영상" />

        <div className="flex-1" />

        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`flex items-center gap-2 px-3 py-1 rounded font-medium transition-colors ${
            isPreview
              ? 'bg-[var(--kuromi-purple)] text-white'
              : 'bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)]'
          }`}
        >
          {isPreview ? <Edit3 size={16} /> : <Eye size={16} />}
          {isPreview ? '편집' : '미리보기'}
        </button>
      </div>

      {/* Editor / Preview */}
      {isPreview ? (
        <div className="p-4 min-h-[400px] markdown-content">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeRaw, rehypeSanitize]}
          >
            {value || '*내용을 입력해주세요...*'}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="마크다운으로 내용을 작성해주세요..."
          className="w-full min-h-[400px] p-4 resize-y outline-none font-mono text-sm"
        />
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileUpload(e, 'image')}
        className="hidden"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileUpload(e, 'video')}
        className="hidden"
      />
    </div>
  );
}
