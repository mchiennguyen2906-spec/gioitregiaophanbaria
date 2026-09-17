import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { v4 as uuidv4 } from 'uuid';
import { sanitize } from '../../../utils/sanitize';
import { slugMap } from "../../../utils/categoryMap";
import { addArticle, updateArticle, Article } from "../../../utils/store";
import toast from 'react-hot-toast';

// Import CSS của React-Quill (cần thiết để hiển thị toolbar)
import 'react-quill-new/dist/quill.snow.css';

// Import dynamic để tránh lỗi SSR (document is not defined)
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface ArticleEditorProps {
  articleToEdit?: Article | null;
  defaultCategory?: string | null;
  allowedCategories?: { id: string, name: string }[];
  onSave: () => void;
  onPublish: () => void;
}

export default function ArticleEditor({ articleToEdit, defaultCategory, allowedCategories, onSave, onPublish }: ArticleEditorProps) {
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
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  
  // File đính kèm
  const [attachmentUrl, setAttachmentUrl] = useState('');
  const [attachmentName, setAttachmentName] = useState('');
  const [isUploadingFile, setIsUploadingFile] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Custom Image Upload cho Quill
  const quillRef = React.useRef<any>(null);
  const [showImgModal, setShowImgModal] = useState(false);
  const [imgQuillIdx, setImgQuillIdx] = useState(0);
  const [customImgFile, setCustomImgFile] = useState<File | null>(null);
  const [customImgPreview, setCustomImgPreview] = useState('');
  const [customImgSize, setCustomImgSize] = useState('medium');
  const [customImgAlign, setCustomImgAlign] = useState('center');
  const [isUploadingCustom, setIsUploadingCustom] = useState(false);

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
      setThumbnailUrl(articleToEdit.thumbnailUrl || '');
      setAttachmentUrl(articleToEdit.attachmentUrl || '');
      setAttachmentName(articleToEdit.attachmentName || '');
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
      setThumbnailUrl('');
      setAttachmentUrl('');
      setAttachmentName('');
    }
  }, [articleToEdit]);
  
  const handlePublish = async () => {
    if (!title || !category || !content) {
      toast.error('Vui lòng điền đầy đủ Tiêu đề, Hạng mục và Nội dung!');
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
      attachmentUrl,
      attachmentName,
      date: publishDate ? new Date(publishDate).toISOString() : new Date().toISOString(),
      thumbnailUrl,
      status: 'published' as const,
      isFeatured,
      isPriority,
      isHomeFeatured,
      isHomePriority
    };

    try {
      if (articleToEdit && articleToEdit.id) {
        await updateArticle(articleToEdit.id, articleData);
        toast.success('Đã cập nhật bài viết thành công!');
      } else {
        await addArticle(articleData);
        toast.success('Đã đăng bài viết mới thành công!');
      }
      
      onPublish();
    } catch (err: any) {
      console.error(err);
      toast.error('Lỗi khi đăng bài: ' + (err.message || 'Lỗi không xác định'));
    }
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
        
        // Cắt ép tỷ lệ 16:9
        let targetRatio = 16 / 9;
        let currentRatio = img.width / img.height;
        let sx = 0, sy = 0, sWidth = img.width, sHeight = img.height;

        if (currentRatio > targetRatio) {
          sWidth = img.height * targetRatio;
          sx = (img.width - sWidth) / 2;
        } else if (currentRatio < targetRatio) {
          sHeight = img.width / targetRatio;
          sy = (img.height - sHeight) / 2;
        }

        let canvasWidth = sWidth;
        let canvasHeight = sHeight;
        const MAX_WIDTH = 800;
        if (canvasWidth > MAX_WIDTH) {
          canvasWidth = MAX_WIDTH;
          canvasHeight = MAX_WIDTH / targetRatio;
        }

        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        
        ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, canvasWidth, canvasHeight);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
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
              toast.success('Đã tải ảnh lên!');
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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    const allowedExts = ['.pdf', '.doc', '.docx', '.xls', '.xlsx'];
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      toast.error('Chỉ chấp nhận file PDF, Word hoặc Excel');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File tối đa 10MB!');
      return;
    }

    setIsUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (attachmentUrl) {
        formData.append('oldFileUrl', attachmentUrl);
      }

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      
      if (data.success) {
        setAttachmentUrl(data.url);
        setAttachmentName(file.name);
        toast.success('Đã tải file lên!');
      } else {
        toast.error('Lỗi upload file: ' + (data.error || 'Không xác định'));
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi upload file đính kèm!');
    }
    setIsUploadingFile(false);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf': return '📕';
      case 'doc': case 'docx': return '📘';
      case 'xls': case 'xlsx': return '📗';
      default: return '📄';
    }
  };

  const categories = allowedCategories || Object.keys(slugMap).map(key => ({ id: key, name: slugMap[key] }));

  // Custom Image Handler cho Quill
  const customImageHandler = () => {
    if (quillRef.current) {
      const editor = quillRef.current.getEditor();
      const range = editor.getSelection();
      setImgQuillIdx(range ? range.index : 0);
      setShowImgModal(true);
      setCustomImgFile(null);
      setCustomImgPreview('');
      setCustomImgSize('medium');
      setCustomImgAlign('center');
    }
  };

  const handleSelectCustomImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCustomImgFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setCustomImgPreview(event.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const submitCustomImage = async () => {
    if (!customImgFile) return;
    setIsUploadingCustom(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale based on selected size
        let targetWidth = width;
        if (customImgSize === 'small') targetWidth = 300;
        else if (customImgSize === 'medium') targetWidth = 500;
        else if (customImgSize === 'large') targetWidth = 800;
        else targetWidth = Math.min(width, 1200); // max original

        if (width > targetWidth) {
          height *= targetWidth / width;
          width = targetWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) return;
          const formData = new FormData();
          formData.append('file', new File([blob], customImgFile.name, { type: 'image/jpeg' }));

          try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });
            const result = await res.json();
            if (result.success) {
              const editor = quillRef.current.getEditor();
              
              // Tạo block HTML để chèn ảnh với class căn lề
              let alignClass = 'ql-align-center';
              let floatStyle = '';
              
              if (customImgAlign === 'left') {
                alignClass = 'ql-align-left';
                floatStyle = 'float: left; margin: 0 15px 15px 0;';
              } else if (customImgAlign === 'right') {
                alignClass = 'ql-align-right';
                floatStyle = 'float: right; margin: 0 0 15px 15px;';
              }

              // Quill không dễ nhận float, nên ta dùng dangerouslyPasteHTML
              const html = `<p class="${alignClass}"><img loading="lazy" src="${result.url}" width="${width}" style="${floatStyle} border-radius: 8px;" /></p><p><br></p>`;
              editor.clipboard.dangerouslyPasteHTML(imgQuillIdx, html);
              
              setShowImgModal(false);
              toast.success('Đã chèn ảnh vào bài viết!');
            } else {
              toast.error('Lỗi khi tải ảnh lên!');
            }
          } catch (err) {
            toast.error('Lỗi kết nối khi tải ảnh!');
          }
          setIsUploadingCustom(false);
        }, 'image/jpeg', 0.85);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(customImgFile);
  };

  // Cấu hình Toolbar cho Quill
  const modules = React.useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }, { 'font': [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image', 'video'],
        [{ 'color': [] }, { 'background': [] }, { 'align': [] }],
        ['clean']
      ],
      handlers: {
        image: customImageHandler
      }
    },
    clipboard: {
      matchVisual: false // Chống dính khoảng trắng thừa khi copy từ Word
    }
  }), []);

  const formats = [
    'header', 'font',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'video',
    'color', 'background', 'align'
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', paddingBottom: '50px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>
          {articleToEdit && articleToEdit.id ? 'Chỉnh Sửa Bài Viết' : 'Soạn Thảo Bài Viết Mới'}
        </h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowPreview(true)} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Lưu & Xem Trước</button>
          
          <button onClick={handlePublish} style={{
            background: articleToEdit && articleToEdit.id ? '#f59e0b' : 'var(--color-brand-cyan)', color: 'white', padding: '10px 20px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            {articleToEdit && articleToEdit.id ? '🔄 CẬP NHẬT BÀI VIẾT' : '🚀 ĐĂNG BÀI MỚI'}
          </button>
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

      <style dangerouslySetInnerHTML={{__html: `
        .editor-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        @media (max-width: 900px) { .editor-grid { grid-template-columns: 1fr; } }
      `}} />
      <div className="editor-grid">
        {/* CỘT TRÁI - NỘI DUNG CHÍNH */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Tiêu đề bài viết *</label>
              <input style={{...inputStyle, fontSize: '1.2rem', padding: '15px', fontWeight: 'bold'}} type="text" placeholder="Nhập tiêu đề..." value={title} onChange={e => setTitle(e.target.value)} />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Lời dẫn (Sapo / Câu hút) *</label>
              <textarea style={{ ...inputStyle, minHeight: '80px' }} placeholder="Đoạn văn ngắn dẫn dắt vào bài..." value={excerpt} onChange={e => setExcerpt(e.target.value)} />
            </div>

            <div>
              <label style={labelStyle}>Nội dung bài viết *</label>
              <div style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
                <ReactQuill 
                  // @ts-expect-error
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  placeholder="Bắt đầu viết nội dung tại đây..."
                  style={{ height: '500px', marginBottom: '40px', border: 'none' }}
                />
              </div>
            </div>
          </div>
          
        </div>

        {/* CỘT PHẢI - CÀI ĐẶT PHỤ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Box Đăng bài */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>⚙️ Cài đặt Đăng bài</h3>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Hạng mục / Chuyên mục *</label>
              <select style={inputStyle} value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">-- Chọn Hạng Mục --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={labelStyle}>Thời gian đăng (Hẹn giờ) *</label>
              <input 
                style={inputStyle} 
                type="datetime-local" 
                value={publishDate} 
                onChange={e => setPublishDate(e.target.value)} 
              />
            </div>

            {category === 'podcast' && (
              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>Link Audio/Podcast (MP3)</label>
                <input 
                  type="text" 
                  value={audioUrl}
                  onChange={(e) => setAudioUrl(e.target.value)}
                  placeholder="https://..."
                  style={inputStyle}
                />
              </div>
            )}
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Người viết *</label>
                <input style={inputStyle} type="text" placeholder="Tên..." value={author} onChange={e => setAuthor(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Giáo xứ</label>
                <input style={inputStyle} type="text" placeholder="Giáo xứ..." value={parish} onChange={e => setParish(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Box Nổi bật */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>⭐ Tùy chọn Hiển thị</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase' }}>Trang Con (Chuyên mục)</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand-cyan)' }} />
                  Đưa lên Slider nổi bật
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#334155', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={isPriority} onChange={e => setIsPriority(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: 'var(--color-brand-cyan)' }} />
                  Ghim vào danh sách Ưu tiên
                </label>
              </div>
              
              <div style={{ borderTop: '1px dashed #e2e8f0', paddingTop: '15px' }}>
                <div style={{ fontWeight: 'bold', color: '#475569', fontSize: '0.85rem', marginBottom: '8px', textTransform: 'uppercase' }}>Trang Chủ Hệ Thống</div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#b91c1c', fontSize: '0.9rem', marginBottom: '5px' }}>
                  <input type="checkbox" checked={isHomeFeatured} onChange={e => setIsHomeFeatured(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#b91c1c' }} />
                  Đưa ra Slider Trang Chủ (VIP)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: '#b91c1c', fontSize: '0.9rem' }}>
                  <input type="checkbox" checked={isHomePriority} onChange={e => setIsHomePriority(e.target.checked)} style={{ width: '16px', height: '16px', accentColor: '#b91c1c' }} />
                  Đưa ra Bản tin Trang Chủ
                </label>
              </div>
            </div>
          </div>

          {/* Box Media */}
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#1e293b', borderBottom: '1px solid #f1f5f9', paddingBottom: '10px' }}>🖼️ Đa phương tiện</h3>
            
            {/* Thumbnail */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Ảnh đại diện (Thumbnail) *</label>
              {thumbnailUrl && (
                <div style={{ marginBottom: '10px', position: 'relative' }}>
                  <img loading="lazy" src={thumbnailUrl} alt="Thumbnail" style={{ width: '100%', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                </div>
              )}
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                disabled={isUploading}
                style={{ width: '100%', padding: '10px', border: '1px dashed #cbd5e1', borderRadius: '6px', background: isUploading ? '#fef08a' : '#f8fafc', cursor: isUploading ? 'not-allowed' : 'pointer', fontSize: '0.85rem' }}
              />
              {isUploading && (
                <div style={{ background: '#fff7ed', border: '1px solid #fdba74', padding: '10px', borderRadius: '6px', marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span>
                  <span style={{ color: '#c2410c', fontWeight: 'bold', fontSize: '0.9rem' }}>Đang nén và tải ảnh lên (vui lòng đợi)...</span>
                </div>
              )}
            </div>

            {/* File đính kèm */}
            <div>
              <label style={labelStyle}>File đính kèm (PDF, Word, Excel)</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.doc,.docx,.xls,.xlsx"
                onChange={handleFileUpload}
                style={{ display: 'none' }}
              />

              {attachmentUrl ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px', border: '1px solid #22c55e', borderRadius: '8px',
                  background: '#f0fdf4'
                }}>
                  <span style={{ fontSize: '1.2rem' }}>{getFileIcon(attachmentName)}</span>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontWeight: 'bold', color: '#166534', fontSize: '0.85rem', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>{attachmentName}</div>
                  </div>
                  <button 
                    onClick={() => { setAttachmentUrl(''); setAttachmentName(''); }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1rem' }}
                    title="Xóa file"
                  >
                    ✖
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingFile}
                  style={{
                    width: '100%', padding: '12px', border: '1px dashed #cbd5e1', borderRadius: '6px',
                    background: isUploadingFile ? '#fff7ed' : '#f8fafc', 
                    cursor: isUploadingFile ? 'wait' : 'pointer', 
                    color: isUploadingFile ? '#c2410c' : '#475569',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', 
                    fontSize: '0.9rem', fontWeight: isUploadingFile ? 'bold' : 'normal',
                    borderStyle: isUploadingFile ? 'solid' : 'dashed', borderColor: isUploadingFile ? '#fdba74' : '#cbd5e1'
                  }}
                >
                  {isUploadingFile ? (
                    <><span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⏳</span> Đang tải file lên Server...</>
                  ) : '📎 Bấm vào đây để Chọn file đính kèm...'}
                </button>
              )}
            </div>

          </div>

        </div>
      </div>

      {showPreview && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', zIndex: 1000, overflowY: 'auto', padding: '40px 20px'
        }}>
          <div style={{
            background: 'white', maxWidth: '800px', margin: '0 auto', padding: '40px', 
            borderRadius: '12px', position: 'relative', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
          }}>
            <div style={{ background: '#fef3c7', color: '#b45309', padding: '15px', borderRadius: '8px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚠️ <b>CHẾ ĐỘ XEM TRƯỚC (PREVIEW)</b></span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setShowPreview(false)} style={{ padding: '8px 15px', borderRadius: '4px', border: '1px solid #b45309', background: 'transparent', color: '#b45309', cursor: 'pointer', fontWeight: 'bold' }}>Chỉnh sửa lại</button>
                <button onClick={() => { setShowPreview(false); handlePublish(); }} style={{ padding: '8px 15px', borderRadius: '4px', border: 'none', background: articleToEdit && articleToEdit.id ? '#f59e0b' : 'var(--color-brand-cyan)', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                  {articleToEdit && articleToEdit.id ? 'Xác nhận cập nhật' : 'Xác nhận đăng'}
                </button>
              </div>
            </div>

            <h1 style={{ fontSize: '2.5rem', color: 'var(--color-brand-cyan)', marginBottom: '10px' }}>{title || '[Chưa nhập tiêu đề]'}</h1>
            <p style={{ color: '#64748b', fontStyle: 'italic', marginBottom: '20px' }}>Người đăng: {author || '[Tác giả]'} {parish ? `- ${parish}` : ''} | Ngày đăng: {publishDate ? new Date(publishDate).toLocaleDateString('vi-VN') : 'Hôm nay'}</p>
            
            {thumbnailUrl && (
              <img loading="lazy" src={thumbnailUrl} alt="Cover" style={{ width: '100%', borderRadius: '8px', marginBottom: '20px' }} />
            )}

            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '30px', color: '#334155' }}>{excerpt || '[Chưa nhập lời dẫn]'}</p>
            
            <div className="article-content" dangerouslySetInnerHTML={{ __html: content ? sanitize(content) : '[Chưa nhập nội dung]' }} style={{ fontSize: '1.1rem', lineHeight: 1.8, color: '#1e293b' }} />
          </div>
        </div>
      )}

      {/* Modal Upload Ảnh Nâng Cao */}
      {showImgModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.6)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '500px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 20px 0', color: 'var(--color-brand-cyan)' }}>🖼️ Chèn Hình Ảnh Vào Bài</h3>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>1. Chọn ảnh từ máy tính</label>
              <input type="file" accept="image/*" onChange={handleSelectCustomImage} style={inputStyle} />
              {customImgPreview && (
                <div style={{ marginTop: '10px', textAlign: 'center', background: '#f1f5f9', padding: '10px', borderRadius: '8px' }}>
                  <img loading="lazy" src={customImgPreview} style={{ maxHeight: '150px', maxWidth: '100%', objectFit: 'contain' }} alt="Preview" />
                </div>
              )}
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>2. Kích cỡ hiển thị</label>
              <select style={inputStyle} value={customImgSize} onChange={e => setCustomImgSize(e.target.value)}>
                <option value="small">Nhỏ (Dùng cho icon/ảnh phụ)</option>
                <option value="medium">Vừa (Khuyên dùng)</option>
                <option value="large">Lớn (Rộng bằng khung chữ)</option>
                <option value="original">Nguyên bản (Chất lượng cao nhất)</option>
              </select>
            </div>

            <div style={{ marginBottom: '25px' }}>
              <label style={labelStyle}>3. Vị trí ảnh (Canh lề)</label>
              <select style={inputStyle} value={customImgAlign} onChange={e => setCustomImgAlign(e.target.value)}>
                <option value="center">⏸️ Chính giữa (Mặc định)</option>
                <option value="left">⬅️ Bên Trái (Chữ bọc bên phải)</option>
                <option value="right">➡️ Bên Phải (Chữ bọc bên trái)</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowImgModal(false)} disabled={isUploadingCustom} style={{ padding: '10px 15px', background: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
              <button onClick={submitCustomImage} disabled={!customImgFile || isUploadingCustom} style={{ padding: '10px 20px', background: 'var(--color-brand-cyan)', color: 'white', border: 'none', borderRadius: '6px', cursor: (customImgFile && !isUploadingCustom) ? 'pointer' : 'not-allowed', fontWeight: 'bold' }}>
                {isUploadingCustom ? '⏳ Đang xử lý...' : '✅ Chèn vào bài'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)' };

