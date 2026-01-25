'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { sanitizeSchema } from '@/lib/markdown-sanitize';
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
  Undo2,
  Redo2,
  Table,
  Columns,
  Eraser,
  X,
  Youtube,
} from 'lucide-react';
import {
  createMarkdownComponents,
  generateYouTubeMarkdown,
  extractYouTubeId,
  type YouTubeSize,
  YOUTUBE_SIZES,
} from '@/lib/youtube-embed';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  onImageUpload?: (file: File) => Promise<string>;
}

type ViewMode = 'edit' | 'split' | 'preview';
type ImageSize = '25%' | '50%' | '75%' | '100%';
type ImageAlign = 'left' | 'center' | 'right';
type GalleryColumns = '1' | '2' | '3' | '4';
type GalleryFit = 'cover' | 'contain' | 'auto';
type GalleryRatio = 'auto' | '1:1' | '4:3' | '3:4' | '16:9';
type GalleryGap = 'none' | 'sm' | 'md' | 'lg';

interface UploadedImage {
  url: string;
  name: string;
}

interface ImageDialogState {
  show: boolean;
  images: UploadedImage[];
  uploading: boolean;
  size: ImageSize;
  align: ImageAlign;
  caption: string;
  galleryColumns: GalleryColumns;
  galleryFit: GalleryFit;
  galleryRatio: GalleryRatio;
  galleryGap: GalleryGap;
}

interface HistoryEntry {
  value: string;
  cursorStart: number;
  cursorEnd: number;
}

interface YouTubeDialogState {
  show: boolean;
  url: string;
  size: YouTubeSize;
  error: string;
}

const MAX_HISTORY = 100;

// Toolbar button component (defined outside to avoid recreation on each render)
function ToolButton({
  onClick,
  icon: Icon,
  title,
  shortcut,
  disabled,
}: {
  onClick: () => void;
  icon: React.ElementType;
  title: string;
  shortcut?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={shortcut ? `${title} (${shortcut})` : title}
      aria-label={title}
      disabled={disabled}
      className="p-2 rounded hover:bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)] transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
    >
      <Icon size={18} />
    </button>
  );
}

