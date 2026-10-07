"use client";
import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { addArticle, updateArticle, Article } from '../../../utils/store';

// Helper nén ảnh bằng HTML5 Canvas nhanh, mượt, không lỗi WebWorker trên mọi thiết bị (kể cả Safari iOS)
async function compressImage(file: File, maxDim = 1920, quality = 0.85): Promise<{ blob: Blob; fileName: string; contentType: string }> {
  // Nếu là file không phải ảnh thông thường hoặc không decode được qua Image, trả về file gốc
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const baseName = (file.name.substring(0, file.name.lastIndexOf('.')) || file.name)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase() || 'album-img';

  return new Promise((resolve) => {
    // Nếu file quá nhỏ (< 300KB) và là định dạng chuẩn, dùng luôn không cần canvas
    if (file.size < 300 * 1024 && ['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      resolve({ blob: file, fileName: `${baseName}.${ext}`, contentType: file.type });
      return;
    }

    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      try {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ blob: file, fileName: `${baseName}.${ext}`, contentType: file.type || 'image/jpeg' });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({
                blob,
                fileName: `${baseName}.jpg`,
                contentType: 'image/jpeg'
              });
            } else {
              resolve({ blob: file, fileName: `${baseName}.${ext}`, contentType: file.type || 'image/jpeg' });
            }
          },
          'image/jpeg',
          quality
        );
      } catch (err) {
        console.warn('Canvas compression error, using raw file:', err);
        resolve({ blob: file, fileName: `${baseName}.${ext}`, contentType: file.type || 'image/jpeg' });
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      // Fallback: Gửi file gốc lên server (Server hỗ trợ tới 20MB)
      resolve({ blob: file, fileName: `${baseName}.${ext}`, contentType: file.type || 'image/jpeg' });
    };

    img.src = objectUrl;
  });
}

// Upload 1 file lên /api/upload
async function uploadSingleImage(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const { blob, fileName, contentType } = await compressImage(file);
    const formData = new FormData();
    const safeFile = new File([blob], fileName, { type: contentType });
    formData.append('file', safeFile);

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (res.ok && data.success && data.url) {
      return { success: true, url: data.url };
    }
    return { success: false, error: data.error || data.message || `Lỗi máy chủ (${res.status})` };
  } catch (err: any) {
    return { success: false, error: err.message || 'Lỗi mạng' };
  }
}

// Upload song song theo nhóm (Concurrency limit: 3)
async function uploadBatch(
  files: File[],
  concurrency = 3,
  onProgress?: (completed: number, total: number) => void
): Promise<Array<{ file: File; success: boolean; url?: string; error?: string }>> {
  const results: Array<{ file: File; success: boolean; url?: string; error?: string }> = [];
  let index = 0;
  let completed = 0;

  async function worker() {
    while (index < files.length) {
      const currentIndex = index++;
      const file = files[currentIndex];
      const res = await uploadSingleImage(file);
      results[currentIndex] = { file, ...res };
      completed++;
      if (onProgress) onProgress(completed, files.length);
    }
  }

  const workers = Array.from({ length: Math.min(concurrency, files.length) }, () => worker());
  await Promise.all(workers);
  return results;
}

