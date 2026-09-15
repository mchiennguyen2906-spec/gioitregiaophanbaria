import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { slugMap } from "../../../utils/categoryMap";
import { addArticle, updateArticle, Article } from "../../../utils/store";

// Import CSS của React-Quill (cần thiết để hiển thị toolbar)
import 'react-quill-new/dist/quill.snow.css';

// Import dynamic để tránh lỗi SSR (document is not defined)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface ArticleEditorProps {
  articleToEdit?: Article | null;
  defaultCategory?: string | null;
  onSave: () => void;
  onPublish: () => void;
}

export default function ArticleEditor({ articleToEdit, defaultCategory, onSave, onPublish }: ArticleEditorProps) {
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [parish, setParish] = useState('');
  const [category, setCategory] = useState('');
  const [content, setContent] = useState('');
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
      setCategory(articleToEdit.categoryId || '');
      setContent(articleToEdit.content || '');
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
      setCategory(defaultCategory || '');
      setContent('');
      setAudioUrl('');
      setPublishDate(getLocalDatetime());
      setIsFeatured(false);
      setIsPriority(false);
      setIsHomeFeatured(false);
      setIsHomePriority(false);
    }
  }, [articleToEdit]);
  
  const handlePublish = () => {
    if (!title || !category || !content) {
      alert('Vui lòng điền đầy đủ Tiêu đề, Hạng mục và Nội dung!');
      return;
    }
    
    const articleData = {
      categoryId: category,
      title,
      excerpt,
      author,
      parish,
      content,
      audioUrl,
      date: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
      thumbnailUrl: articleToEdit?.thumbnailUrl || 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=600&auto=format&fit=crop',
      status: 'published' as const,
      isFeatured,
      isPriority,
      isHomeFeatured,
      isHomePriority
    };

    if (articleToEdit && articleToEdit.id) {
      updateArticle(articleToEdit.id, articleData);
      alert('Cập nhật bài viết thành công!');
    } else {
      addArticle(articleData);
      alert('Đăng bài thành công!');
    }
    
    onPublish();
  };

  const categories = Object.keys(slugMap).map(key => ({ id: key, name: slugMap[key] }));

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
    'list', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align'
  ];

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Soạn Thảo Bài Viết Mới</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Lưu & Xem Trước</button>
          
          <button onClick={handlePublish} style={{
            background: 'var(--color-brand-red)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>Xác Nhận Đăng</button>
        </div>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn soạn thảo Bài Viết</h3>
        <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
          <li><strong>Hình ảnh:</strong> Nên căn giữa (Align Center) cho hình ảnh để bài viết đẹp hơn. Hình ảnh sẽ tự động căn chỉnh kích thước (Responsive) khi lên web để phù hợp với điện thoại và máy tính. Nếu cần nhỏ hơn, hãy click vào ảnh và kéo góc để thu nhỏ.</li>
          <li><strong>Font chữ:</strong> Bạn có thể chọn Font chữ ở thanh công cụ. Hệ thống đã giới hạn sẵn các font an toàn (Việt hóa) để đảm bảo không bị lỗi dấu.</li>
          <li><strong>Nhúng Video:</strong> Để nhúng Youtube, chỉ cần dán đường link Youtube trực tiếp vào nút Video.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {/* Form Meta */}
        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Hạng mục / Chuyên mục *</label>
            <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
              <option value="">-- Chọn Hạng Mục --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Thời gian đăng (Hẹn giờ) *</label>
            <input 
              style={inputStyle} 
              type="datetime-local" 
              value={publishDate} 
              onChange={e => setPublishDate(e.target.value)} 
            />
          </div>
        </div>

        {category === 'podcast' && (
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#64748b' }}>Link Audio/Podcast (MP3)</label>
            <input 
              type="text" 
              value={audioUrl}
              onChange={(e) => setAudioUrl(e.target.value)}
              placeholder="https://..."
              style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
            />
          </div>
        )}

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
              Nổi Bật Trang Chủ (Slider lớn - Tối đa 10)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-cyan)' }}>
              <input type="checkbox" checked={isHomePriority} onChange={e => setIsHomePriority(e.target.checked)} style={{ width: '18px', height: '18px' }} />
              Ưu Tiên Trang Chủ (Danh sách Bản tin - Tối đa 10)
            </label>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Người viết *</label>
            <input style={inputStyle} type="text" placeholder="Tên tác giả..." value={author} onChange={e => setAuthor(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Giáo xứ</label>
            <input style={inputStyle} type="text" placeholder="Thuộc giáo xứ nào..." value={parish} onChange={e => setParish(e.target.value)} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Tiêu đề bài viết *</label>
          <input style={inputStyle} type="text" placeholder="Nhập tiêu đề..." value={title} onChange={e => setTitle(e.target.value)} />
        </div>


        <div>
          <label style={labelStyle}>Lời dẫn (Sapo / Câu hút) *</label>
          <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Đoạn văn ngắn dẫn dắt vào bài..." value={excerpt} onChange={e => setExcerpt(e.target.value)} />
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
              placeholder="Bắt đầu viết nội dung tại đây... Đặt con trỏ ở đâu, bấm nút chèn ảnh thì ảnh sẽ nằm ở đó..."
              style={{ height: '400px', marginBottom: '40px' }} // Tăng marginBottom vì height của ReactQuill không bao gồm toolbar
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)' };
