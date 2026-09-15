import React, { useState } from 'react';
import { addArticle } from '../../../utils/store';
import toast from 'react-hot-toast';

export default function VideoEditor({ onSave, onPublish }: { onSave: () => void, onPublish: () => void }) {
  const [videoTitle, setVideoTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isHomeFeatured, setIsHomeFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Hàm helper để render preview youtube
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = new URLSearchParams(new URL(url).search).get("v");
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1].split('?')[0];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.split('/d/')[1].split('/')[0];
        return `https://drive.google.com/file/d/${fileId}/preview`;
      }
    } catch(e) {
      return null;
    }
    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl);

  const handlePublish = async () => {
    if (!videoTitle || !embedUrl) {
      toast.error("Vui lòng nhập Tiêu đề và Đường dẫn Video hợp lệ!");
      return;
    }

    const iframeContent = `<div style="text-align: center;"><iframe src="${embedUrl}" width="100%" height="500" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe></div>`;
    const fullContent = `<p>${description}</p>${iframeContent}`;

    setIsSaving(true);
    try {
      await addArticle({
        categoryId: 'thanh-ca',
        title: videoTitle,
        excerpt: description,
        content: fullContent,
        author: author || 'Admin',
        status: 'published',
        isHomeFeatured
      });
      toast.success('Đăng Video thành công!');
      onPublish();
    } catch (err: any) {
      toast.error('Lỗi khi đăng Video: ' + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', alignItems: 'start' }}>
      
      {/* CỘT TRÁI - MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--color-brand-cyan)' }}>Đăng Video Mới</h2>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px' }}>
          <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn đăng Video</h3>
          <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
            <li><strong>Lấy link Youtube:</strong> Mở video trên Youtube, bấm nút "Chia sẻ" (Share) {'->'} "Sao chép" (Copy) link rồi dán vào ô "Đường dẫn Video".</li>
            <li><strong>Lấy link Google Drive:</strong> Chuột phải vào file video trên Drive {'->'} Chọn "Chia sẻ" (Share) {'->'} Đổi Quyền truy cập chung thành <strong>"Bất kỳ ai có đường liên kết" (Anyone with the link)</strong> {'->'} Bấm "Sao chép đường liên kết". Nếu không đổi quyền, người xem sẽ không thấy video.</li>
          </ul>
        </div>

        <div>
          <label style={labelStyle}>Tiêu đề Video *</label>
          <input style={inputStyle} type="text" placeholder="Ví dụ: Thánh lễ truyền chức Linh mục..." value={videoTitle} onChange={e => setVideoTitle(e.target.value)} />
        </div>
        
        <div>
          <label style={labelStyle}>Người đăng / Tác giả</label>
          <input style={inputStyle} type="text" placeholder="Tên tác giả..." value={author} onChange={e => setAuthor(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Giới thiệu ngắn / Mô tả video</label>
          <textarea style={{ ...inputStyle, minHeight: '100px' }} placeholder="Viết mô tả ngắn gọn về video..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={{ padding: '15px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
          <label style={{ ...labelStyle, color: '#1e3a8a' }}>Đường dẫn Video (YouTube / Google Drive) *</label>
          <input 
            style={{ ...inputStyle, borderColor: '#93c5fd' }} 
            type="text" 
            placeholder="Dán link YouTube (ví dụ: https://youtube.com/watch?v=...) hoặc link Drive..." 
            value={videoUrl} 
            onChange={e => setVideoUrl(e.target.value)} 
          />
        </div>
      </div>

      {/* CỘT PHẢI - SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Nút hành động */}
        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Đăng Tải</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button disabled={isSaving} onClick={handlePublish} style={primaryBtnStyle}>
              {isSaving ? 'Đang đăng...' : 'Đăng Video'}
            </button>
            <button disabled={isSaving} onClick={onSave} style={secondaryBtnStyle}>
              Hủy bỏ / Quay lại
            </button>
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Tùy chọn hiển thị</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-cyan)' }}>
            <input type="checkbox" checked={isHomeFeatured} onChange={e => setIsHomeFeatured(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Hiện ở Không gian Thánh Ca (Trang chủ)
          </label>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Xem trước (Preview)</h3>
          <div style={{ 
            background: '#0f172a', borderRadius: '8px', overflow: 'hidden', 
            aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}>
            {embedUrl ? (
              <iframe 
                src={embedUrl} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            ) : (
              <div style={{ color: '#64748b', textAlign: 'center', padding: '20px' }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '10px' }}>🎬</span>
                Khung hiển thị Video<br/>(Dán link hợp lệ)
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)', boxSizing: 'border-box' };
const boxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const boxTitleStyle = { marginTop: 0, marginBottom: '15px', color: '#1e293b', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' };
const primaryBtnStyle = { background: 'var(--color-brand-cyan)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
const secondaryBtnStyle = { background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
