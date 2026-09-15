import React, { useState, useEffect } from 'react';
import { getRadioLinkFromStore, saveRadioLinkToStore } from "../../../utils/store";

export default function RadioManager() {
  const [link, setLink] = useState('');

  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    const load = async () => setLink(await getRadioLinkFromStore());
    load();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    if (link) formData.append('oldFileUrl', link);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      const result = await res.json();
      if (result.success) {
        setLink(result.url);
        await saveRadioLinkToStore(result.url); // Tự động lưu sau khi upload
        alert('Tải file MP3 thành công và đã tự động lưu!');
      } else {
        alert('Lỗi khi tải file lên: ' + result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi tải file lên!');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async () => {
    await saveRadioLinkToStore(link);
    alert('Đã cập nhật link Radio Lời Chúa thành công!');
  };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: 'var(--color-brand-cyan)', margin: '0 0 20px 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
        Quản lý Radio Lời Chúa
      </h2>
      
      <div style={{ background: '#fef3c7', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #f59e0b', marginBottom: '20px' }}>
        <p style={{ margin: 0, color: '#b45309', fontWeight: 'bold' }}>
          Lưu ý: Tải trực tiếp file âm thanh (.mp3). Hệ thống sẽ tự động xóa file cũ khi bạn tải file mới để tiết kiệm dung lượng. 
          File MP3 không được vượt quá 30MB!
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: '#64748b', fontWeight: 'bold' }}>
            Tải lên file MP3 mới
          </label>
          <input 
            type="file" 
            accept="audio/mpeg, audio/mp3" 
            onChange={handleFileUpload}
            disabled={isUploading}
            style={{ marginBottom: '10px' }}
          />
          {isUploading && <span style={{ color: 'var(--color-brand-cyan)', fontSize: '0.9rem', marginLeft: '10px' }}>Đang tải lên...</span>}
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.95rem', marginBottom: '8px', color: '#64748b', fontWeight: 'bold' }}>
            Hoặc dán Đường dẫn (URL) file MP3
          </label>
          <input 
            type="text" 
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/audio.mp3"
            style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
          />
        </div>

        <button 
          onClick={handleSave}
          style={{ background: 'var(--color-brand-red)', color: 'white', padding: '12px 25px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem', alignSelf: 'flex-start' }}
        >
          Lưu Cấu Hình Radio
        </button>
      </div>
    </div>
  );
}
