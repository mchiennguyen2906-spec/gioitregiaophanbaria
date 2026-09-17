"use client";
import React, { useState, useEffect } from 'react';
import { getArticlesFromStore, Article } from '../utils/store';

export default function EventRegistrationForm() {
  const [events, setEvents] = useState<Article[]>([]);
  const [organizers, setOrganizers] = useState<{ id: string, name: string }[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  
  const [formData, setFormData] = useState({
    orgId: '',
    eventId: '',
    fullName: '',
    phone: '',
    email: '',
    parish: '',
    address: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      const allArticles = await getArticlesFromStore();
      // Filter articles that are events or courses and have metadata
      const validEvents = allArticles.filter(a => 
        (a.categoryId === 'su-kien' || a.categoryId === 'lich-hoc' || a.categoryId === 'bieu-mau') && 
        a.metadata && a.metadata.organizer
      );
      
      setEvents(validEvents);
      
      // Extract unique organizers
      const uniqueOrgs = new Map();
      validEvents.forEach(e => {
        if (!uniqueOrgs.has(e.metadata.organizer)) {
          uniqueOrgs.set(e.metadata.organizer, e.metadata.organizer);
        }
      });
      
      const orgList = Array.from(uniqueOrgs.values()).map(org => ({ id: org as string, name: org as string }));
      setOrganizers(orgList);
      
      if (orgList.length > 0) {
        setFormData(prev => ({ ...prev, orgId: orgList[0].id }));
      }
      setLoadingEvents(false);
    };
    
    fetchEvents();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Nếu đổi đơn vị tổ chức, reset sự kiện đã chọn
    if (name === 'orgId') {
      setFormData(prev => ({ ...prev, orgId: value, eventId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId || !formData.fullName || !formData.phone || !formData.parish) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }
    
    const currentEvent = events.find(ev => ev.id === formData.eventId);
    const organizerEmail = currentEvent?.metadata?.email;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/send-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orgId: formData.orgId,
          eventId: formData.eventId,
          eventName: currentEvent?.title,
          fullName: formData.fullName,
          phone: formData.phone,
          email: formData.email,
          parish: formData.parish,
          address: formData.address,
          organizerEmail: organizerEmail || 'Không có email' // Backend will handle or log this
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert("Chúc mừng bạn đã đăng ký thành công!");
        window.location.href = '/';
      } else {
        alert("Có lỗi xảy ra khi gửi thông tin: " + (result.error || "Lỗi không xác định"));
      }
    } catch (err) {
      console.error(err);
      alert("Không thể kết nối đến máy chủ. Vui lòng thử lại sau.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableEvents = events.filter(e => e.metadata?.organizer === formData.orgId);
  const currentEvent = events.find(e => e.id === formData.eventId);

  return (
    <div style={{ paddingBottom: '40px' }}>
      <div className="container" style={{ display: 'flex', gap: '30px', flexWrap: 'wrap' }}>
        
        {/* CỘT TRÁI (65%): Khu vực Form */}
        <div style={{ flex: '1 1 65%', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          
          {/* ======================= BIỂU MẪU ======================= */}
          <div className="section-header" style={{ borderBottom: '2px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '25px' }}>
            <h2 className="section-title" style={{ fontSize: '1.4rem', color: 'var(--color-brand-cyan)' }}>BIỂU MẪU ĐĂNG KÝ</h2>
            <p style={{ fontSize: '0.9rem', color: '#64748b', marginTop: '5px' }}>Vui lòng điền thông tin để đăng ký.</p>
          </div>

          {loadingEvents ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách sự kiện...</div>
          ) : (
            <form onSubmit={handleStep1Submit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* PHẦN 1: THÔNG TIN SỰ KIỆN */}
                  <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>1. Chọn Sự Kiện</h3>
                    
                    {/* 1. Chọn Đơn Vị Tổ Chức */}
                    <div style={{ marginBottom: '15px' }}>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
                        Đơn vị tổ chức <span style={{color: 'red'}}>*</span>
                      </label>
                      <select 
                        name="orgId" 
                        value={formData.orgId} 
                        onChange={handleInputChange} 
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#fff', color: '#334155', fontWeight: 'bold' }} 
                        required
                      >
                        {organizers.length === 0 && <option value="">-- Chưa có đơn vị nào tổ chức sự kiện --</option>}
                        {organizers.map(org => (
                          <option key={org.id} value={org.id}>{org.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* 2. Chọn Sự Kiện */}
                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>
                        Sự kiện đăng ký <span style={{color: 'red'}}>*</span>
                      </label>
                      <select 
                        name="eventId" 
                        value={formData.eventId} 
                        onChange={handleInputChange} 
                        style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', background: '#fff', color: '#334155' }} 
                        required
                        disabled={!formData.orgId}
                      >
                        <option value="">-- Chọn sự kiện / khóa học --</option>
                        {availableEvents.map(details => (
                          <option key={details.id} value={details.id}>{details.title}</option>
                        ))}
                      </select>
                      {availableEvents.length === 0 && formData.orgId && (
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-brand-red)', marginTop: '8px', fontStyle: 'italic' }}>Đơn vị này hiện chưa có sự kiện nào mở đăng ký.</p>
                      )}
                    </div>

                    {/* 3. Hiển thị thông tin người phụ trách ngay khi chọn sự kiện xong */}
                    {currentEvent && currentEvent.metadata && (
                      <div className="fade-in" style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <span>ℹ️</span> Thông tin liên hệ (Ban Tổ Chức):
                        </h4>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#15803d' }}>
                          <div><strong>Người phụ trách:</strong> <br/>{currentEvent.metadata.contactName || 'Đang cập nhật'}</div>
                          <div><strong>SĐT/Zalo:</strong> <br/>{currentEvent.metadata.phone || 'Đang cập nhật'}</div>
                          <div><strong>Email:</strong> <br/>{currentEvent.metadata.email || 'Không có'}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* PHẦN 2: THÔNG TIN NGƯỜI ĐĂNG KÝ */}
                  <div style={{ marginTop: '10px' }}>
                    <h3 style={{ fontSize: '1.1rem', color: '#334155', marginBottom: '15px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>2. Thông Tin Người Đăng Ký</h3>
                    
                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
                      <div style={{ flex: '1 1 45%' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Họ và Tên <span style={{color: 'red'}}>*</span></label>
                        <input name="fullName" value={formData.fullName} onChange={handleInputChange} type="text" placeholder="Nhập họ và tên..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} required />
                      </div>
                      <div style={{ flex: '1 1 45%' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Số điện thoại <span style={{color: 'red'}}>*</span></label>
                        <input name="phone" value={formData.phone} onChange={handleInputChange} type="tel" placeholder="Nhập số điện thoại Zalo..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} required />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', marginBottom: '15px' }}>
                      <div style={{ flex: '1 1 45%' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Email</label>
                        <input name="email" value={formData.email} onChange={handleInputChange} type="email" placeholder="Email cá nhân (nếu có)..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} />
                      </div>
                      <div style={{ flex: '1 1 45%' }}>
                        <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Thuộc Giáo xứ <span style={{color: 'red'}}>*</span></label>
                        <input name="parish" value={formData.parish} onChange={handleInputChange} type="text" placeholder="Nhập tên giáo xứ của bạn..." style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }} required />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155' }}>Địa chỉ hiện tại</label>
                      <textarea name="address" value={formData.address} onChange={handleInputChange} placeholder="Nhập địa chỉ của bạn để liên hệ khi cần..." rows={3} style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', resize: 'vertical' }}></textarea>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      style={{ 
                        background: isSubmitting ? '#94a3b8' : 'var(--color-brand-red)', 
                        color: 'white', border: 'none', padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', 
                        cursor: isSubmitting ? 'not-allowed' : 'pointer', width: '100%', 
                        boxShadow: isSubmitting ? 'none' : '0 4px 12px rgba(220, 38, 38, 0.3)', transition: 'all 0.3s' 
                      }}>
                      {isSubmitting ? 'ĐANG XỬ LÝ VÀ GỬI THÔNG TIN...' : 'GỬI BIỂU MẪU & ĐĂNG KÝ'}
                    </button>
                  </div>
                </form>
          )}

        </div>

        {/* CỘT PHẢI (35%): Tin tức liên quan + Hotline Giáo phận */}
        <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Phần Trên: Tin tức */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '15px' }}>
              <h2 className="section-title" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>THÔNG TIN CÁC SỰ KIỆN</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {events.slice(0, 3).map((item, idx) => (
                <a key={idx} href={`/${item.categoryId}/${item.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', textDecoration: 'none' }}>
                  <img src={item.thumbnailUrl || 'https://via.placeholder.com/80x65?text=Event'} style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '6px' }} alt="Thumb" />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', color: 'var(--color-text-heading)', lineHeight: '1.4', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-cyan)', fontWeight: 'bold' }}>Tìm hiểu thêm &raquo;</span>
                  </div>
                </a>
              ))}
              {events.length === 0 && (
                <div style={{ fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>Chưa có thông tin sự kiện nào.</div>
              )}
            </div>
          </div>

          {/* Phần Dưới: Hotline Chung Hệ Thống */}
          <div style={{ background: 'linear-gradient(135deg, #0284c7, #0ea5e9)', color: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(2, 132, 199, 0.3)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>💻</span> HỖ TRỢ KỸ THUẬT WEB
            </h3>
            <p style={{ fontSize: '0.85rem', opacity: 0.9, marginBottom: '15px' }}>
              Nếu gặp lỗi form hoặc sự cố kỹ thuật trên website, vui lòng liên hệ Admin:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <a href="https://zalo.me/0911775454" target="_blank" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'white', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '1.8rem' }}>💬</div>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Chat kỹ thuật (Zalo)</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>0911.775.454</div>
                </div>
              </a>
              <a href="mailto:gioitregiaophanbaria@gmail.com" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.1)', padding: '12px', borderRadius: '8px', textDecoration: 'none', color: 'white', transition: 'background 0.2s' }}>
                <div style={{ fontSize: '1.8rem' }}>📧</div>
                <div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.9 }}>Email kỹ thuật</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>gioitregiaophanbaria@gmail.com</div>
                </div>
              </a>
            </div>
          </div>
        </div>

      </div>
      
      {/* Thêm CSS animation nhẹ cho hiệu ứng mượt */}
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in {
          animation: fadeIn 0.4s ease-in-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  );
}
