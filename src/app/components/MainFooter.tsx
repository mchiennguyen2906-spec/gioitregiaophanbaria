"use client";
import React, { useState, useEffect } from 'react';
import { getFooterConfigFromStore, FooterConfig } from '../utils/store';

export default function MainFooter() {
  const [config, setConfig] = useState<FooterConfig | null>(null);

  useEffect(() => {
    const loadConfig = () => setConfig(getFooterConfigFromStore());
    loadConfig();
    window.addEventListener('storage_update', loadConfig);
    return () => window.removeEventListener('storage_update', loadConfig);
  }, []);

  if (!config) return null;

  return (
    <footer className="mega-footer">
      <div className="container footer-grid">
        
        {/* Cột 1: Thông tin Tòa Giám Mục */}
        <div className="footer-col">
          <div className="footer-logo">
            <img src="/logo_gioitre_new.png" alt="Logo Giới Trẻ Bà Rịa" style={{height: '50px', marginRight: '15px'}} />
            <h3>GIỚI TRẺ <br/>GIÁO PHẬN BÀ RỊA</h3>
          </div>
          <p className="footer-desc">
            {config.aboutText}
          </p>
          <div className="social-links">
            {config.facebookLink && <a href={config.facebookLink} className="social-icon">Facebook</a>}
            {config.tiktokLink && <a href={config.tiktokLink} className="social-icon">TikTok</a>}
            {config.instagramLink && <a href={config.instagramLink} className="social-icon">Instagram</a>}
          </div>
        </div>

        {/* Cột 2: Liên hệ */}
        <div className="footer-col">
          <h4>Ban Mục Vụ Giới Trẻ</h4>
          <ul className="footer-links">
            <li>📍 Địa chỉ: {config.address}</li>
            <li>📞 Hotline: {config.hotline}</li>
            <li>📧 Email: {config.email}</li>
            <li>🕒 Trực online: {config.onlineSupport}</li>
          </ul>
        </div>

        {/* Cột 3: Liên kết nhanh */}
        <div className="footer-col">
          <h4>Truy Cập Nhanh</h4>
          <ul className="footer-links">
            {config.quickLinks.map((link, idx) => (
              <li key={idx}>
                <a href={link.url}>{link.title}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Cột 4: Đăng ký & Bản tin */}
        <div className="footer-col">
          <h4>Nhận Bản Tin Trẻ</h4>
          <p style={{fontSize: '0.85rem', color: '#94a3b8', margin: '0 0 10px 0'}}>{config.newsletterText}</p>
          <div className="newsletter-form">
            <input type="email" placeholder="Email của bạn..." className="newsletter-input" />
            <button className="newsletter-btn">Đăng ký</button>
          </div>
        </div>

      </div>

      <div className="footer-bottom">
        <div className="container" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
          <p style={{margin: 0, display: 'flex', alignItems: 'center'}}>
            © 2026 Bản quyền thuộc về Ban Mục Vụ Giới Trẻ Giáo Phận Bà Rịa 
            <a href="/admin/login" style={{textDecoration: 'none', marginLeft: '5px', opacity: 0.3, cursor: 'pointer'}} title="Admin Login">⚙️</a>
          </p>
          <div className="footer-bottom-links">
            <a href="#">Điều khoản sử dụng</a>
            <a href="#">Chính sách bảo mật</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