export default function MarkdownEditor({
  value,
  onChange,
  onImageUpload,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('edit');
  const [showTableGrid, setShowTableGrid] = useState(false);
  const [tableHover, setTableHover] = useState({ rows: 0, cols: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [imageDialog, setImageDialog] = useState<ImageDialogState>({
    show: false,
    images: [],
    uploading: false,
    size: '100%',
    align: 'center',
    caption: '',
    galleryColumns: '2',
    galleryFit: 'auto',
    galleryRatio: 'auto',
    galleryGap: 'md',
  });
  const [youtubeDialog, setYoutubeDialog] = useState<YouTubeDialogState>({
    show: false,
    url: '',
    size: 'medium',
    error: '',
  });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const tableGridRef = useRef<HTMLDivElement>(null);

  // Undo/Redo history - initialize with current value
  // Note: useRef only uses the initial value on first render, so this is safe
  const historyRef = useRef<HistoryEntry[]>([{
    value,
    cursorStart: value.length,
    cursorEnd: value.length
  }]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [historyLength, setHistoryLength] = useState(1);
  const isUndoRedoRef = useRef(false);

  const pushHistory = useCallback((newValue: string, cursorStart: number, cursorEnd: number) => {
    if (isUndoRedoRef.current) return;

    setHistoryIndex(currentIndex => {
      const current = historyRef.current[currentIndex];
      if (current && current.value === newValue) return currentIndex;

      // Trim future entries
      historyRef.current = historyRef.current.slice(0, currentIndex + 1);
      historyRef.current.push({ value: newValue, cursorStart, cursorEnd });

      // Limit history size
      if (historyRef.current.length > MAX_HISTORY) {
        historyRef.current = historyRef.current.slice(historyRef.current.length - MAX_HISTORY);
      }

      setHistoryLength(historyRef.current.length);
      return historyRef.current.length - 1;
    });
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryIndex(currentIndex => {
      if (currentIndex <= 0) return currentIndex;
      isUndoRedoRef.current = true;
      const newIndex = currentIndex - 1;
      const entry = historyRef.current[newIndex];
      onChange(entry.value);
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(entry.cursorStart, entry.cursorEnd);
        }
        isUndoRedoRef.current = false;
      }, 0);
      return newIndex;
    });
  }, [onChange]);

  const handleRedo = useCallback(() => {
    setHistoryIndex(currentIndex => {
      if (currentIndex >= historyRef.current.length - 1) return currentIndex;
      isUndoRedoRef.current = true;
      const newIndex = currentIndex + 1;
      const entry = historyRef.current[newIndex];
      onChange(entry.value);
      setTimeout(() => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.focus();
          textarea.setSelectionRange(entry.cursorStart, entry.cursorEnd);
        }
        isUndoRedoRef.current = false;
      }, 0);
      return newIndex;
    });
  }, [onChange]);

  const insertText = useCallback(
    (before: string, after: string = '', placeholder: string = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const savedScrollTop = textarea.scrollTop;
      const selectedText = value.substring(start, end) || placeholder;
      const newText =
        value.substring(0, start) + before + selectedText + after + value.substring(end);

      onChange(newText);

      const newCursorPos = start + before.length + selectedText.length;
      pushHistory(newText, newCursorPos, newCursorPos);

      // Restore cursor position and scroll
      setTimeout(() => {
        textarea.focus();
        if (value.substring(start, end)) {
          // If there was a selection, place cursor after
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        } else {
          // If placeholder was used, select the placeholder text
          const selectStart = start + before.length;
          const selectEnd = selectStart + selectedText.length;
          textarea.setSelectionRange(selectStart, selectEnd);
        }
        textarea.scrollTop = savedScrollTop;
      }, 0);
    },
    [value, onChange, pushHistory]
  );

  const handleBold = useCallback(() => insertText('**', '**', '굵은 텍스트'), [insertText]);
  const handleItalic = useCallback(() => insertText('*', '*', '기울임 텍스트'), [insertText]);
  const handleH1 = useCallback(() => insertText('\n# ', '\n', '제목 1'), [insertText]);
  const handleH2 = useCallback(() => insertText('\n## ', '\n', '제목 2'), [insertText]);
  const handleH3 = useCallback(() => insertText('\n### ', '\n', '제목 3'), [insertText]);
  const handleUL = useCallback(() => insertText('\n- ', '\n', '목록 항목'), [insertText]);
  const handleOL = useCallback(() => insertText('\n1. ', '\n', '번호 목록'), [insertText]);
  const handleQuote = useCallback(() => insertText('\n> ', '\n', '인용문'), [insertText]);
  const handleDivider = useCallback(() => insertText('\n\n---\n\n', '', ''), [insertText]);
  const handleCode = useCallback(() => insertText('`', '`', '코드'), [insertText]);
  const handleCodeBlock = useCallback(() => insertText('\n```\n', '\n```\n', '코드를 입력하세요'), [insertText]);
  const handleLink = useCallback(() => insertText('[', '](url)', '링크 텍스트'), [insertText]);

  const handleAlignLeft = useCallback(() => insertText('<div style="text-align: left;">\n\n', '\n\n</div>', '왼쪽 정렬 텍스트'), [insertText]);
  const handleAlignCenter = useCallback(() => insertText('<div style="text-align: center;">\n\n', '\n\n</div>', '가운데 정렬 텍스트'), [insertText]);
  const handleAlignRight = useCallback(() => insertText('<div style="text-align: right;">\n\n', '\n\n</div>', '오른쪽 정렬 텍스트'), [insertText]);

  // Strip markdown formatting from selected text
  const handleStripFormatting = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    if (start === end) return; // No selection

    const savedScrollTop = textarea.scrollTop;
    const selectedText = value.substring(start, end);
    const stripped = selectedText
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/`([^`]*)`/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^>\s+/gm, '')
      .replace(/^[-*+]\s+/gm, '')
      .replace(/^\d+\.\s+/gm, '');

    const newText = value.substring(0, start) + stripped + value.substring(end);
    onChange(newText);
    pushHistory(newText, start, start + stripped.length);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start, start + stripped.length);
      textarea.scrollTop = savedScrollTop;
    }, 0);
  }, [value, onChange, pushHistory]);

  // Table insertion
  const handleTableInsert = useCallback((rows: number, cols: number) => {
    const header = '| ' + Array.from({ length: cols }, (_, i) => `헤더${i + 1}`).join(' | ') + ' |';
    const separator = '| ' + Array.from({ length: cols }, () => '---').join(' | ') + ' |';
    const bodyRows = Array.from({ length: rows }, () =>
      '| ' + Array.from({ length: cols }, () => '셀').join(' | ') + ' |'
    ).join('\n');

    const tableMarkdown = `\n${header}\n${separator}\n${bodyRows}\n`;
    insertText(tableMarkdown, '', '');
    setShowTableGrid(false);
  }, [insertText]);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleVideoClick = () => {
    videoInputRef.current?.click();
  };

  // Upload multiple images and show dialog
  const uploadImagesAndShowDialog = useCallback(async (files: File[]) => {
    if (!onImageUpload || files.length === 0) return;

    setImageDialog(prev => ({ ...prev, show: true, uploading: true, images: [] }));

    const uploaded: UploadedImage[] = [];
    for (const file of files) {
      try {
        const url = await onImageUpload(file);
        uploaded.push({ url, name: file.name });
      } catch (error) {
        console.error('Upload failed:', error);
      }
    }

    if (uploaded.length === 0) {
      alert('이미지 업로드에 실패했습니다.');
      setImageDialog(prev => ({ ...prev, show: false, uploading: false }));
      return;
    }

    setImageDialog(prev => ({
      ...prev,
      images: uploaded,
      uploading: false,
      galleryColumns: uploaded.length > 1 ? '2' : '1',
    }));
  }, [onImageUpload]);

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'image' | 'video'
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (type === 'image') {
      await uploadImagesAndShowDialog(Array.from(files));
    } else if (type === 'video') {
      const file = files[0];
      if (onImageUpload) {
        try {
          const url = await onImageUpload(file);
          insertText(`\n<video src="${url}" controls width="100%"></video>\n`, '', '');
        } catch (error) {
          console.error('Upload failed:', error);
          alert('파일 업로드에 실패했습니다.');
        }
      }
    }

    // Reset input
    e.target.value = '';
  };

  // Generate image markdown from dialog settings
  const handleImageDialogInsert = useCallback(() => {
    const { images, size, align, caption, galleryColumns, galleryFit, galleryRatio, galleryGap } = imageDialog;
    if (images.length === 0) return;

    let markup = '';

    if (images.length === 1) {
      // Single image
      const img = images[0];
      const widthAttr = size !== '100%' ? ` width="${size}"` : '';
      const imgTag = `<img src="${img.url}" alt="${caption || '이미지'}"${widthAttr} />`;

      if (caption) {
        markup = `\n<figure style="text-align: ${align};">\n${imgTag}\n<figcaption>${caption}</figcaption>\n</figure>\n`;
      } else if (size !== '100%' || align !== 'center') {
        markup = `\n<figure style="text-align: ${align};">\n${imgTag}\n</figure>\n`;
      } else {
        // Default: use standard markdown for maximum compatibility
        markup = `\n![${caption || '이미지'}](${img.url})\n`;
      }
    } else {
      // Multiple images
      if (galleryColumns === '1') {
        // Stack vertically, each with its own figure
        markup = '\n' + images.map(img => {
          const widthAttr = size !== '100%' ? ` width="${size}"` : '';
          return `<figure style="text-align: ${align};">\n<img src="${img.url}" alt="이미지"${widthAttr} />\n</figure>`;
        }).join('\n') + '\n';
      } else {
        // Gallery grid with customization classes
        const classes = [
          'image-gallery',
          `image-gallery-cols-${galleryColumns}`,
          `image-gallery-fit-${galleryFit}`,
          `image-gallery-gap-${galleryGap}`,
        ];
        // Only add ratio class when fit mode uses it (cover or contain)
        if (galleryFit !== 'auto' && galleryRatio !== 'auto') {
          const ratioClass = `image-gallery-ratio-${galleryRatio.replace(':', 'x')}`;
          classes.push(ratioClass);
        }
        const classStr = classes.join(' ');
        const imgTags = images.map(img =>
          `<img src="${img.url}" alt="이미지" />`
        ).join('\n');
        markup = `\n<div class="${classStr}">\n${imgTags}\n</div>\n`;
      }

      if (caption) {
        markup = markup.trimEnd() + `\n<p style="text-align: center;"><em>${caption}</em></p>\n`;
      }
    }

    insertText(markup, '', '');
    setImageDialog({
      show: false, images: [], uploading: false,
      size: '100%', align: 'center', caption: '',
      galleryColumns: '2', galleryFit: 'auto', galleryRatio: 'auto', galleryGap: 'md',
    });
  }, [imageDialog, insertText]);

  const handleImageDialogClose = useCallback(() => {
    setImageDialog({
      show: false, images: [], uploading: false,
      size: '100%', align: 'center', caption: '',
      galleryColumns: '2', galleryFit: 'auto', galleryRatio: 'auto', galleryGap: 'md',
    });
  }, []);

  // YouTube 다이얼로그 핸들러
  const handleYoutubeClick = useCallback(() => {
    setYoutubeDialog({ show: true, url: '', size: 'medium', error: '' });
  }, []);

  const handleYoutubeDialogClose = useCallback(() => {
    setYoutubeDialog({ show: false, url: '', size: 'medium', error: '' });
  }, []);

  const handleYoutubeInsert = useCallback(() => {
    const { url, size } = youtubeDialog;

    if (!url.trim()) {
      setYoutubeDialog(prev => ({ ...prev, error: 'URL을 입력해주세요.' }));
      return;
    }

    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      setYoutubeDialog(prev => ({ ...prev, error: '올바른 YouTube URL이 아닙니다.' }));
      return;
    }

    const markdown = generateYouTubeMarkdown(url.trim(), size);
    if (markdown) {
      insertText(`\n${markdown}\n`, '', '');
      handleYoutubeDialogClose();
    }
  }, [youtubeDialog, insertText, handleYoutubeDialogClose]);

  // Drag and drop handling
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(f => f.type.startsWith('image/'));

    if (imageFiles.length > 0 && onImageUpload) {
      await uploadImagesAndShowDialog(imageFiles);
    }
  }, [onImageUpload, uploadImagesAndShowDialog]);

  // Paste image from clipboard
  const handlePaste = useCallback(async (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items);
    const imageItem = items.find(item => item.type.startsWith('image/'));

    if (imageItem && onImageUpload) {
      e.preventDefault();
      const file = imageItem.getAsFile();
      if (!file) return;

      await uploadImagesAndShowDialog([file]);
    }
  }, [onImageUpload, uploadImagesAndShowDialog]);

  // Handle textarea changes with history
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    pushHistory(newValue, e.target.selectionStart, e.target.selectionEnd);
  }, [onChange, pushHistory]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMod = e.ctrlKey || e.metaKey;

    if (isMod && e.key === 'b') {
      e.preventDefault();
      handleBold();
    } else if (isMod && e.key === 'i') {
      e.preventDefault();
      handleItalic();
    } else if (isMod && e.key === 'k') {
      e.preventDefault();
      handleLink();
    } else if (isMod && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
    } else if (isMod && e.key === 'z' && e.shiftKey) {
      e.preventDefault();
      handleRedo();
    } else if (isMod && e.key === 'y') {
      e.preventDefault();
      handleRedo();
    } else if (e.key === 'Tab' && !e.shiftKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const savedScrollTop = textarea.scrollTop;

      if (start === end) {
        // No selection: insert two spaces
        const newText = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newText);
        pushHistory(newText, start + 2, start + 2);
        setTimeout(() => {
          textarea.setSelectionRange(start + 2, start + 2);
          textarea.scrollTop = savedScrollTop;
        }, 0);
      } else {
        // Indent selected lines
        const lineStart = value.lastIndexOf('\n', start - 1) + 1;
        const selectedBlock = value.substring(lineStart, end);
        const indented = selectedBlock.replace(/^/gm, '  ');
        const newText = value.substring(0, lineStart) + indented + value.substring(end);
        onChange(newText);
        pushHistory(newText, lineStart, lineStart + indented.length);
        setTimeout(() => {
          textarea.setSelectionRange(lineStart, lineStart + indented.length);
          textarea.scrollTop = savedScrollTop;
        }, 0);
      }
    } else if (e.key === 'Tab' && e.shiftKey) {
      e.preventDefault();
      const textarea = e.currentTarget;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const savedScrollTop = textarea.scrollTop;
      const lineStart = value.lastIndexOf('\n', start - 1) + 1;
      const selectedBlock = value.substring(lineStart, end);
      const dedented = selectedBlock.replace(/^  /gm, '');
      const newText = value.substring(0, lineStart) + dedented + value.substring(end);
      onChange(newText);
      pushHistory(newText, lineStart, lineStart + dedented.length);
      setTimeout(() => {
        textarea.setSelectionRange(lineStart, lineStart + dedented.length);
        textarea.scrollTop = savedScrollTop;
      }, 0);
    }
  }, [value, onChange, pushHistory, handleBold, handleItalic, handleLink, handleUndo, handleRedo]);

  // Close table grid when clicking outside
  useEffect(() => {
    if (!showTableGrid) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (tableGridRef.current && !tableGridRef.current.contains(e.target as Node)) {
        setShowTableGrid(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showTableGrid]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < historyLength - 1;

  const charCount = value.length;
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="border-2 border-[var(--kuromi-black)] rounded-lg overflow-hidden bg-[var(--kuromi-white)]">
      {/* Toolbar */}
      <div
        className="flex flex-wrap items-center gap-1 p-2 bg-[var(--kuromi-cream)] border-b-2 border-[var(--kuromi-lavender)]"
        role="toolbar"
        aria-label="서식 도구 모음"
      >
        <ToolButton onClick={handleUndo} icon={Undo2} title="실행 취소" shortcut="Ctrl+Z" disabled={!canUndo} />
        <ToolButton onClick={handleRedo} icon={Redo2} title="다시 실행" shortcut="Ctrl+Shift+Z" disabled={!canRedo} />
        <div className="w-px h-6 bg-[var(--kuromi-lavender)] mx-1" />
        <ToolButton onClick={handleBold} icon={Bold} title="굵게" shortcut="Ctrl+B" />
        <ToolButton onClick={handleItalic} icon={Italic} title="기울임" shortcut="Ctrl+I" />
        <ToolButton onClick={handleStripFormatting} icon={Eraser} title="서식 제거" />
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
        <ToolButton onClick={handleCode} icon={Code} title="인라인 코드" />
        <button
          type="button"
          onClick={handleCodeBlock}
          title="코드 블록"
          aria-label="코드 블록"
          className="p-2 rounded hover:bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)] transition-colors text-xs font-mono font-bold"
        >
          {'</>'}
        </button>
        <ToolButton onClick={handleLink} icon={LinkIcon} title="링크" shortcut="Ctrl+K" />
        <ToolButton onClick={handleImageClick} icon={ImageIcon} title="이미지" />
        <ToolButton onClick={handleVideoClick} icon={Film} title="영상" />
        <ToolButton onClick={handleYoutubeClick} icon={Youtube} title="YouTube" />

        {/* Table grid button */}
        <div className="relative" ref={tableGridRef}>
          <ToolButton
            onClick={() => setShowTableGrid(!showTableGrid)}
            icon={Table}
            title="테이블 삽입"
          />
          {showTableGrid && (
            <div className="absolute top-full left-0 mt-1 p-3 bg-[var(--kuromi-white)] border-2 border-[var(--kuromi-lavender)] rounded-lg shadow-lg z-50">
              <p className="text-xs text-[var(--text-muted)] mb-2">
                {tableHover.rows > 0 ? `${tableHover.rows} x ${tableHover.cols}` : '크기 선택'}
              </p>
              <div className="grid grid-cols-6 gap-1">
                {Array.from({ length: 6 }, (_, row) =>
                  Array.from({ length: 6 }, (_, col) => (
                    <button
                      key={`${row}-${col}`}
                      type="button"
                      className={`w-5 h-5 border rounded transition-colors ${
                        row < tableHover.rows && col < tableHover.cols
                          ? 'bg-[var(--kuromi-purple)] border-[var(--kuromi-purple)]'
                          : 'bg-[var(--kuromi-cream)] border-[var(--kuromi-lavender)]'
                      }`}
                      onMouseEnter={() => setTableHover({ rows: row + 1, cols: col + 1 })}
                      onClick={() => handleTableInsert(row + 1, col + 1)}
                      aria-label={`${row + 1}행 ${col + 1}열 테이블`}
                    />
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1" />

        {/* View mode buttons */}
        <div className="flex items-center border border-[var(--kuromi-lavender)] rounded overflow-hidden">
          <button
            type="button"
            onClick={() => setViewMode('edit')}
            title="편집 모드"
            aria-label="편집 모드"
            aria-pressed={viewMode === 'edit'}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${
              viewMode === 'edit'
                ? 'bg-[var(--kuromi-purple)] text-white'
                : 'bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-lavender)]'
            }`}
          >
            <Edit3 size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('split')}
            title="분할 모드"
            aria-label="분할 모드"
            aria-pressed={viewMode === 'split'}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors border-x border-[var(--kuromi-lavender)] ${
              viewMode === 'split'
                ? 'bg-[var(--kuromi-purple)] text-white'
                : 'bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-lavender)]'
            }`}
          >
            <Columns size={14} />
          </button>
          <button
            type="button"
            onClick={() => setViewMode('preview')}
            title="미리보기 모드"
            aria-label="미리보기 모드"
            aria-pressed={viewMode === 'preview'}
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium transition-colors ${
              viewMode === 'preview'
                ? 'bg-[var(--kuromi-purple)] text-white'
                : 'bg-[var(--kuromi-light-lavender)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-lavender)]'
            }`}
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Editor / Preview */}
      <div className={viewMode === 'split' ? 'flex' : ''}>
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div
            className={`relative ${viewMode === 'split' ? 'w-1/2 border-r border-[var(--kuromi-lavender)]' : 'w-full'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <textarea
              ref={textareaRef}
              value={value}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="마크다운으로 내용을 작성해주세요..."
              aria-label="마크다운 편집기"
              className={`w-full p-4 outline-none font-mono text-sm bg-[var(--color-surface)] text-[var(--text-primary)] ${
                viewMode === 'split'
                  ? 'h-[500px] overflow-y-auto resize-none'
                  : 'min-h-[400px] resize-y'
              }`}
            />
            {isDragging && (
              <div className="absolute inset-0 bg-[var(--kuromi-light-lavender)] bg-opacity-80 flex items-center justify-center border-2 border-dashed border-[var(--kuromi-purple)] rounded pointer-events-none">
                <p className="text-[var(--kuromi-dark-purple)] font-medium">
                  이미지를 여기에 놓으세요
                </p>
              </div>
            )}
          </div>
        )}

        {(viewMode === 'preview' || viewMode === 'split') && (
          <div
            className={`p-4 markdown-content overflow-y-auto ${
              viewMode === 'split'
                ? 'w-1/2 h-[500px]'
                : 'w-full min-h-[400px]'
            }`}
            aria-label="마크다운 미리보기"
            aria-live="polite"
          >
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema]]}
              components={createMarkdownComponents()}
            >
              {value || '*내용을 입력해주세요...*'}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[var(--kuromi-cream)] border-t border-[var(--kuromi-lavender)] text-xs text-[var(--text-muted)]">
        <span>{charCount}자 · {wordCount}단어</span>
        <span className="hidden sm:inline">
          Ctrl+B 굵게 · Ctrl+I 기울임 · Ctrl+K 링크 · Tab 들여쓰기
        </span>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={(e) => handleFileUpload(e, 'image')}
        className="hidden"
        aria-hidden="true"
      />
      <input
        ref={videoInputRef}
        type="file"
        accept="video/*"
        onChange={(e) => handleFileUpload(e, 'video')}
        className="hidden"
        aria-hidden="true"
      />

      {/* Image insertion dialog */}
      {imageDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleImageDialogClose}>
          <div
            className="bg-[var(--kuromi-white)] rounded-lg border-2 border-[var(--kuromi-black)] shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="이미지 설정"
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--kuromi-lavender)]">
              <h3 className="font-medium text-[var(--text-primary)]">이미지 설정</h3>
              <button
                type="button"
                onClick={handleImageDialogClose}
                className="p-1 rounded hover:bg-[var(--kuromi-light-lavender)] text-[var(--text-muted)]"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dialog body */}
            <div className="p-4 space-y-4">
              {/* Image previews */}
              {imageDialog.uploading ? (
                <div className="flex items-center justify-center py-8">
                  <p className="text-[var(--text-muted)]">업로드 중...</p>
                </div>
              ) : (
                <div className={`grid gap-2 ${
                  imageDialog.images.length > 1
                    ? imageDialog.galleryColumns === '1' ? 'grid-cols-1' :
                      imageDialog.galleryColumns === '2' ? 'grid-cols-2' :
                      imageDialog.galleryColumns === '3' ? 'grid-cols-3' : 'grid-cols-4'
                    : 'grid-cols-1'
                }`}>
                  {imageDialog.images.map((img, i) => (
                    <div key={i} className={`relative bg-[var(--kuromi-cream)] rounded overflow-hidden border border-[var(--kuromi-lavender)] ${
                      imageDialog.images.length > 1 && imageDialog.galleryColumns !== '1'
                        ? imageDialog.galleryFit === 'auto' ? '' :
                          imageDialog.galleryRatio === '1:1' ? 'aspect-square' :
                          imageDialog.galleryRatio === '3:4' ? 'aspect-[3/4]' :
                          imageDialog.galleryRatio === '16:9' ? 'aspect-video' :
                          'aspect-[4/3]'
                        : 'aspect-video'
                    }`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className={`w-full h-full ${
                        imageDialog.galleryFit === 'contain' ? 'object-contain' :
                        imageDialog.galleryFit === 'auto' ? 'object-contain' : 'object-cover'
                      }`} />
                    </div>
                  ))}
                </div>
              )}

              {!imageDialog.uploading && imageDialog.images.length > 0 && (
                <>
                  {/* Size selector */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">크기</label>
                    <div className="flex gap-2">
                      {(['25%', '50%', '75%', '100%'] as ImageSize[]).map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setImageDialog(prev => ({ ...prev, size: s }))}
                          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                            imageDialog.size === s
                              ? 'bg-[var(--kuromi-purple)] text-white'
                              : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Alignment selector */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">정렬</label>
                    <div className="flex gap-2">
                      {([
                        { value: 'left' as ImageAlign, icon: AlignLeft, label: '왼쪽' },
                        { value: 'center' as ImageAlign, icon: AlignCenter, label: '가운데' },
                        { value: 'right' as ImageAlign, icon: AlignRight, label: '오른쪽' },
                      ]).map(({ value: v, icon: Icon, label }) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setImageDialog(prev => ({ ...prev, align: v }))}
                          className={`flex items-center gap-1 px-3 py-1 rounded text-xs font-medium transition-colors ${
                            imageDialog.align === v
                              ? 'bg-[var(--kuromi-purple)] text-white'
                              : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                          }`}
                          aria-label={label}
                        >
                          <Icon size={14} />
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gallery options (only for multiple images) */}
                  {imageDialog.images.length > 1 && (
                    <>
                      {/* Column count */}
                      <div>
                        <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">열 수</label>
                        <div className="flex gap-2">
                          {(['1', '2', '3', '4'] as GalleryColumns[]).map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => setImageDialog(prev => ({ ...prev, galleryColumns: v }))}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                imageDialog.galleryColumns === v
                                  ? 'bg-[var(--kuromi-purple)] text-white'
                                  : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                              }`}
                            >
                              {v === '1' ? '1열 (세로)' : `${v}열`}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Display options (only when columns > 1) */}
                      {imageDialog.galleryColumns !== '1' && (
                        <>
                          {/* Fit mode */}
                          <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">이미지 표시</label>
                            <div className="flex gap-2">
                              {([
                                { value: 'auto' as GalleryFit, label: '원본 비율' },
                                { value: 'cover' as GalleryFit, label: '채우기' },
                                { value: 'contain' as GalleryFit, label: '맞춤' },
                              ]).map(({ value: v, label }) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setImageDialog(prev => ({ ...prev, galleryFit: v }))}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    imageDialog.galleryFit === v
                                      ? 'bg-[var(--kuromi-purple)] text-white'
                                      : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            <p className="text-xs text-[var(--text-muted)] mt-1">
                              {imageDialog.galleryFit === 'auto' && '각 이미지의 원래 비율을 유지합니다'}
                              {imageDialog.galleryFit === 'cover' && '영역을 꽉 채우며, 넘치는 부분은 잘립니다'}
                              {imageDialog.galleryFit === 'contain' && '이미지 전체가 보이도록 맞춥니다'}
                            </p>
                          </div>

                          {/* Aspect ratio (only when fit is cover or contain) */}
                          {imageDialog.galleryFit !== 'auto' && (
                            <div>
                              <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">종횡비</label>
                              <div className="flex gap-2 flex-wrap">
                                {([
                                  { value: 'auto' as GalleryRatio, label: '자동' },
                                  { value: '1:1' as GalleryRatio, label: '1:1' },
                                  { value: '4:3' as GalleryRatio, label: '4:3' },
                                  { value: '3:4' as GalleryRatio, label: '3:4' },
                                  { value: '16:9' as GalleryRatio, label: '16:9' },
                                ]).map(({ value: v, label }) => (
                                  <button
                                    key={v}
                                    type="button"
                                    onClick={() => setImageDialog(prev => ({ ...prev, galleryRatio: v }))}
                                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                      imageDialog.galleryRatio === v
                                        ? 'bg-[var(--kuromi-purple)] text-white'
                                        : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Gap */}
                          <div>
                            <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">간격</label>
                            <div className="flex gap-2">
                              {([
                                { value: 'none' as GalleryGap, label: '없음' },
                                { value: 'sm' as GalleryGap, label: '좁게' },
                                { value: 'md' as GalleryGap, label: '보통' },
                                { value: 'lg' as GalleryGap, label: '넓게' },
                              ]).map(({ value: v, label }) => (
                                <button
                                  key={v}
                                  type="button"
                                  onClick={() => setImageDialog(prev => ({ ...prev, galleryGap: v }))}
                                  className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                    imageDialog.galleryGap === v
                                      ? 'bg-[var(--kuromi-purple)] text-white'
                                      : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </>
                  )}

                  {/* Caption input */}
                  <div>
                    <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">캡션 (선택사항)</label>
                    <input
                      type="text"
                      value={imageDialog.caption}
                      onChange={(e) => setImageDialog(prev => ({ ...prev, caption: e.target.value }))}
                      placeholder="이미지 설명을 입력하세요..."
                      className="w-full px-3 py-2 rounded border border-[var(--kuromi-lavender)] bg-[var(--color-surface)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--kuromi-purple)]"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Dialog footer */}
            {!imageDialog.uploading && imageDialog.images.length > 0 && (
              <div className="flex justify-end gap-2 p-4 border-t border-[var(--kuromi-lavender)]">
                <button
                  type="button"
                  onClick={handleImageDialogClose}
                  className="px-4 py-2 rounded text-sm font-medium bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)] transition-colors"
                >
                  취소
                </button>
                <button
                  type="button"
                  onClick={handleImageDialogInsert}
                  className="px-4 py-2 rounded text-sm font-medium bg-[var(--kuromi-purple)] text-white hover:opacity-90 transition-colors"
                >
                  삽입
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* YouTube insertion dialog */}
      {youtubeDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleYoutubeDialogClose}>
          <div
            className="bg-[var(--kuromi-white)] rounded-lg border-2 border-[var(--kuromi-black)] shadow-xl w-full max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="YouTube 삽입"
          >
            {/* Dialog header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--kuromi-lavender)]">
              <h3 className="font-medium text-[var(--text-primary)] flex items-center gap-2">
                <Youtube size={20} className="text-red-500" />
                YouTube 삽입
              </h3>
              <button
                type="button"
                onClick={handleYoutubeDialogClose}
                className="p-1 rounded hover:bg-[var(--kuromi-light-lavender)] text-[var(--text-muted)]"
                aria-label="닫기"
              >
                <X size={18} />
              </button>
            </div>

            {/* Dialog body */}
            <div className="p-4 space-y-4">
              {/* URL input */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">
                  YouTube URL 또는 영상 ID
                </label>
                <input
                  type="text"
                  value={youtubeDialog.url}
                  onChange={(e) => setYoutubeDialog(prev => ({ ...prev, url: e.target.value, error: '' }))}
                  placeholder="https://www.youtube.com/watch?v=... 또는 영상 ID"
                  className="w-full px-3 py-2 rounded border border-[var(--kuromi-lavender)] bg-[var(--color-surface)] text-sm text-[var(--text-primary)] outline-none focus:border-[var(--kuromi-purple)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleYoutubeInsert();
                    }
                  }}
                />
                {youtubeDialog.error && (
                  <p className="text-xs text-red-500 mt-1">{youtubeDialog.error}</p>
                )}
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  예: https://youtu.be/dQw4w9WgXcQ 또는 dQw4w9WgXcQ
                </p>
              </div>

              {/* Size selector */}
              <div>
                <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">크기</label>
                <div className="flex gap-2 flex-wrap">
                  {([
                    { value: 'small' as YouTubeSize, label: '작게', desc: '320×180' },
                    { value: 'medium' as YouTubeSize, label: '보통', desc: '560×315' },
                    { value: 'large' as YouTubeSize, label: '크게', desc: '853×480' },
                    { value: 'full' as YouTubeSize, label: '전체', desc: '100%' },
                  ]).map(({ value: v, label, desc }) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setYoutubeDialog(prev => ({ ...prev, size: v }))}
                      className={`flex flex-col items-center px-3 py-2 rounded text-xs font-medium transition-colors ${
                        youtubeDialog.size === v
                          ? 'bg-[var(--kuromi-purple)] text-white'
                          : 'bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)]'
                      }`}
                    >
                      <span>{label}</span>
                      <span className={`text-[10px] ${youtubeDialog.size === v ? 'text-white/70' : 'text-[var(--text-muted)]'}`}>
                        {desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              {youtubeDialog.url && extractYouTubeId(youtubeDialog.url) && (
                <div>
                  <label className="block text-xs font-medium text-[var(--text-muted)] mb-1">미리보기</label>
                  <div className="bg-[var(--kuromi-cream)] rounded p-2 overflow-hidden">
                    <div className={youtubeDialog.size === 'full' ? 'relative pb-[56.25%] h-0' : 'flex justify-center'}>
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYouTubeId(youtubeDialog.url)}`}
                        width={youtubeDialog.size === 'full' ? '100%' : YOUTUBE_SIZES[youtubeDialog.size].width}
                        height={youtubeDialog.size === 'full' ? '100%' : YOUTUBE_SIZES[youtubeDialog.size].height}
                        className={youtubeDialog.size === 'full' ? 'absolute top-0 left-0 w-full h-full' : 'max-w-full'}
                        style={youtubeDialog.size !== 'full' ? { maxHeight: '200px', width: 'auto', aspectRatio: '16/9' } : undefined}
                        title="YouTube 미리보기"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Dialog footer */}
            <div className="flex justify-end gap-2 p-4 border-t border-[var(--kuromi-lavender)]">
              <button
                type="button"
                onClick={handleYoutubeDialogClose}
                className="px-4 py-2 rounded text-sm font-medium bg-[var(--kuromi-cream)] text-[var(--kuromi-dark-purple)] hover:bg-[var(--kuromi-light-lavender)] transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleYoutubeInsert}
                className="px-4 py-2 rounded text-sm font-medium bg-red-500 text-white hover:bg-red-600 transition-colors"
              >
                삽입
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
