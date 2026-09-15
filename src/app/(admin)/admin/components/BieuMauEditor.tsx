"use client";
import React, { useState, useRef } from 'react';
import { addArticle, updateArticle, Article } from '../../../utils/store';

interface BieuMauEditorProps {
  articleToEdit?: Article | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function BieuMauEditor({ articleToEdit, onSave, onCancel }: BieuMauEditorProps) {
  const [title, setTitle] = useState(articleToEdit?.title || '');
  const [excerpt, setExcerpt] = useState(articleToEdit?.excerpt || '');
  const [attachmentUrl, setAttachmentUrl] = useState(articleToEdit?.attachmentUrl || '');
  const [attachmentName, setAttachmentName] = useState(articleToEdit?.attachmentName || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert('Chỉ chấp nhận file PDF, Word (.doc, .docx) hoặc Excel (.xls, .xlsx)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('File tối đa 10MB!');
      return;
    }

    setUploading(true);
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
      } else {
        alert('Lỗi upload: ' + (data.error || 'Không xác định'));
      }
    } catch (err) {
      alert('Lỗi kết nối khi upload file!');
    }
    setUploading(false);
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

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Vui lòng nhập tên văn bản/biểu mẫu!');
      return;
    }
    if (!attachmentUrl) {
      alert('Vui lòng đính kèm file!');
      return;
    }

    setSaving(true);
    try {
      if (articleToEdit) {
        await updateArticle(articleToEdit.id, {
          title,
          excerpt,
          attachmentUrl,
          attachmentName,
          categoryId: 'bieu-mau',
          content: `<p>File đính kèm: <a href="${attachmentUrl}" target="_blank">${attachmentName}</a></p>`,
          status: 'published'
        });
      } else {
        await addArticle({
          title,
          excerpt,
          attachmentUrl,
          attachmentName,
          categoryId: 'bieu-mau',
          content: `<p>File đính kèm: <a href="${attachmentUrl}" target="_blank">${attachmentName}</a></p>`,
          author: 'Ban Quản trị',
          status: 'published',
        });
      }
      alert(articleToEdit ? 'Đã cập nhật biểu mẫu!' : 'Đã đăng biểu mẫu thành công!');
      onSave();
    } catch (err) {
      alert('Lỗi khi lưu biểu mẫu!');
    }
    setSaving(false);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
        <h2 style={{ margin: 0, color: 'var(--color-brand-cyan)' }}>
          {articleToEdit ? '✏️ Sửa Biểu mẫu' : '📋 Thêm Biểu mẫu & Văn bản mới'}
        </h2>
        <button onClick={onCancel} style={{
          padding: '8px 20px', border: '1px solid #cbd5e1', borderRadius: '6px',
          background: 'white', cursor: 'pointer', color: '#64748b'
        }}>
          ← Quay lại
        </button>
      </div>

      {/* Tên văn bản */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Tên văn bản / Biểu mẫu *</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="VD: Đơn xin Hôn phối, Đơn xin Rửa tội..."
          style={inputStyle}
        />
      </div>

      {/* Mô tả */}
      <div style={{ marginBottom: '20px' }}>
        <label style={labelStyle}>Mô tả ngắn</label>
        <textarea
          value={excerpt}
          onChange={e => setExcerpt(e.target.value)}
          placeholder="Mô tả ngắn về văn bản này (không bắt buộc)"
          rows={3}
          style={{ ...inputStyle, resize: 'vertical' }}
        />
      </div>

      {/* Upload file */}
      <div style={{ marginBottom: '25px' }}>
        <label style={labelStyle}>File đính kèm * (PDF, Word, Excel — tối đa 10MB)</label>
        
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.xls,.xlsx"
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {attachmentUrl ? (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '15px',
            padding: '15px 20px', border: '2px solid #22c55e', borderRadius: '10px',
            background: '#f0fdf4'
          }}>
            <span style={{ fontSize: '2rem' }}>{getFileIcon(attachmentName)}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 'bold', color: '#166534' }}>{attachmentName}</div>
              <a href={attachmentUrl} target="_blank" rel="noopener noreferrer" 
                 style={{ fontSize: '0.85rem', color: '#3b82f6', textDecoration: 'underline' }}>
                Xem file ↗
              </a>
            </div>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{
                padding: '8px 15px', border: '1px solid #f97316', borderRadius: '6px',
                background: '#fff7ed', cursor: 'pointer', color: '#ea580c', fontSize: '0.85rem'
              }}
            >
              🔄 Đổi file
            </button>
          </div>
        ) : (
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
              width: '100%', padding: '40px', border: '2px dashed #94a3b8', borderRadius: '12px',
              background: uploading ? '#f1f5f9' : '#f8fafc', cursor: uploading ? 'wait' : 'pointer',
              color: '#64748b', fontSize: '1rem', transition: 'all 0.2s'
            }}
          >
            {uploading ? (
              <>
                <span style={{ fontSize: '2rem' }}>⏳</span>
                <span>Đang tải file lên...</span>
              </>
            ) : (
              <>
                <span style={{ fontSize: '2.5rem' }}>📎</span>
                <span style={{ fontWeight: 'bold' }}>Nhấn để chọn file đính kèm</span>
                <span style={{ fontSize: '0.85rem', opacity: 0.7 }}>PDF, Word (.doc, .docx), Excel (.xls, .xlsx)</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Nút lưu */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'flex-end' }}>
        <button onClick={onCancel} style={{
          padding: '12px 25px', border: '1px solid #cbd5e1', borderRadius: '8px',
          background: 'white', cursor: 'pointer', fontSize: '1rem', color: '#64748b'
        }}>
          Hủy
        </button>
        <button onClick={handleSave} disabled={saving} style={{
          padding: '12px 30px', border: 'none', borderRadius: '8px',
          background: saving ? '#94a3b8' : 'var(--color-brand-cyan)', color: 'white',
          cursor: saving ? 'wait' : 'pointer', fontSize: '1rem', fontWeight: 'bold'
        }}>
          {saving ? 'Đang lưu...' : (articleToEdit ? '💾 Cập nhật' : '📤 Đăng biểu mẫu')}
        </button>
      </div>
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.95rem'
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1',
  fontSize: '1rem', boxSizing: 'border-box'
};