export default function AlbumEditor({
  onSave,
  onPublish,
  articleToEdit
}: {
  onSave: () => void;
  onPublish: () => void;
  articleToEdit?: Article;
}) {
  const [albumTitle, setAlbumTitle] = useState('');
  const [author, setAuthor] = useState('Ban Truyền Thông');
  const [excerpt, setExcerpt] = useState('');
  const [isHomeFeatured, setIsHomeFeatured] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatusText, setUploadStatusText] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Danh sách hình ảnh
  const [images, setImages] = useState<Array<{ id: number; url: string; caption: string; isThumbnail: boolean }>>([]);

  useEffect(() => {
    if (articleToEdit) {
      setAlbumTitle(articleToEdit.title || '');
      setAuthor(articleToEdit.author || 'Ban Truyền Thông');
      setExcerpt(articleToEdit.excerpt || '');
      setIsHomeFeatured(articleToEdit.isHomeFeatured !== false);
      setIsFeatured(Boolean(articleToEdit.isFeatured));
      if (articleToEdit.metadata?.images && Array.isArray(articleToEdit.metadata.images)) {
        setImages(articleToEdit.metadata.images);
      }
    }
  }, [articleToEdit]);

  const setThumbnail = (id: number) => {
    setImages(images.map((img) => ({ ...img, isThumbnail: img.id === id })));
  };

  const removeImage = (id: number) => {
    setImages((prev) => {
      const filtered = prev.filter((img) => img.id !== id);
      if (filtered.length > 0 && !filtered.some((img) => img.isThumbnail)) {
        filtered[0].isThumbnail = true;
      }
      return filtered;
    });
  };

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= images.length) return;
    const newImgs = [...images];
    const temp = newImgs[index];
    newImgs[index] = newImgs[targetIndex];
    newImgs[targetIndex] = temp;
    setImages(newImgs);
  };

  const updateCaption = (id: number, caption: string) => {
    setImages(images.map((img) => (img.id === id ? { ...img, caption } : img)));
  };

  const handleProcessFiles = async (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    if (images.length + selectedFiles.length > 50) {
      toast.error(`Mỗi Album tối đa 50 ảnh! Bạn đang chọn thêm ${selectedFiles.length} ảnh trong khi đã có ${images.length} ảnh.`);
      return;
    }

    setIsUploading(true);
    setUploadStatusText(`Đang tải ảnh 0/${selectedFiles.length}...`);
    const toastId = toast.loading(`Đang xử lý & tải lên ${selectedFiles.length} hình ảnh...`);

    try {
      const results = await uploadBatch(selectedFiles, 3, (done, total) => {
        setUploadStatusText(`Đang xử lý & tải lên: ${done}/${total} ảnh (${Math.round((done / total) * 100)}%)...`);
      });

      const newImgs: Array<{ id: number; url: string; caption: string; isThumbnail: boolean }> = [];
      let successCount = 0;
      let failCount = 0;

      results.forEach((res, i) => {
        if (res.success && res.url) {
          successCount++;
          newImgs.push({
            id: Date.now() + i + Math.floor(Math.random() * 1000),
            url: res.url,
            caption: '',
            isThumbnail: images.length === 0 && newImgs.length === 0
          });
        } else {
          failCount++;
          console.error(`Lỗi tải ảnh ${res.file.name}:`, res.error);
          toast.error(`Lỗi tải "${res.file.name}": ${res.error}`);
        }
      });

      if (newImgs.length > 0) {
        setImages((prev) => [...prev, ...newImgs]);
      }

      if (failCount === 0) {
        toast.success(`Đã tải lên thành công toàn bộ ${successCount} hình ảnh!`, { id: toastId });
      } else {
        toast.success(`Đã tải lên ${successCount} ảnh (${failCount} ảnh bị lỗi).`, { id: toastId });
      }
    } catch (err: any) {
      toast.error('Có lỗi trong quá trình tải ảnh: ' + err.message, { id: toastId });
    } finally {
      setIsUploading(false);
      setUploadStatusText('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handlePublish = async () => {
    if (!albumTitle.trim()) {
      toast.error('Vui lòng nhập tên Album!');
      return;
    }
    if (images.length === 0) {
      toast.error('Vui lòng tải lên ít nhất 1 hình ảnh!');
      return;
    }

    setIsSaving(true);
    try {
      const thumbnailUrl = images.find((img) => img.isThumbnail)?.url || images[0].url;

      const payload = {
        title: albumTitle.trim(),
        author: author.trim() || 'Ban Truyền Thông',
        excerpt: excerpt.trim() || `Album gồm ${images.length} hình ảnh: ${albumTitle.trim()}`,
        categoryId: 'hinh-anh',
        content: `<p>${albumTitle.trim()}</p>`,
        status: 'published' as const,
        thumbnailUrl: thumbnailUrl,
        isHomeFeatured: isHomeFeatured,
        isFeatured: isFeatured,
        metadata: {
          images,
          totalImages: images.length
        }
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
      console.error(err);
      toast.error('Lỗi khi lưu Album: ' + (err.message || 'Không thể kết nối Supabase'));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '30px', alignItems: 'start' }}>
      {/* CỘT TRÁI - MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0, fontSize: '1.6rem' }}>
              {articleToEdit ? 'Chỉnh Sửa Album Ảnh' : 'Tạo Album Ảnh Mới'}
            </h2>
            <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>
              Chuyên mục: <strong>Hình ảnh Giới trẻ Giáo phận</strong>
            </p>
          </div>
        </div>

        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '8px', padding: '15px' }}>
          <h3 style={{ color: '#166534', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn đăng Album Ảnh</h3>
          <ul style={{ color: '#15803d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem', lineHeight: '1.6' }}>
            <li>Hỗ trợ mọi định dạng ảnh: <strong>JPG, PNG, WebP, HEIC/iPhone</strong> dung lượng tối đa 20MB/ảnh.</li>
            <li>Hệ thống <strong>tự động tối ưu hóa và nén ảnh</strong> thông minh giúp trang tải nhanh.</li>
            <li>Có thể chọn nhiều ảnh cùng lúc (Tối đa <strong>50 ảnh/album</strong>).</li>
            <li>Bạn có thể chọn 1 ảnh làm <strong>Ảnh Bìa (Thumbnail)</strong> và thêm chú thích cho từng ảnh.</li>
          </ul>
        </div>

        <div>
          <label style={labelStyle}>Tên Album Ảnh *</label>
          <input
            style={inputStyle}
            type="text"
            placeholder="Ví dụ: Hình ảnh Đại hội Giới trẻ Giáo phận Bà Rịa 2026..."
            value={albumTitle}
            onChange={(e) => setAlbumTitle(e.target.value)}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <label style={labelStyle}>Người chụp / Ban thực hiện</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Ví dụ: Ban Truyền Thông Giới Trẻ..."
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
            />
          </div>
          <div>
            <label style={labelStyle}>Mô tả tóm tắt (Excerpt)</label>
            <input
              style={inputStyle}
              type="text"
              placeholder="Giới thiệu ngắn về sự kiện trong album..."
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
            />
          </div>
        </div>

        {/* KHU VỰC TẢI ẢNH (DROPZONE) */}
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              handleProcessFiles(Array.from(e.dataTransfer.files));
            }
          }}
          style={{
            background: isDragOver ? '#ecfeff' : 'white',
            border: `2px dashed ${isDragOver ? 'var(--color-brand-cyan)' : '#94a3b8'}`,
            padding: '35px 20px',
            borderRadius: '12px',
            textAlign: 'center',
            transition: 'all 0.2s ease',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (!isUploading && fileInputRef.current) {
              fileInputRef.current.click();
            }
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>📤</div>
          <h3 style={{ margin: 0, color: '#1e293b', fontSize: '1.15rem' }}>
            Kéo thả hoặc click để chọn ảnh tải lên
          </h3>
          <p style={{ color: '#64748b', fontSize: '0.88rem', margin: '6px 0 15px 0' }}>
            Hỗ trợ JPG, PNG, WebP, iPhone HEIC. Có thể chọn nhiều ảnh cùng lúc (Tối đa 50 ảnh).
          </p>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            style={{ display: 'none' }}
            disabled={isUploading}
            onChange={(e) => {
              const files = Array.from(e.target.files || []);
              handleProcessFiles(files);
            }}
          />

          <button
            type="button"
            disabled={isUploading}
            style={{
              padding: '10px 24px',
              background: isUploading ? '#94a3b8' : 'var(--color-brand-cyan)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isUploading ? 'wait' : 'pointer',
              fontWeight: 'bold',
              fontSize: '0.95rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
            }}
          >
            {isUploading ? 'Đang xử lý tải ảnh...' : '📂 Chọn ảnh từ máy tính / điện thoại'}
          </button>

          {isUploading && (
            <div style={{ marginTop: '15px' }}>
              <p style={{ color: 'var(--color-brand-cyan)', fontWeight: 'bold', margin: '0 0 8px 0', fontSize: '0.9rem' }}>
                {uploadStatusText}
              </p>
              <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    height: '100%',
                    background: 'var(--color-brand-cyan)',
                    width: '100%',
                    animation: 'pulse 1.5s infinite'
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* DANH SÁCH ẢNH ĐÃ TẢI LÊN */}
        {images.length > 0 && (
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <h4 style={{ margin: 0, color: '#1e293b', fontSize: '1.05rem', fontWeight: 'bold' }}>
                📸 Danh sách hình ảnh trong Album ({images.length} ảnh)
              </h4>
              <button
                type="button"
                onClick={() => {
                  if (confirm('Bạn có chắc muốn xóa tất cả ảnh trong danh sách?')) {
                    setImages([]);
                  }
                }}
                style={{
                  background: 'transparent',
                  color: '#ef4444',
                  border: '1px solid #fca5a5',
                  padding: '5px 12px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                  fontWeight: 600
                }}
              >
                Xóa tất cả
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px' }}>
              {images.map((img, index) => (
                <div
                  key={img.id}
                  style={{
                    background: 'white',
                    border: `2px solid ${img.isThumbnail ? 'var(--color-brand-cyan)' : '#e2e8f0'}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    position: 'relative',
                    boxShadow: img.isThumbnail ? '0 0 0 2px rgba(8,145,178,0.2)' : 'none',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                >
                  {img.isThumbnail && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 8,
                        left: 8,
                        background: 'var(--color-brand-cyan)',
                        color: 'white',
                        fontSize: '0.72rem',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontWeight: 'bold',
                        zIndex: 2,
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    >
                      ★ ẢNH BÌA
                    </div>
                  )}

                  {/* Nút xóa ảnh */}
                  <button
                    type="button"
                    onClick={() => removeImage(img.id)}
                    title="Xóa ảnh này"
                    style={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      background: 'rgba(239, 68, 68, 0.9)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: '26px',
                      height: '26px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      zIndex: 2
                    }}
                  >
                    ×
                  </button>

                  <div style={{ position: 'relative', height: '150px', background: '#f1f5f9' }}>
                    <img
                      loading="lazy"
                      src={img.url}
                      alt="preview"
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 4,
                        right: 4,
                        background: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        fontSize: '0.7rem',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}
                    >
                      #{index + 1}
                    </div>
                  </div>

                  <div style={{ padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1 }}>
                    <input
                      type="text"
                      placeholder="Chú thích ảnh này..."
                      value={img.caption}
                      onChange={(e) => updateCaption(img.id, e.target.value)}
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '0.85rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '4px',
                        boxSizing: 'border-box'
                      }}
                    />

                    <div style={{ display: 'flex', gap: '6px', marginTop: 'auto' }}>
                      {!img.isThumbnail && (
                        <button
                          type="button"
                          onClick={() => setThumbnail(img.id)}
                          style={{
                            flex: 1,
                            padding: '5px',
                            fontSize: '0.78rem',
                            background: '#f8fafc',
                            border: '1px solid #cbd5e1',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            color: '#334155'
                          }}
                        >
                          Đặt ảnh bìa
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={index === 0}
                        onClick={() => moveImage(index, 'up')}
                        title="Di chuyển sang trái"
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.78rem',
                          background: index === 0 ? '#f1f5f9' : '#e2e8f0',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === 0 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ◀
                      </button>
                      <button
                        type="button"
                        disabled={index === images.length - 1}
                        onClick={() => moveImage(index, 'down')}
                        title="Di chuyển sang phải"
                        style={{
                          padding: '5px 8px',
                          fontSize: '0.78rem',
                          background: index === images.length - 1 ? '#f1f5f9' : '#e2e8f0',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: index === images.length - 1 ? 'not-allowed' : 'pointer'
                        }}
                      >
                        ▶
                      </button>
                    </div>
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
          <h3 style={boxTitleStyle}>Thao Tác Đăng Tải</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button
              disabled={isSaving || isUploading}
              onClick={handlePublish}
              style={{
                ...primaryBtnStyle,
                background: isSaving || isUploading ? '#94a3b8' : 'var(--color-brand-cyan)'
              }}
            >
              {isSaving ? 'Đang lưu album...' : articleToEdit ? '✓ Cập nhật Album' : '🚀 Đăng Album Ngay'}
            </button>
            <button
              disabled={isSaving || isUploading}
              onClick={onSave}
              style={secondaryBtnStyle}
            >
              Quay lại danh sách
            </button>
          </div>
        </div>

        {/* Cấu hình hiển thị */}
        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Vị Trí Hiển Thị</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
              <input
                type="checkbox"
                checked={isHomeFeatured}
                onChange={(e) => setIsHomeFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand-cyan)' }}
              />
              <span>Hiển thị trên <strong>Trang chủ</strong> (Slider Album)</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.9rem', color: '#1e293b' }}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--color-brand-cyan)' }}
              />
              <span>Ghim làm <strong>Tiêu điểm</strong> chuyên mục</span>
            </label>
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Thông Tin Thống Kê</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.6 }}>
            - Số ảnh hiện tại: <strong>{images.length} / 50</strong><br />
            - Ảnh bìa: <strong>{images.find((img) => img.isThumbnail) ? 'Đã chọn' : 'Chưa có'}</strong><br />
            - Chuyên mục: <strong>Hình ảnh Giới trẻ Giáo phận</strong><br />
            - Tự động hiển thị thư viện ảnh Lightbox toàn màn hình khi người xem click vào ảnh.
          </p>
        </div>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle: React.CSSProperties = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)', boxSizing: 'border-box' };
const boxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const boxTitleStyle = { marginTop: 0, marginBottom: '15px', color: '#1e293b', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px', fontWeight: 'bold' };
const primaryBtnStyle = { color: 'white', padding: '14px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s', fontSize: '1rem' };
const secondaryBtnStyle = { background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
