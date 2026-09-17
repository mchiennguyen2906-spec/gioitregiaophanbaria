"use client";
import React, { useState, useRef } from 'react';
import { addArticle, updateArticle, Article } from '../../../utils/store';
import toast from 'react-hot-toast';

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
      toast.error('Chỉ chấp nhận file PDF, Word (.doc, .docx) hoặc Excel (.xls, .xlsx)');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File tối đa 10MB!');
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
        toast.success('Đã tải file lên thành công!');
      } else {
        toast.error('Lỗi upload: ' + (data.error || 'Không xác định'));
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi upload file!');
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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tên văn bản/biểu mẫu!');
      return;
    }
    if (!attachmentUrl) {
      toast.error('Vui lòng đính kèm file!');
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
      toast.success(articleToEdit ? 'Đã cập nhật biểu mẫu!' : 'Đã đăng biểu mẫu thành công!');
      onSave();
    } catch (err: any) {
      toast.error('Lỗi khi lưu biểu mẫu: ' + err.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '30px', alignItems: 'start' }}>
      
      {/* CỘT TRÁI - MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--color-brand-cyan)' }}>
            {articleToEdit ? 'Sửa Biểu mẫu' : 'Thêm Biểu mẫu & Văn bản mới'}
          </h2>
        </div>

        {/* Tên văn bản */}
        <div>
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
        <div>
          <label style={labelStyle}>Mô tả ngắn</label>
          <textarea
            value={excerpt}
            onChange={e => setExcerpt(e.target.value)}
            placeholder="Mô tả ngắn về văn bản này (không bắt buộc)"
            rows={4}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>

        {/* Upload file */}
        <div>
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
      </div>

      {/* CỘT PHẢI - SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Đăng Tải</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button onClick={handleSave} disabled={saving} style={primaryBtnStyle}>
              {saving ? 'Đang lưu...' : (articleToEdit ? 'Cập nhật' : 'Đăng biểu mẫu')}
            </button>
            <button onClick={onCancel} disabled={saving} style={secondaryBtnStyle}>
              Hủy bỏ
            </button>
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Thông Tin Hỗ Trợ</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', margin: 0, lineHeight: 1.5 }}>
            - Biểu mẫu sẽ được tự động hiển thị trong trang **Văn Bản & Biểu Mẫu**.<br/><br/>
            - Bạn có thể tải lên các file **PDF, Word hoặc Excel**.<br/><br/>
            - Dung lượng tối đa là **10MB**.
          </p>
        </div>

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

const boxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const boxTitleStyle = { marginTop: 0, marginBottom: '15px', color: '#1e293b', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' };
const primaryBtnStyle = { background: 'var(--color-brand-cyan)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
const secondaryBtnStyle = { background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };

