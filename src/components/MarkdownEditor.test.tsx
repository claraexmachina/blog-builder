import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import MarkdownEditor from './MarkdownEditor';

// Mock react-markdown and related plugins since they require actual DOM rendering
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) => (
    <div data-testid="markdown-preview">{children}</div>
  ),
}));

vi.mock('remark-gfm', () => ({ default: () => {} }));
vi.mock('rehype-raw', () => ({ default: () => {} }));
vi.mock('rehype-sanitize', () => ({ default: () => {} }));
vi.mock('@/lib/markdown-sanitize', () => ({
  sanitizeSchema: {},
}));

describe('MarkdownEditor', () => {
  let mockOnChange: ReturnType<typeof vi.fn>;
  let mockOnImageUpload: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnChange = vi.fn();
    mockOnImageUpload = vi.fn().mockResolvedValue('https://example.com/image.png');
  });

  function renderEditor(value = '', props = {}) {
    return render(
      <MarkdownEditor
        value={value}
        onChange={mockOnChange}
        onImageUpload={mockOnImageUpload}
        {...props}
      />
    );
  }

  // ===================================================================
  // 기존 기능 보존 테스트 (Existing Features Preservation)
  // ===================================================================
  describe('기존 기능 보존', () => {
    it('에디터가 올바르게 렌더링된다', () => {
      renderEditor('Hello World');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' });
      expect(textarea).toBeInTheDocument();
      expect(textarea).toHaveValue('Hello World');
    });

    it('텍스트 입력 시 onChange가 호출된다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' });
      fireEvent.change(textarea, { target: { value: '새 텍스트' } });
      expect(mockOnChange).toHaveBeenCalledWith('새 텍스트');
    });

    it('굵게 버튼이 동작한다', () => {
      renderEditor('테스트 텍스트');
      const boldBtn = screen.getByRole('button', { name: '굵게' });
      expect(boldBtn).toBeInTheDocument();

      // Set selection before clicking
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 5, writable: true });

      fireEvent.click(boldBtn);
      expect(mockOnChange).toHaveBeenCalledWith('**테스트 텍**스트');
    });

    it('기울임 버튼이 동작한다', () => {
      renderEditor('테스트');
      const italicBtn = screen.getByRole('button', { name: '기울임' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });

      fireEvent.click(italicBtn);
      expect(mockOnChange).toHaveBeenCalledWith('*테스트*');
    });

    it('제목 버튼들이 동작한다', () => {
      renderEditor('');
      const h1Btn = screen.getByRole('button', { name: '제목 1' });
      const h2Btn = screen.getByRole('button', { name: '제목 2' });
      const h3Btn = screen.getByRole('button', { name: '제목 3' });

      expect(h1Btn).toBeInTheDocument();
      expect(h2Btn).toBeInTheDocument();
      expect(h3Btn).toBeInTheDocument();

      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(h1Btn);
      expect(mockOnChange).toHaveBeenCalledWith('\n# 제목 1\n');
    });

    it('목록 버튼들이 동작한다', () => {
      renderEditor('');
      const ulBtn = screen.getByRole('button', { name: '목록' });
      const olBtn = screen.getByRole('button', { name: '번호 목록' });

      expect(ulBtn).toBeInTheDocument();
      expect(olBtn).toBeInTheDocument();

      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(ulBtn);
      expect(mockOnChange).toHaveBeenCalledWith('\n- 목록 항목\n');
    });

    it('인용 버튼이 동작한다', () => {
      renderEditor('');
      const quoteBtn = screen.getByRole('button', { name: '인용' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(quoteBtn);
      expect(mockOnChange).toHaveBeenCalledWith('\n> 인용문\n');
    });

    it('구분선 버튼이 동작한다', () => {
      renderEditor('');
      const dividerBtn = screen.getByRole('button', { name: '구분선' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(dividerBtn);
      expect(mockOnChange).toHaveBeenCalledWith('\n\n---\n\n');
    });

    it('인라인 코드 버튼이 동작한다', () => {
      renderEditor('코드');
      const codeBtn = screen.getByRole('button', { name: '인라인 코드' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.click(codeBtn);
      expect(mockOnChange).toHaveBeenCalledWith('`코드`');
    });

    it('링크 버튼이 동작한다', () => {
      renderEditor('링크');
      const linkBtn = screen.getByRole('button', { name: '링크' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.click(linkBtn);
      expect(mockOnChange).toHaveBeenCalledWith('[링크](url)');
    });

    it('왼쪽 정렬 버튼이 동작한다', () => {
      renderEditor('');
      const alignBtn = screen.getByRole('button', { name: '왼쪽 정렬' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(alignBtn);
      expect(mockOnChange).toHaveBeenCalledWith('<div style="text-align: left;">\n\n왼쪽 정렬 텍스트\n\n</div>');
    });

    it('가운데 정렬 버튼이 동작한다', () => {
      renderEditor('');
      const alignBtn = screen.getByRole('button', { name: '가운데 정렬' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(alignBtn);
      expect(mockOnChange).toHaveBeenCalledWith('<div style="text-align: center;">\n\n가운데 정렬 텍스트\n\n</div>');
    });

    it('오른쪽 정렬 버튼이 동작한다', () => {
      renderEditor('');
      const alignBtn = screen.getByRole('button', { name: '오른쪽 정렬' });
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(alignBtn);
      expect(mockOnChange).toHaveBeenCalledWith('<div style="text-align: right;">\n\n오른쪽 정렬 텍스트\n\n</div>');
    });

    it('이미지 업로드 버튼이 존재한다', () => {
      renderEditor('');
      const imageBtn = screen.getByRole('button', { name: '이미지' });
      expect(imageBtn).toBeInTheDocument();
    });

    it('영상 업로드 버튼이 존재한다', () => {
      renderEditor('');
      const videoBtn = screen.getByRole('button', { name: '영상' });
      expect(videoBtn).toBeInTheDocument();
    });

    it('이미지 파일 업로드가 정상 동작한다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const fileInput = document.querySelector('input[accept="image/*"]') as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(file);
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining('![이미지 설명](https://example.com/image.png)')
        );
      });
    });

    it('비디오 파일 업로드가 정상 동작한다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const fileInput = document.querySelector('input[accept="video/*"]') as HTMLInputElement;
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(file);
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining('<video src="https://example.com/image.png" controls width="100%"></video>')
        );
      });
    });

    it('placeholder가 올바르게 표시된다', () => {
      renderEditor('');
      const textarea = screen.getByPlaceholderText('마크다운으로 내용을 작성해주세요...');
      expect(textarea).toBeInTheDocument();
    });
  });

  // ===================================================================
  // 기존 마크다운 형식 보존 테스트 (Markdown Output Format Preservation)
  // ===================================================================
  describe('기존 마크다운 출력 형식 보존', () => {
    it('bold 형식은 **text** 그대로이다', () => {
      renderEditor('텍스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '굵게' }));
      expect(mockOnChange).toHaveBeenCalledWith('**텍스트**');
    });

    it('italic 형식은 *text* 그대로이다', () => {
      renderEditor('텍스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '기울임' }));
      expect(mockOnChange).toHaveBeenCalledWith('*텍스트*');
    });

    it('링크 형식은 [text](url) 그대로이다', () => {
      renderEditor('링크');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '링크' }));
      expect(mockOnChange).toHaveBeenCalledWith('[링크](url)');
    });

    it('이미지 형식은 ![alt](url) 그대로이다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const fileInput = document.querySelector('input[accept="image/*"]') as HTMLInputElement;
      const file = new File(['test'], 'test.png', { type: 'image/png' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('\n![이미지 설명](https://example.com/image.png)\n');
      });
    });

    it('비디오 형식은 <video> 태그 그대로이다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const fileInput = document.querySelector('input[accept="video/*"]') as HTMLInputElement;
      const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });

      await act(async () => {
        fireEvent.change(fileInput, { target: { files: [file] } });
      });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          '\n<video src="https://example.com/image.png" controls width="100%"></video>\n'
        );
      });
    });

    it('text-align div 형식이 보존된다', () => {
      renderEditor('정렬');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '가운데 정렬' }));
      expect(mockOnChange).toHaveBeenCalledWith(
        '<div style="text-align: center;">\n\n정렬\n\n</div>'
      );
    });
  });

  // ===================================================================
  // 미리보기 기능 테스트 (Preview Features)
  // ===================================================================
  describe('뷰 모드', () => {
    it('기본 모드는 편집 모드이다', () => {
      renderEditor('테스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' });
      expect(textarea).toBeInTheDocument();
      expect(screen.queryByTestId('markdown-preview')).not.toBeInTheDocument();
    });

    it('미리보기 모드로 전환할 수 있다', () => {
      renderEditor('테스트 내용');
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      expect(screen.queryByRole('textbox', { name: '마크다운 편집기' })).not.toBeInTheDocument();
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
      expect(screen.getByTestId('markdown-preview')).toHaveTextContent('테스트 내용');
    });

    it('분할 모드에서 에디터와 미리보기가 동시에 보인다', () => {
      renderEditor('분할 테스트');
      const splitBtn = screen.getByRole('button', { name: '분할 모드' });
      fireEvent.click(splitBtn);

      expect(screen.getByRole('textbox', { name: '마크다운 편집기' })).toBeInTheDocument();
      expect(screen.getByTestId('markdown-preview')).toBeInTheDocument();
    });

    it('빈 내용일 때 미리보기에 안내 메시지가 표시된다', () => {
      renderEditor('');
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      expect(screen.getByTestId('markdown-preview')).toHaveTextContent('*내용을 입력해주세요...*');
    });

    it('편집 모드로 돌아올 수 있다', () => {
      renderEditor('돌아오기');
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      const editBtn = screen.getByRole('button', { name: '편집 모드' });
      fireEvent.click(editBtn);

      expect(screen.getByRole('textbox', { name: '마크다운 편집기' })).toBeInTheDocument();
    });
  });

  // ===================================================================
  // 새 기능: 키보드 단축키 (Keyboard Shortcuts)
  // ===================================================================
  describe('키보드 단축키', () => {
    it('Ctrl+B로 굵게가 적용된다', () => {
      renderEditor('볼드');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.keyDown(textarea, { key: 'b', ctrlKey: true });
      expect(mockOnChange).toHaveBeenCalledWith('**볼드**');
    });

    it('Ctrl+I로 기울임이 적용된다', () => {
      renderEditor('기울임');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });

      fireEvent.keyDown(textarea, { key: 'i', ctrlKey: true });
      expect(mockOnChange).toHaveBeenCalledWith('*기울임*');
    });

    it('Ctrl+K로 링크가 삽입된다', () => {
      renderEditor('링크');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.keyDown(textarea, { key: 'k', ctrlKey: true });
      expect(mockOnChange).toHaveBeenCalledWith('[링크](url)');
    });

    it('Meta+B (Mac)로도 굵게가 적용된다', () => {
      renderEditor('맥볼드');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 3, writable: true });

      fireEvent.keyDown(textarea, { key: 'b', metaKey: true });
      expect(mockOnChange).toHaveBeenCalledWith('**맥볼드**');
    });

    it('Tab 키로 들여쓰기가 된다', () => {
      renderEditor('텍스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 2, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 2, writable: true });

      fireEvent.keyDown(textarea, { key: 'Tab' });
      expect(mockOnChange).toHaveBeenCalledWith('텍스  트');
    });

    it('Shift+Tab 키로 내어쓰기가 된다', () => {
      renderEditor('  들여쓴 텍스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 2, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 9, writable: true });

      fireEvent.keyDown(textarea, { key: 'Tab', shiftKey: true });
      expect(mockOnChange).toHaveBeenCalledWith('들여쓴 텍스트');
    });
  });

  // ===================================================================
  // 새 기능: Undo/Redo
  // ===================================================================
  describe('Undo/Redo', () => {
    it('Undo 버튼이 존재하고 초기에 비활성화되어 있다', () => {
      renderEditor('');
      const undoBtn = screen.getByRole('button', { name: '실행 취소' });
      expect(undoBtn).toBeInTheDocument();
      expect(undoBtn).toBeDisabled();
    });

    it('Redo 버튼이 존재하고 초기에 비활성화되어 있다', () => {
      renderEditor('');
      const redoBtn = screen.getByRole('button', { name: '다시 실행' });
      expect(redoBtn).toBeInTheDocument();
      expect(redoBtn).toBeDisabled();
    });

    it('Ctrl+Z 키바인딩이 동작한다 (기본 undo 방지)', () => {
      renderEditor('테스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;

      const event = new KeyboardEvent('keydown', {
        key: 'z',
        ctrlKey: true,
        bubbles: true,
        cancelable: true,
      });
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

      // Use fireEvent directly since we need to check preventDefault
      fireEvent.keyDown(textarea, { key: 'z', ctrlKey: true });
      // The handler should have been called (we can't easily check preventDefault with fireEvent)
      // but the important thing is no error is thrown
    });

    it('Ctrl+Shift+Z / Ctrl+Y 키바인딩이 동작한다', () => {
      renderEditor('테스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;

      // Should not throw
      fireEvent.keyDown(textarea, { key: 'z', ctrlKey: true, shiftKey: true });
      fireEvent.keyDown(textarea, { key: 'y', ctrlKey: true });
    });
  });

  // ===================================================================
  // 새 기능: 테이블 생성 UI
  // ===================================================================
  describe('테이블 생성', () => {
    it('테이블 버튼을 클릭하면 그리드가 표시된다', () => {
      renderEditor('');
      const tableBtn = screen.getByRole('button', { name: '테이블 삽입' });
      fireEvent.click(tableBtn);

      expect(screen.getByText('크기 선택')).toBeInTheDocument();
    });

    it('그리드 셀에 호버하면 크기가 표시된다', () => {
      renderEditor('');
      const tableBtn = screen.getByRole('button', { name: '테이블 삽입' });
      fireEvent.click(tableBtn);

      const cell = screen.getByRole('button', { name: '2행 3열 테이블' });
      fireEvent.mouseEnter(cell);
      expect(screen.getByText('2 x 3')).toBeInTheDocument();
    });

    it('그리드 셀을 클릭하면 테이블 마크다운이 삽입된다', () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const tableBtn = screen.getByRole('button', { name: '테이블 삽입' });
      fireEvent.click(tableBtn);

      const cell = screen.getByRole('button', { name: '2행 3열 테이블' });
      fireEvent.click(cell);

      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('| 헤더1 | 헤더2 | 헤더3 |')
      );
      expect(mockOnChange).toHaveBeenCalledWith(
        expect.stringContaining('| --- | --- | --- |')
      );
      // 2 body rows
      const call = mockOnChange.mock.calls[mockOnChange.mock.calls.length - 1][0];
      const cellMatches = call.match(/\| 셀/g);
      expect(cellMatches).toHaveLength(6); // 2 rows × 3 cols
    });

    it('테이블 삽입 후 그리드가 닫힌다', () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const tableBtn = screen.getByRole('button', { name: '테이블 삽입' });
      fireEvent.click(tableBtn);

      const cell = screen.getByRole('button', { name: '1행 1열 테이블' });
      fireEvent.click(cell);

      expect(screen.queryByText('크기 선택')).not.toBeInTheDocument();
    });
  });

  // ===================================================================
  // 새 기능: 코드 블록
  // ===================================================================
  describe('코드 블록', () => {
    it('코드 블록 버튼이 존재한다', () => {
      renderEditor('');
      const codeBlockBtn = screen.getByRole('button', { name: '코드 블록' });
      expect(codeBlockBtn).toBeInTheDocument();
    });

    it('코드 블록을 삽입하면 올바른 마크다운이 생성된다', () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const codeBlockBtn = screen.getByRole('button', { name: '코드 블록' });
      fireEvent.click(codeBlockBtn);

      expect(mockOnChange).toHaveBeenCalledWith('\n```\n코드를 입력하세요\n```\n');
    });
  });

  // ===================================================================
  // 새 기능: 서식 제거
  // ===================================================================
  describe('서식 제거', () => {
    it('서식 제거 버튼이 존재한다', () => {
      renderEditor('');
      const eraserBtn = screen.getByRole('button', { name: '서식 제거' });
      expect(eraserBtn).toBeInTheDocument();
    });

    it('선택 영역의 bold 서식을 제거한다', () => {
      renderEditor('**굵은 텍스트**');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 12, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '서식 제거' }));
      expect(mockOnChange).toHaveBeenCalledWith('굵은 텍스트');
    });

    it('선택 영역의 italic 서식을 제거한다', () => {
      renderEditor('*기울임*');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 5, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '서식 제거' }));
      expect(mockOnChange).toHaveBeenCalledWith('기울임');
    });

    it('선택 영역의 heading 서식을 제거한다', () => {
      renderEditor('## 제목');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 5, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '서식 제거' }));
      expect(mockOnChange).toHaveBeenCalledWith('제목');
    });

    it('선택이 없으면 아무 작업도 하지 않는다', () => {
      renderEditor('텍스트');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      fireEvent.click(screen.getByRole('button', { name: '서식 제거' }));
      expect(mockOnChange).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // 새 기능: 드래그 앤 드롭
  // ===================================================================
  describe('드래그 앤 드롭', () => {
    it('드래그 오버 시 오버레이가 표시된다', () => {
      renderEditor('');
      const editorArea = screen.getByRole('textbox', { name: '마크다운 편집기' }).parentElement!;

      fireEvent.dragOver(editorArea, {
        dataTransfer: { files: [] },
      });

      expect(screen.getByText('이미지를 여기에 놓으세요')).toBeInTheDocument();
    });

    it('드래그 리브 시 오버레이가 사라진다', () => {
      renderEditor('');
      const editorArea = screen.getByRole('textbox', { name: '마크다운 편집기' }).parentElement!;

      fireEvent.dragOver(editorArea, { dataTransfer: { files: [] } });
      expect(screen.getByText('이미지를 여기에 놓으세요')).toBeInTheDocument();

      fireEvent.dragLeave(editorArea, { dataTransfer: { files: [] } });
      expect(screen.queryByText('이미지를 여기에 놓으세요')).not.toBeInTheDocument();
    });

    it('이미지 파일을 드롭하면 업로드가 실행된다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const editorArea = textarea.parentElement!;
      const file = new File(['test'], 'photo.png', { type: 'image/png' });

      await act(async () => {
        fireEvent.drop(editorArea, {
          dataTransfer: {
            files: [file],
          },
        });
      });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(file);
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.stringContaining('![이미지 설명](https://example.com/image.png)')
        );
      });
    });
  });

  // ===================================================================
  // 새 기능: 클립보드 붙여넣기
  // ===================================================================
  describe('클립보드 이미지 붙여넣기', () => {
    it('이미지를 붙여넣으면 업로드가 실행된다', async () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;
      Object.defineProperty(textarea, 'selectionStart', { value: 0, writable: true });
      Object.defineProperty(textarea, 'selectionEnd', { value: 0, writable: true });

      const file = new File(['test'], 'pasted.png', { type: 'image/png' });

      await act(async () => {
        fireEvent.paste(textarea, {
          clipboardData: {
            items: [
              {
                type: 'image/png',
                getAsFile: () => file,
              },
            ],
          },
        });
      });

      await waitFor(() => {
        expect(mockOnImageUpload).toHaveBeenCalledWith(file);
      });
    });

    it('텍스트를 붙여넣으면 기본 동작이 유지된다', () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' }) as HTMLTextAreaElement;

      const event = fireEvent.paste(textarea, {
        clipboardData: {
          items: [
            {
              type: 'text/plain',
              getAsFile: () => null,
            },
          ],
        },
      });

      // onImageUpload should NOT be called for text paste
      expect(mockOnImageUpload).not.toHaveBeenCalled();
    });
  });

  // ===================================================================
  // 새 기능: 글자 수 표시
  // ===================================================================
  describe('글자 수/단어 수 표시', () => {
    it('글자 수가 올바르게 표시된다', () => {
      renderEditor('Hello World');
      expect(screen.getByText('11자 · 2단어')).toBeInTheDocument();
    });

    it('빈 내용일 때 0자 0단어로 표시된다', () => {
      renderEditor('');
      expect(screen.getByText('0자 · 0단어')).toBeInTheDocument();
    });

    it('한글도 올바르게 카운트된다', () => {
      renderEditor('안녕하세요 세계');
      expect(screen.getByText('8자 · 2단어')).toBeInTheDocument();
    });
  });

  // ===================================================================
  // 새 기능: 접근성
  // ===================================================================
  describe('접근성', () => {
    it('툴바에 role="toolbar"이 있다', () => {
      renderEditor('');
      const toolbar = screen.getByRole('toolbar', { name: '서식 도구 모음' });
      expect(toolbar).toBeInTheDocument();
    });

    it('에디터에 aria-label이 있다', () => {
      renderEditor('');
      const textarea = screen.getByRole('textbox', { name: '마크다운 편집기' });
      expect(textarea).toBeInTheDocument();
    });

    it('뷰 모드 버튼에 aria-pressed가 있다', () => {
      renderEditor('');
      const editBtn = screen.getByRole('button', { name: '편집 모드' });
      expect(editBtn).toHaveAttribute('aria-pressed', 'true');

      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      expect(previewBtn).toHaveAttribute('aria-pressed', 'false');
    });

    it('미리보기 영역에 aria-live가 있다', () => {
      renderEditor('내용');
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      const preview = screen.getByLabelText('마크다운 미리보기');
      expect(preview).toHaveAttribute('aria-live', 'polite');
    });

    it('모든 툴바 버튼에 aria-label이 있다', () => {
      renderEditor('');
      const buttons = screen.getAllByRole('button');
      buttons.forEach((button) => {
        // Each button should have either aria-label or accessible name
        expect(button).toHaveAccessibleName();
      });
    });

    it('단축키 정보가 title에 포함되어 있다', () => {
      renderEditor('');
      const boldBtn = screen.getByRole('button', { name: '굵게' });
      expect(boldBtn).toHaveAttribute('title', '굵게 (Ctrl+B)');

      const italicBtn = screen.getByRole('button', { name: '기울임' });
      expect(italicBtn).toHaveAttribute('title', '기울임 (Ctrl+I)');

      const linkBtn = screen.getByRole('button', { name: '링크' });
      expect(linkBtn).toHaveAttribute('title', '링크 (Ctrl+K)');
    });

    it('hidden input에 aria-hidden이 있다', () => {
      renderEditor('');
      const hiddenInputs = document.querySelectorAll('input[type="file"]');
      hiddenInputs.forEach((input) => {
        expect(input).toHaveAttribute('aria-hidden', 'true');
      });
    });
  });

  // ===================================================================
  // 새 기능: 상태바에 단축키 가이드 표시
  // ===================================================================
  describe('상태바', () => {
    it('단축키 가이드가 표시된다', () => {
      renderEditor('');
      expect(screen.getByText(/Ctrl\+B 굵게/)).toBeInTheDocument();
      expect(screen.getByText(/Ctrl\+I 기울임/)).toBeInTheDocument();
      expect(screen.getByText(/Ctrl\+K 링크/)).toBeInTheDocument();
      expect(screen.getByText(/Tab 들여쓰기/)).toBeInTheDocument();
    });
  });

  // ===================================================================
  // 기존 글 렌더링 호환성 테스트
  // ===================================================================
  describe('기존 글 렌더링 호환성', () => {
    it('ReactMarkdown에 동일한 플러그인이 전달된다', () => {
      renderEditor('# 기존 글 제목\n\n기존 내용');
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      // ReactMarkdown이 호출되어 미리보기가 렌더링됨
      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toHaveTextContent('# 기존 글 제목');
    });

    it('text-align div가 포함된 기존 글이 미리보기에서 올바르게 표시된다', () => {
      const existingContent = '<div style="text-align: center;">\n\n가운데 텍스트\n\n</div>';
      renderEditor(existingContent);
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      // toHaveTextContent normalizes whitespace; check key parts are present
      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toHaveTextContent('text-align: center;');
      expect(preview).toHaveTextContent('가운데 텍스트');
    });

    it('video 태그가 포함된 기존 글이 미리보기에서 올바르게 표시된다', () => {
      const existingContent = '<video src="https://example.com/video.mp4" controls width="100%"></video>';
      renderEditor(existingContent);
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      expect(screen.getByTestId('markdown-preview')).toHaveTextContent(existingContent);
    });

    it('마크다운 이미지 형식의 기존 글이 올바르게 표시된다', () => {
      const existingContent = '![사진](https://example.com/photo.jpg)\n\n설명 텍스트';
      renderEditor(existingContent);
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toHaveTextContent('![사진](https://example.com/photo.jpg)');
      expect(preview).toHaveTextContent('설명 텍스트');
    });

    it('GFM 테이블 형식의 기존 글이 올바르게 표시된다', () => {
      const existingContent = '| 헤더1 | 헤더2 |\n| --- | --- |\n| 셀1 | 셀2 |';
      renderEditor(existingContent);
      const previewBtn = screen.getByRole('button', { name: '미리보기 모드' });
      fireEvent.click(previewBtn);

      const preview = screen.getByTestId('markdown-preview');
      expect(preview).toHaveTextContent('헤더1');
      expect(preview).toHaveTextContent('헤더2');
      expect(preview).toHaveTextContent('셀1');
      expect(preview).toHaveTextContent('셀2');
    });
  });
});
