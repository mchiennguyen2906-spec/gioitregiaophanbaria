"use client";
import React, { useState } from 'react';

// Dữ liệu Đơn vị tổ chức & Người phụ trách
const ORGANIZERS = [
  { id: 'gp-baria', name: 'Giới trẻ Giáo phận Bà Rịa', contact: { name: 'Lm. Giuse Nguyễn Văn A (Đặc trách)', phone: '0911.775.454', email: 'gioitregiaophanbaria@gmail.com' } },
  { id: 'gx-chut-hai', name: 'Giáo xứ Chu Hải', contact: { name: 'Trưởng ban Giới trẻ Chu Hải', phone: '0988.111.222', email: 'gioitre.chuhai@gmail.com' } },
  { id: 'gx-vung-tau', name: 'Giáo xứ Vũng Tàu', contact: { name: 'Sơ Maria Têrêsa', phone: '0909.333.444', email: 'vungtau.youth@gmail.com' } },
];

// Dữ liệu nội bộ từ Ban Tổ Chức cho từng sự kiện
const EVENT_DETAILS: Record<string, any> = {
  'dai-hoi-2026': {
    orgId: 'gp-baria',
    name: 'Đại hội Giới trẻ Giáo phận 22/11/2026',
    time: '07:00 Sáng Chúa Nhật, 22/11/2026',
    location: 'Nhà thờ Chánh Tòa Bà Rịa',
    notes: 'Vui lòng mặc áo đồng phục Giới trẻ Giáo phận, mang theo bình nước cá nhân và tự túc phương tiện di chuyển. Vui lòng có mặt đúng giờ để check-in nhận Thẻ tham dự.'
  },
  'khoa-dao-tao-hd': {
    orgId: 'gp-baria',
    name: 'Khóa huấn luyện Hướng đạo sinh - Đợt 1',
    time: 'Từ Thứ 6 (15/10) đến Chủ Nhật (17/10/2026)',
    location: 'Trung tâm Hành hương Đức Mẹ Bãi Dâu',
    notes: 'Mang theo đồ dùng cá nhân, túi ngủ, lều cá nhân (nếu có) và thuốc men cơ bản. Không được tự ý rời khỏi khu vực cắm trại trong suốt thời gian huấn luyện.'
  },
  'tinh-tam-sv': {
    orgId: 'gx-vung-tau',
    name: 'Khóa Tĩnh tâm Sinh viên Mùa Vọng',
    time: '08:00 Sáng Thứ Bảy, 05/12/2026',
    location: 'Dòng Đồng Công (Cơ sở 2)',
    notes: 'Mang theo Kinh thánh, vở ghi chép. Yêu cầu giữ im lặng tuyệt đối trong các khung giờ cầu nguyện cá nhân.'
  },
  'mua-he-xanh': {
    orgId: 'gx-chut-hai',
    name: 'Chiến dịch Mùa Hè Xanh & Caritas',
    time: '01/07/2026 - 15/07/2026',
    location: 'Giáo điểm vùng sâu - Hạt Xuyên Mộc',
    notes: 'Sẽ có xe đưa rước tập trung tại Tòa Giám Mục. Yêu cầu sức khỏe tốt, chuẩn bị tinh thần phục vụ và làm việc nhóm cao độ.'
  }
};

export default function EventRegistrationForm() {
  const [formData, setFormData] = useState({
    orgId: 'gp-baria', // Mặc định là Giới trẻ Giáo phận
    eventId: '',
    fullName: '',
    phone: '',
    email: '',
    parish: '',
    address: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Nếu đổi đơn vị tổ chức, reset sự kiện đã chọn
    if (name === 'orgId') {
      setFormData(prev => ({ ...prev, orgId: value, eventId: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.eventId || !formData.fullName || !formData.phone || !formData.parish) {
      alert("Vui lòng điền đầy đủ các thông tin bắt buộc (*)");
      return;
    }
    alert("Chúc mừng bạn đã nộp biểu mẫu thành công!");
    window.location.href = '/';
  };

  const currentEvent = formData.eventId ? EVENT_DETAILS[formData.eventId] : null;
  const currentOrganizer = ORGANIZERS.find(org => org.id === formData.orgId);
  const availableEvents = Object.entries(EVENT_DETAILS).filter(([_, details]) => details.orgId === formData.orgId);

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
                      {ORGANIZERS.map(org => (
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
                    >
                      <option value="">-- Chọn sự kiện / khóa học --</option>
                      {availableEvents.map(([id, details]) => (
                        <option key={id} value={id}>{details.name}</option>
                      ))}
                    </select>
                    {availableEvents.length === 0 && (
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-brand-red)', marginTop: '8px', fontStyle: 'italic' }}>Đơn vị này hiện chưa có sự kiện nào mở đăng ký.</p>
                    )}
                  </div>

                  {/* 3. Hiển thị thông tin người phụ trách ngay khi chọn sự kiện xong */}
                  {currentEvent && currentOrganizer && (
                    <div className="fade-in" style={{ marginTop: '20px', padding: '15px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#166534', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <span>ℹ️</span> Thông tin liên hệ (Ban Tổ Chức):
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem', color: '#15803d' }}>
                        <div><strong>Người phụ trách:</strong> <br/>{currentOrganizer.contact.name}</div>
                        <div><strong>SĐT/Zalo:</strong> <br/>{currentOrganizer.contact.phone}</div>
                        <div><strong>Email:</strong> <br/>{currentOrganizer.contact.email}</div>
                        <div><strong>Địa chỉ:</strong> <br/>{currentEvent.location}</div>
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
                  <button type="submit" style={{ background: 'var(--color-brand-red)', color: 'white', border: 'none', padding: '15px 30px', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '8px', cursor: 'pointer', width: '100%', boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)', transition: 'all 0.3s' }}>
                    GỬI BIỂU MẪU & ĐĂNG KÝ
                  </button>
                </div>
              </form>

        </div>

        {/* CỘT PHẢI (35%): Tin tức liên quan + Hotline Giáo phận */}
        <div style={{ flex: '1 1 30%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {/* Phần Trên: Tin tức */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
             <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '15px' }}>
              <h2 className="section-title" style={{ fontSize: '1.1rem', color: 'var(--color-text-main)' }}>THÔNG TIN CÁC SỰ KIỆN</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {[
                { title: 'Thông báo về Đại hội Giới trẻ Giáo phận 22/11/2026', img: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=150' },
                { title: 'Chương trình huấn luyện Hướng đạo sinh đợt 1', img: 'https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=150' },
                { title: 'Mùa Hè Xanh: Chung tay vì cộng đồng vùng sâu', img: 'https://images.unsplash.com/photo-1529070538774-1843cb1665e8?q=80&w=150' },
              ].map((item, idx) => (
                <a key={idx} href="#" style={{ display: 'flex', gap: '12px', alignItems: 'center', textDecoration: 'none' }}>
                  <img src={item.img} style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '6px' }} alt="Thumb" />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', color: 'var(--color-text-heading)', lineHeight: '1.4', fontWeight: 600 }}>{item.title}</h4>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-brand-cyan)', fontWeight: 'bold' }}>Tìm hiểu thêm &raquo;</span>
                  </div>
                </a>
              ))}
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
