import React, { useState, useEffect } from 'react';
import imageCompression from 'browser-image-compression';
import toast from 'react-hot-toast';
import { addArticle, updateArticle, Article } from '../../../utils/store';

export default function AlbumEditor({ onSave, onPublish, articleToEdit }: { onSave: () => void, onPublish: () => void, articleToEdit?: Article }) {
  const [albumTitle, setAlbumTitle] = useState('');
  const [author, setAuthor] = useState('Ban Truyền Thông');
  const [isSaving, setIsSaving] = useState(false);
  
  // Danh sách hình ảnh tải lên
  const [images, setImages] = useState<any[]>([]);

  useEffect(() => {
    if (articleToEdit) {
      setAlbumTitle(articleToEdit.title || '');
      setAuthor(articleToEdit.author || '');
      if (articleToEdit.metadata?.images) {
        setImages(articleToEdit.metadata.images);
      }
    }
  }, [articleToEdit]);

  const setThumbnail = (id: number) => {
    setImages(images.map(img => ({ ...img, isThumbnail: img.id === id })));
  };

  const removeImage = (id: number) => {
    setImages(images.filter(img => img.id !== id));
  };

  const updateCaption = (id: number, caption: string) => {
    setImages(images.map(img => img.id === id ? { ...img, caption } : img));
  };

  const handlePublish = async () => {
    if (!albumTitle) {
      toast.error('Vui lòng nhập tên Album!');
      return;
    }
    if (images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 hình ảnh!');
      return;
    }
    
    setIsSaving(true);
    try {
      const thumbnailUrl = images.find(img => img.isThumbnail)?.url || images[0].url;
      
      const payload = {
        title: albumTitle,
        author: author,
        categoryId: 'hinh-anh',
        content: '',
        status: 'published' as const,
        thumbnailUrl: thumbnailUrl,
        metadata: { images }
      };

      if (articleToEdit) {
        await updateArticle(articleToEdit.id, payload);
        toast.success('Cập nhật Album thành công!');
      } else {
        await addArticle(payload);
        toast.success('Đăng Album thành công!');
      }
      onPublish();
    } catch (err: any) {
      toast.error('Lỗi khi đăng: ' + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', alignItems: 'start' }}>
      
      {/* CỘT TRÁI - MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Tạo Album Ảnh Mới</h2>
        </div>

        <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px' }}>
          <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn đăng Album</h3>
          <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
            <li>Mỗi Album tối đa <strong>30 hình ảnh</strong>. Không nên đăng quá nhiều gây nặng trang.</li>
            <li>Khi tải lên, hệ thống sẽ <strong>tự động nén ảnh</strong> xuống chất lượng vừa đủ xem trên web.</li>
            <li>Nhớ chọn 1 ảnh làm <strong>Ảnh Bìa (Thumbnail)</strong>.</li>
          </ul>
        </div>

        <div>
          <label style={labelStyle}>Tên Album *</label>
          <input style={inputStyle} type="text" placeholder="Ví dụ: Hình ảnh Đại hội Giới trẻ 2026..." value={albumTitle} onChange={e => setAlbumTitle(e.target.value)} />
        </div>
        
        <div>
          <label style={labelStyle}>Người đăng</label>
          <input style={inputStyle} type="text" placeholder="Tên tác giả / Ban TT..." value={author} onChange={e => setAuthor(e.target.value)} />
        </div>

        <div style={{ background: 'white', border: '2px dashed #94a3b8', padding: '40px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '10px' }}>📤</div>
          <h3 style={{ margin: 0, color: '#334155' }}>Click để tải lên hình ảnh</h3>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>Hỗ trợ JPG, PNG. Có thể chọn nhiều ảnh cùng lúc (Tối đa 30).</p>
          
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            id="album-upload"
            style={{ display: 'none' }}
            onChange={async (e) => {
              const files = Array.from(e.target.files || []);
              if (images.length + files.length > 30) {
                toast.error(`Chỉ được tải lên tối đa 30 ảnh! Bạn đang chọn thêm ${files.length} ảnh trong khi đã có ${images.length} ảnh.`);
                e.target.value = '';
                return;
              }
              
              const options = {
                maxSizeMB: 0.5, 
                maxWidthOrHeight: 1200, 
                useWebWorker: true,
              };

              const newImages = [];
              const loadingToast = toast.loading('Đang xử lý và nén ảnh...');
              
              for (let i = 0; i < files.length; i++) {
                try {
                  const file = files[i];
                  const compressedFile = await imageCompression(file, options);
                  const tempUrl = URL.createObjectURL(compressedFile);
                  newImages.push({
                    id: Date.now() + i,
                    url: tempUrl,
                    caption: '',
                    isThumbnail: images.length === 0 && i === 0 
                  });
                } catch (error) {
                  console.error("Lỗi nén ảnh:", error);
                }
              }
              
              setImages([...images, ...newImages]);
              e.target.value = '';
              toast.dismiss(loadingToast);
              toast.success(`Đã thêm ${newImages.length} ảnh!`);
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
                      Ảnh Bìa
                    </div>
                  )}
                  <button onClick={() => removeImage(img.id)} style={{ position: 'absolute', top: 5, right: 5, background: 'rgba(255,0,0,0.8)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer' }}>×</button>
                  
                  <img loading="lazy" src={img.url} alt="preview" style={{ width: '100%', height: '140px', objectFit: 'cover' }} />
                  
                  <div style={{ padding: '10px' }}>
                    <input 
                      type="text" 
                      placeholder="Chú thích ảnh..." 
                      value={img.caption}
                      onChange={e => updateCaption(img.id, e.target.value)}
                      style={{ width: '100%', padding: '6px', fontSize: '0.85rem', border: '1px solid #cbd5e1', borderRadius: '4px', boxSizing: 'border-box' }}
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

      {/* CỘT PHẢI - SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Nút hành động */}
        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Đăng Tải</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button disabled={isSaving} onClick={handlePublish} style={primaryBtnStyle}>
              {isSaving ? 'Đang lưu...' : (articleToEdit ? 'Cập nhật Album' : 'Đăng Album')}
            </button>
            <button disabled={isSaving} onClick={onSave} style={secondaryBtnStyle}>
              Hủy bỏ / Quay lại
            </button>
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Thông Tin Hỗ Trợ</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            - Cần ít nhất 1 hình ảnh để đăng.<br/><br/>
            - Bạn có thể tải lên tối đa 30 hình ảnh cùng lúc.<br/><br/>
            - Có thể kéo thả thứ tự ảnh (Chưa hỗ trợ kéo thả, đang cập nhật).
          </p>
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

