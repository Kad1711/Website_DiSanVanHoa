import { useState, useRef, useEffect } from 'react';
import mammoth from 'mammoth';
import toast from 'react-hot-toast';
import {
  ArrowUpTrayIcon,
  CodeBracketIcon,
  EyeIcon,
  PencilSquareIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

const RichContentEditor = ({ value = '', onChange, placeholder = 'Nhập nội dung tác phẩm hoặc tải lên tệp Word...' }) => {
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('visual'); // 'visual' | 'source' | 'preview'
  const [sourceCode, setSourceCode] = useState(value || '');
  const [isImporting, setIsImporting] = useState(false);

  // Sync external value to editor
  useEffect(() => {
    if (editorRef.current && mode === 'visual') {
      if (editorRef.current.innerHTML !== (value || '')) {
        editorRef.current.innerHTML = value || '';
      }
    }
    setSourceCode(value || '');
  }, [value, mode]);

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      setSourceCode(html);
      if (onChange) onChange(html);
    }
  };

  const handleSourceChange = (e) => {
    const val = e.target.value;
    setSourceCode(val);
    if (onChange) onChange(val);
  };

  const execCommand = (cmd, val = null) => {
    if (mode !== 'visual') return;
    document.execCommand(cmd, false, val);
    handleInput();
  };

  // 📂 Import from Word (.docx) using mammoth
  const handleWordUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.docx')) {
      toast.error('Vui lòng chọn tệp định dạng Word (.docx).');
      return;
    }

    try {
      setIsImporting(true);
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml(
        { arrayBuffer },
        {
          styleMap: [
            "p[style-name='Heading 1'] => h2:fresh",
            "p[style-name='Heading 2'] => h3:fresh",
            "p[style-name='Heading 3'] => h4:fresh",
            "p[style-name='Quote'] => blockquote:fresh",
          ],
        }
      );

      const html = result.value || '';
      if (editorRef.current) {
        editorRef.current.innerHTML = html;
      }
      setSourceCode(html);
      if (onChange) onChange(html);

      toast.success(`Đã nạp thành công nội dung từ "${file.name}"!`);
      if (result.messages && result.messages.length > 0) {
        console.warn('Word conversion notices:', result.messages);
      }
    } catch (err) {
      console.error('Word import error:', err);
      toast.error('Không thể đọc file Word. Vui lòng kiểm tra lại định dạng tệp .docx.');
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClear = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ nội dung trong khung soạn thảo?')) {
      if (editorRef.current) editorRef.current.innerHTML = '';
      setSourceCode('');
      if (onChange) onChange('');
    }
  };

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
      {/* ── TOOLBAR ── */}
      <div className="bg-gray-50/90 border-b border-gray-200 p-2 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Left: Formatting buttons */}
        <div className="flex items-center flex-wrap gap-1">
          <button
            type="button"
            onClick={() => execCommand('bold')}
            title="In đậm (Ctrl+B)"
            className="w-8 h-8 rounded-lg font-bold text-sm text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            B
          </button>
          <button
            type="button"
            onClick={() => execCommand('italic')}
            title="In nghiêng (Ctrl+I)"
            className="w-8 h-8 rounded-lg italic font-serif text-sm text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            I
          </button>
          <button
            type="button"
            onClick={() => execCommand('underline')}
            title="Gạch chân (Ctrl+U)"
            className="w-8 h-8 rounded-lg underline text-sm text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            U
          </button>

          <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h2>')}
            title="Tiêu đề mục (H2)"
            className="px-2 h-8 rounded-lg font-bold text-xs text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            H2
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<h3>')}
            title="Tiêu đề nhỏ (H3)"
            className="px-2 h-8 rounded-lg font-semibold text-xs text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            H3
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<p>')}
            title="Đoạn văn chuẩn (Paragraph)"
            className="px-2 h-8 rounded-lg text-xs text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            Văn bản
          </button>

          <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => execCommand('insertUnorderedList')}
            title="Danh sách dấu chấm"
            className="w-8 h-8 rounded-lg text-sm text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            • list
          </button>
          <button
            type="button"
            onClick={() => execCommand('insertOrderedList')}
            title="Danh sách số thứ tự"
            className="w-8 h-8 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            1. list
          </button>
          <button
            type="button"
            onClick={() => execCommand('formatBlock', '<blockquote>')}
            title="Trích dẫn đoạn thơ / lời nhân vật"
            className="w-8 h-8 rounded-lg text-xs font-serif italic text-gray-700 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            “ ”
          </button>

          <div className="w-[1px] h-5 bg-gray-300 mx-1"></div>

          <button
            type="button"
            onClick={() => execCommand('removeFormat')}
            title="Xóa định dạng"
            className="px-2 h-8 rounded-lg text-xs text-gray-500 hover:bg-gray-200/80 active:bg-gray-300 flex items-center justify-center cursor-pointer"
          >
            Xóa định dạng
          </button>
        </div>

        {/* Right: Word Import & Mode Switchers */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* 📂 NÚT TẢI LÊN FILE WORD (.DOCX) */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleWordUpload}
            accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isImporting}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-all shadow-sm cursor-pointer"
            title="Nhập toàn bộ văn bản từ tệp Word (.docx)"
          >
            <ArrowUpTrayIcon className="w-3.5 h-3.5 text-blue-600" />
            <span>{isImporting ? 'Đang trích xuất...' : 'Nhập từ file Word (.docx)'}</span>
          </button>

          {/* Mode switch buttons */}
          <div className="flex items-center bg-gray-200/70 p-0.5 rounded-xl">
            <button
              type="button"
              onClick={() => setMode('visual')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                mode === 'visual' ? 'bg-white text-gray-800 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Soạn thảo trực quan"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMode('source')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                mode === 'source' ? 'bg-white text-gray-800 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Xem mã nguồn HTML"
            >
              <CodeBracketIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setMode('preview')}
              className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                mode === 'preview' ? 'bg-white text-gray-800 font-bold shadow-sm' : 'text-gray-500 hover:text-gray-800'
              }`}
              title="Xem trước định dạng"
            >
              <EyeIcon className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleClear}
            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
            title="Xóa trắng nội dung"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── EDITOR BODY ── */}
      <div className="relative min-h-[320px] max-h-[600px] overflow-y-auto">
        {mode === 'visual' && (
          <div
            ref={editorRef}
            contentEditable
            onInput={handleInput}
            className="p-4 sm:p-5 outline-none font-serif text-gray-800 leading-relaxed text-base min-h-[320px] prose prose-stone max-w-none"
            data-placeholder={placeholder}
            style={{ minHeight: '320px' }}
          />
        )}

        {mode === 'source' && (
          <textarea
            value={sourceCode}
            onChange={handleSourceChange}
            className="w-full h-full min-h-[320px] p-4 font-mono text-xs text-gray-800 bg-gray-50/50 outline-none resize-none"
            placeholder="Nhập hoặc chỉnh sửa trực tiếp mã HTML..."
          />
        )}

        {mode === 'preview' && (
          <div className="p-4 sm:p-5 font-serif text-gray-800 leading-relaxed text-base prose prose-stone max-w-none min-h-[320px]">
            {sourceCode ? (
              <div dangerouslySetInnerHTML={{ __html: sourceCode }} />
            ) : (
              <p className="text-gray-400 italic">Chưa có nội dung xem trước.</p>
            )}
          </div>
        )}
      </div>

      {/* Footer helper */}
      <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
        <span>💡 Bạn có thể dán (Ctrl+V) trực tiếp từ Microsoft Word để giữ nguyên in đậm, in nghiêng, ngắt dòng.</span>
        <span>{sourceCode.length} ký tự</span>
      </div>
    </div>
  );
};

export default RichContentEditor;
