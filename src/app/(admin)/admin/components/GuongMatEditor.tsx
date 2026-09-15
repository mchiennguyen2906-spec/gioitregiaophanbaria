import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { addArticle, updateArticle, Article } from "../../../utils/store";
import toast from 'react-hot-toast';

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
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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
  
  const handlePublish = async () => {
    if (!title || !thumbnailUrl || !content) {
      toast.error('Vui lòng điền đầy đủ Tên, Link Avatar và Bài viết!');
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

    setIsSaving(true);
    try {
      if (articleToEdit && articleToEdit.id) {
        await updateArticle(articleToEdit.id, articleData);
        toast.success('Cập nhật Gương mặt thành công!');
      } else {
        await addArticle(articleData);
        toast.success('Đăng Gương mặt thành công!');
      }
      onPublish();
    } catch (err: any) {
      toast.error('Lỗi khi đăng bài: ' + err.message);
    }
    setIsSaving(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    // Client-side compression
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max 800x800
        const MAX_SIZE = 800;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsUploading(false);
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsUploading(false);
            return;
          }
          const formData = new FormData();
          formData.append('file', new File([blob], file.name, { type: 'image/jpeg' }));
          
          if (thumbnailUrl && thumbnailUrl.includes('supabase.co')) {
             formData.append('oldFileUrl', thumbnailUrl);
          }

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const result = await res.json();
            if (result.success) {
              setThumbnailUrl(result.url);
              toast.success('Đã tải ảnh lên thành công!');
            } else {
              toast.error('Lỗi khi tải ảnh lên!');
            }
          } catch (err) {
            console.error(err);
            toast.error('Lỗi kết nối khi tải ảnh lên!');
          }
          setIsUploading(false);
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
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
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', alignItems: 'start' }}>
      
      {/* CỘT TRÁI - MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--color-brand-cyan)' }}>{articleToEdit ? 'Chỉnh Sửa Gương Mặt' : 'Thêm Gương Mặt Mới'}</h2>
        </div>

        <div>
          <label style={labelStyle}>Tên Thánh & Họ Tên *</label>
          <input style={inputStyle} type="text" placeholder="VD: Maria Nguyễn Thị A" value={title} onChange={e => setTitle(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Câu hút (Sapo/Trích dẫn) *</label>
          <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Đoạn văn ngắn hoặc một câu nói ấn tượng..." value={excerpt} onChange={e => setExcerpt(e.target.value)} />
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

      {/* CỘT PHẢI - SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Đăng Tải</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button disabled={isSaving} onClick={handlePublish} style={primaryBtnStyle}>
              {isSaving ? 'Đang lưu...' : (articleToEdit ? 'Cập nhật Gương mặt' : 'Đăng bài viết')}
            </button>
            <button disabled={isSaving} onClick={onSave} style={secondaryBtnStyle}>Hủy bỏ</button>
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Thông Tin Bổ Sung</h3>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Chức vụ / Vị trí</label>
            <input style={inputStyle} type="text" placeholder="VD: Trưởng ban..." value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div style={{ marginBottom: '15px' }}>
            <label style={labelStyle}>Giáo xứ</label>
            <input style={inputStyle} type="text" placeholder="VD: Long Điền..." value={parish} onChange={e => setParish(e.target.value)} />
          </div>
          <div>
            <label style={labelStyle}>Ngày Đăng</label>
            <input style={inputStyle} type="datetime-local" value={publishDate} onChange={e => setPublishDate(e.target.value)} />
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Ảnh đại diện (Avatar) *</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {thumbnailUrl && (
              <img src={thumbnailUrl} alt="Thumbnail" style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload} 
              disabled={isUploading}
              style={{ fontSize: '0.9rem' }}
            />
            {isUploading && <span style={{ color: 'var(--color-brand-cyan)', fontSize: '0.85rem' }}>Đang nén và tải ảnh lên...</span>}
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Tùy Chọn Hiển Thị</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            
            <div>
              <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.85rem', marginBottom: '8px' }}>TRANG CHUYÊN MỤC</div>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={checkboxStyle} />
                <span style={{ color: 'var(--color-brand-red)' }}>Nổi Bật (Slider chính)</span>
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={isPriority} onChange={e => setIsPriority(e.target.checked)} style={checkboxStyle} />
                <span style={{ color: 'var(--color-brand-cyan)' }}>Ưu Tiên (Danh sách phải)</span>
              </label>
            </div>

            <div>
              <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.85rem', marginBottom: '8px' }}>TRANG CHỦ</div>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={isHomeFeatured} onChange={e => setIsHomeFeatured(e.target.checked)} style={checkboxStyle} />
                <span style={{ color: 'var(--color-brand-red)' }}>Nổi Bật (Slider Lớn)</span>
              </label>
              <label style={checkboxLabelStyle}>
                <input type="checkbox" checked={isHomePriority} onChange={e => setIsHomePriority(e.target.checked)} style={checkboxStyle} />
                <span style={{ color: 'var(--color-brand-cyan)' }}>Ưu Tiên (Bản tin)</span>
              </label>
            </div>

          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Audio / Podcast</h3>
          <label style={labelStyle}>Link File Âm Thanh (MP3)</label>
          <input style={inputStyle} type="text" placeholder="Dán link audio..." value={audioUrl} onChange={e => setAudioUrl(e.target.value)} />
        </div>

      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outlineColor: 'var(--color-brand-cyan)' };
const boxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const boxTitleStyle = { marginTop: 0, marginBottom: '15px', color: '#1e293b', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' };
const primaryBtnStyle = { background: 'var(--color-brand-cyan)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
const secondaryBtnStyle = { background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
const checkboxStyle = { width: '16px', height: '16px', cursor: 'pointer' };
const checkboxLabelStyle = { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem', marginBottom: '8px' };
