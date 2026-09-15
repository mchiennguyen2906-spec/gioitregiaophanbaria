import React, { useState, useEffect } from 'react';
import { getFooterConfigFromStore, saveFooterConfigToStore, FooterConfig } from "../../../utils/store";

export default function FooterManager() {
  const [config, setConfig] = useState<FooterConfig | null>(null);

  useEffect(() => {
    const load = async () => setConfig(await getFooterConfigFromStore());
    load();
  }, []);

  const handleChange = (field: keyof FooterConfig, value: any) => {
    if (config) {
      setConfig({ ...config, [field]: value });
    }
  };

  const handleQuickLinkChange = (index: number, field: 'title' | 'url', value: string) => {
    if (config) {
      const newLinks = [...config.quickLinks];
      newLinks[index] = { ...newLinks[index], [field]: value };
      setConfig({ ...config, quickLinks: newLinks });
    }
  };

  const handleSave = async () => {
    if (config) {
      await saveFooterConfigToStore(config);
      alert('Cập nhật cấu hình Footer thành công!');
    }
  };

  if (!config) return <p>Loading...</p>;

  const inputStyle = { width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', marginBottom: '15px' };
  const labelStyle = { display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#64748b', fontWeight: 'bold' };
  const sectionStyle = { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: 'var(--color-brand-cyan)', margin: '0 0 20px 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
        Quản lý Thông Tin Chân Trang (Footer)
      </h2>

      <div style={sectionStyle}>
        <h3 style={{ color: '#0f172a', marginTop: 0 }}>Cột 1: Giới thiệu & Mạng xã hội</h3>
        <label style={labelStyle}>Mô tả ngắn gọn</label>
        <textarea 
          style={{ ...inputStyle, resize: 'vertical' }} 
          rows={3}
          value={config.aboutText} 
          onChange={e => handleChange('aboutText', e.target.value)} 
        />
        
        <label style={labelStyle}>Link Facebook</label>
        <input style={inputStyle} type="text" value={config.facebookLink} onChange={e => handleChange('facebookLink', e.target.value)} />
        
        <label style={labelStyle}>Link TikTok</label>
        <input style={inputStyle} type="text" value={config.tiktokLink} onChange={e => handleChange('tiktokLink', e.target.value)} />
        
        <label style={labelStyle}>Link Instagram</label>
        <input style={inputStyle} type="text" value={config.instagramLink} onChange={e => handleChange('instagramLink', e.target.value)} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: '#0f172a', marginTop: 0 }}>Cột 2: Thông tin Liên hệ</h3>
        <label style={labelStyle}>Địa chỉ</label>
        <input style={inputStyle} type="text" value={config.address} onChange={e => handleChange('address', e.target.value)} />
        
        <label style={labelStyle}>Hotline</label>
        <input style={inputStyle} type="text" value={config.hotline} onChange={e => handleChange('hotline', e.target.value)} />
        
        <label style={labelStyle}>Email</label>
        <input style={inputStyle} type="text" value={config.email} onChange={e => handleChange('email', e.target.value)} />
        
        <label style={labelStyle}>Trực online</label>
        <input style={inputStyle} type="text" value={config.onlineSupport} onChange={e => handleChange('onlineSupport', e.target.value)} />
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: '#0f172a', marginTop: 0 }}>Cột 3: Truy Cập Nhanh (4 Links)</h3>
        {config.quickLinks.map((link, idx) => (
          <div key={idx} style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Tiêu đề Link {idx + 1}</label>
              <input style={{...inputStyle, marginBottom: 0}} type="text" value={link.title} onChange={e => handleQuickLinkChange(idx, 'title', e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>URL Link {idx + 1}</label>
              <input style={{...inputStyle, marginBottom: 0}} type="text" value={link.url} onChange={e => handleQuickLinkChange(idx, 'url', e.target.value)} />
            </div>
          </div>
        ))}
      </div>

      <div style={sectionStyle}>
        <h3 style={{ color: '#0f172a', marginTop: 0 }}>Cột 4: Nhận Bản Tin Trẻ</h3>
        <label style={labelStyle}>Mô tả phần nhận bản tin</label>
        <textarea 
          style={{ ...inputStyle, resize: 'vertical' }} 
          rows={2}
          value={config.newsletterText} 
          onChange={e => handleChange('newsletterText', e.target.value)} 
        />
      </div>

      <button 
        onClick={handleSave}
        style={{ background: 'var(--color-brand-red)', color: 'white', padding: '12px 30px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}
      >
        Lưu Footer
      </button>
    </div>
  );
}
