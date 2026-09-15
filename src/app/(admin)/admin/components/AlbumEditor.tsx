import React, { useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';

export default function AlbumEditor({ onSave, onPublish }: { onSave: () => void, onPublish: () => void }) {
  const [albumTitle, setAlbumTitle] = useState('');
  const [author, setAuthor] = useState('');
  
  // Giả lập danh sách hình ảnh tải lên
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=200&auto=format&fit=crop', caption: 'Lễ Khai mạc', isThumbnail: true },
    { id: 2, url: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?q=80&w=200&auto=format&fit=crop', caption: 'Các bạn trẻ giao lưu', isThumbnail: false }
  ]);

  const setThumbnail = (id: number) => {
    setImages(images.map(img => ({ ...img, isThumbnail: img.id === id })));
  };

  const removeImage = (id: number) => {
    setImages(images.filter(img => img.id !== id));
  };

  const updateCaption = (id: number, caption: string) => {
    setImages(images.map(img => img.id === id ? { ...img, caption } : img));
  };

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Tạo Album Ảnh Mới</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Lưu Nháp</button>
          
          <button onClick={onPublish} style={{
            background: 'var(--color-brand-red)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>Đăng Album</button>
        </div>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn đăng Album</h3>
        <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
          <li>Mỗi Album tối đa <strong>30 hình ảnh</strong>. Không nên đăng quá nhiều gây nặng trang.</li>
          <li>Khi tải lên, hệ thống sẽ <strong>tự động nén ảnh</strong> xuống chất lượng vừa đủ xem trên web (giảm dung lượng, không tốn phí lưu trữ máy chủ). Không cần tự nén ở ngoài.</li>
          <li>Nên chọn hình ảnh ngang hoặc ảnh vuông để trải nghiệm xem đẹp nhất. Nhớ chọn 1 ảnh làm <strong>Ảnh Bìa (Thumbnail)</strong>.</li>
        </ul>
      </div>

      <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
        <div style={{ flex: 2 }}>
          <label style={labelStyle}>Tên Album *</label>
          <input style={inputStyle} type="text" placeholder="Ví dụ: Hình ảnh Đại hội Giới trẻ 2026..." value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <label style={labelStyle}>Người đăng</label>
          <input style={inputStyle} type="text" placeholder="Tên tác giả / Ban TT..." value={author} onChange={e => setAuthor(e.target.value)} />
        </div>
      </div>

      <div style={{ background: 'white', border: '1px dashed #94a3b8', padding: '40px', borderRadius: '12px', textAlign: 'center', marginBottom: '20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📤</div>
        <h3 style={{ margin: 0, color: '#334155' }}>Click để tải lên hình ảnh</h3>
        <p style={{ color: '#64748b' }}>Hỗ trợ JPG, PNG. Có thể chọn nhiều ảnh cùng lúc (Tối đa 30).</p>
        
        <input 
          type="file" 
          multiple 
          accept="image/*" 
          id="album-upload"
          style={{ display: 'none' }}
          onChange={async (e) => {
            const files = Array.from(e.target.files || []);
            if (images.length + files.length > 30) {
              alert(`Chỉ được tải lên tối đa 30 ảnh! Bạn đang chọn thêm ${files.length} ảnh trong khi đã có ${images.length} ảnh.`);
              e.target.value = '';
              return;
            }
            
            // Xử lý nén ảnh
            const options = {
              maxSizeMB: 0.5, // Nén xuống tối đa 500kb
              maxWidthOrHeight: 1200, // Chiều ngang/dọc tối đa 1200px
              useWebWorker: true,
            };

            const newImages = [];
            for (let i = 0; i < files.length; i++) {
              try {
                const file = files[i];
                const compressedFile = await imageCompression(file, options);
                
                // Demo: Chuyển đổi file đã nén thành dạng Blob URL để preview 
                // (Trong thực tế sẽ up Blob này lên Supabase Storage và lấy link trả về)
                const tempUrl = URL.createObjectURL(compressedFile);
                newImages.push({
                  id: Date.now() + i, // Tạo ID tạm
                  url: tempUrl,
                  caption: '',
                  isThumbnail: images.length === 0 && i === 0 // Ảnh đầu tiên tải lên mặc định là bìa
                });
              } catch (error) {
                console.error("Lỗi nén ảnh:", error);
              }
            }
            
            setImages([...images, ...newImages]);
            e.target.value = '';
          }}
        />
        <label htmlFor="album-upload" style={{ display: 'inline-block', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Chọn ảnh
        </label>
      </div>

      {images.length > 0 && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1e293b' }}>Danh sách hình ảnh ({images.length} ảnh)</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
            {images.map(img => (
              <div key={img.id} style={{ 
                background: 'white', border: `2px solid ${img.isThumbnail ? 'var(--color-brand-cyan)' : '#e2e8f0'}`, 
                borderRadius: '8px', overflow: 'hidden', position: 'relative'
              }}>
                {img.isThumbnail && (
                  <div style={{ position: 'absolute', top: 5, left: 5, background: 'var(--color-brand-cyan)', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', fontWeight: 'bold' }}>
                    Ảnh Bìa (Thumbnail)
                  </div>
                )}
                <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                
                <img src={img.url} alt="preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                
                <div style={{ padding: '10px' }}>
                  <input 
                    type="text" 
                    placeholder="Chú thích ảnh..." 
                    value={img.caption}
                    onChange={e => updateCaption(img.id, e.target.value)}
                    style={{ width: '100%', padding: '6px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px' }}
                  />
                  {!img.isThumbnail && (
                    <button onClick={() => setThumbnail(img.id)} style={{ width: '100%', marginTop: '8px', padding: '5px', fontSize: '0.8rem', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer' }}>
                      Đặt làm ảnh bìa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)' };
