import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { addArticle, updateArticle, Article } from "../../../utils/store";

// Import CSS của React-Quill (cần thiết để hiển thị toolbar)
import 'react-quill-new/dist/quill.snow.css';

// Import dynamic để tránh lỗi SSR (document is not defined)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface GuongMatEditorProps {
  articleToEdit?: Article | null;
  onSave: () => void;
  onPublish: () => void;
}

export default function GuongMatEditor({ articleToEdit, onSave, onPublish }: GuongMatEditorProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [parish, setParish] = useState('');
  const [content, setContent] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [isHomeFeatured, setIsHomeFeatured] = useState(false);
  const [isHomePriority, setIsHomePriority] = useState(false);

  useEffect(() => {
    const getLocalDatetime = (dateVal?: string) => {
      const d = dateVal ? new Date(dateVal) : new Date();
      if (isNaN(d.getTime())) return new Date().toISOString().slice(0, 16);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const mm = String(d.getMinutes()).padStart(2, '0');
      return `${y}-${m}-${dd}T${hh}:${mm}`;
    };

    if (articleToEdit) {
      setTitle(articleToEdit.title || '');
      setExcerpt(articleToEdit.excerpt || '');
      setAuthor(articleToEdit.author || '');
      setParish(articleToEdit.parish || '');
      setContent(articleToEdit.content || '');
      setThumbnailUrl(articleToEdit.thumbnailUrl || '');
      setAudioUrl(articleToEdit.audioUrl || '');
      setPublishDate(getLocalDatetime(articleToEdit.date));
      setIsFeatured(articleToEdit.isFeatured || false);
      setIsPriority(articleToEdit.isPriority || false);
      setIsHomeFeatured(articleToEdit.isHomeFeatured || false);
      setIsHomePriority(articleToEdit.isHomePriority || false);
    } else {
      setTitle('');
      setExcerpt('');
      setAuthor('');
      setParish('');
      setContent('');
      setThumbnailUrl('');
      setAudioUrl('');
      setPublishDate(getLocalDatetime());
      setIsFeatured(false);
      setIsPriority(false);
      setIsHomeFeatured(false);
      setIsHomePriority(false);
    }
  }, [articleToEdit]);
  
  const handlePublish = () => {
    if (!title || !thumbnailUrl || !content) {
      alert('Vui lòng điền đầy đủ Tên, Link Avatar và Bài viết!');
      return;
    }
    
    const articleData = {
      categoryId: 'guong-mat',
      title,
      excerpt,
      author,
      parish,
      content,
      audioUrl,
      date: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
      thumbnailUrl,
      status: 'published' as const,
      isFeatured,
      isPriority,
      isHomeFeatured,
      isHomePriority
    };

    if (articleToEdit && articleToEdit.id) {
      updateArticle(articleToEdit.id, articleData);
      alert('Cập nhật Gương mặt thành công!');
    } else {
      addArticle(articleData);
      alert('Đăng Gương mặt thành công!');
    }
    
    onPublish();
  };

  // Cấu hình Toolbar cho Quill
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }, { 'font': [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      [{ 'color': [] }, { 'background': [] }, { 'align': [] }],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align'
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Soạn Thảo: Gương Mặt Truyền Cảm Hứng</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Hủy</button>
          
          <button onClick={handlePublish} style={{
            background: 'var(--color-brand-red)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>Lưu & Đăng</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', gap: '20px', padding: '10px 0', borderBottom: '1px dashed #e2e8f0', marginBottom: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
            <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', marginBottom: '5px' }}>Tùy chọn TRANG CON (Chuyên mục)</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-red)' }}>
              <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Nổi Bật Trang Con (Slider)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-cyan)' }}>
              <input type="checkbox" checked={isPriority} onChange={e => setIsPriority(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Ưu Tiên Trang Con (Danh sách bên phải)
            </label>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, borderLeft: '1px solid #e2e8f0', paddingLeft: '20px' }}>
            <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.9rem', marginBottom: '5px' }}>Tùy chọn TRANG CHỦ</div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-red)' }}>
              <input type="checkbox" checked={isHomeFeatured} onChange={e => setIsHomeFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Nổi Bật Trang Chủ (Slider lớn)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-cyan)' }}>
              <input type="checkbox" checked={isHomePriority} onChange={e => setIsHomePriority(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Ưu Tiên Trang Chủ (Danh sách Bản tin)
            </label>
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tên Thánh & Họ Tên *</label>
          <input style={inputStyle} type="text" placeholder="VD: Maria Nguyễn Thị A" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Chức vụ / Vị trí</label>
            <input style={inputStyle} type="text" placeholder="VD: Trưởng ban Giới trẻ..." value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Giáo xứ</label>
            <input style={inputStyle} type="text" placeholder="VD: Long Điền..." value={parish} onChange={e => setParish(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Link Hình ảnh (Avatar) *</label>
          <input style={inputStyle} type="text" placeholder="https://..." value={thumbnailUrl} onChange={e => setThumbnailUrl(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Câu hút (Sapo/Trích dẫn) *</label>
          <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Đoạn văn ngắn hoặc một câu nói ấn tượng..." value={excerpt} onChange={e => setExcerpt(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Link File Âm Thanh (MP3)</label>
          <input style={inputStyle} type="text" placeholder="Dán link Google Drive hoặc file MP3..." value={audioUrl} onChange={e => setAudioUrl(e.target.value)} />
        </div>

        {/* Real WYSIWYG Editor */}
        <div style={{ marginTop: '10px' }}>
          <label style={labelStyle}>Nội dung bài viết *</label>
          <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Bắt đầu viết nội dung tại đây..."
              style={{ height: '400px', marginBottom: '40px' }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)' };
