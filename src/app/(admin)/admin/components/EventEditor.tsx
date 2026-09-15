import React, { useState } from 'react';

export default function EventEditor({ onSave, onPublish }: { onSave: () => void, onPublish: () => void }) {
  const [hasArticle, setHasArticle] = useState(false);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-red)', margin: 0 }}>Tạo Sự Kiện Mới</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Lưu & Xem Trước Form</button>
          
          <button onClick={onPublish} style={{
            background: 'var(--color-brand-cyan)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>Xác Nhận Đăng Mẫu Đăng Ký</button>
        </div>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn tạo Sự Kiện</h3>
        <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
          <li>Hãy đảm bảo bạn đã viết <strong>Bài Viết Chi Tiết</strong> giới thiệu về sự kiện ở mục "Bài viết" trước khi vào đây tạo Form đăng ký.</li>
          <li>Chỉ yêu cầu những thông tin thực sự cần thiết (tránh hỏi quá nhiều dài dòng làm người dùng ngại đăng ký).</li>
          <li>Nên thiết lập thời hạn đóng đăng ký rõ ràng để dễ tổng hợp danh sách.</li>
        </ul>
      </div>

      <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '20px' }}>
        <h4 style={{ color: '#1e3a8a', marginTop: 0 }}>Bước 1: Liên kết bài viết gốc</h4>
        <p style={{ fontSize: '0.9rem', color: '#3b82f6' }}>Nguyên tắc: Sự kiện bắt buộc phải có một bài viết mô tả chi tiết nội dung trước khi tạo Form đăng ký.</p>
        
        <div style={{ marginTop: '15px' }}>
          <label style={{ ...labelStyle, color: '#1e3a8a' }}>Chọn bài viết đã đăng để liên kết *</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <select style={inputStyle} onChange={e => setHasArticle(e.target.value !== "")}>
              <option value="">-- Tìm kiếm & Chọn bài viết --</option>
              <option value="1">Thư mời Đại hội Giới trẻ Giáo tỉnh</option>
              <option value="2">Chương trình Tĩnh tâm Mùa Chay 2026</option>
              <option value="3">Ngày hội Thể thao Giới trẻ Giáo hạt</option>
            </select>
            <button style={{ padding: '0 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>

      {hasArticle && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h4 style={{ marginTop: 0, borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Bước 2: Cài đặt Form Đăng ký</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div>
              <label style={labelStyle}>Tên Sự Kiện hiển thị trên Form *</label>
              <input style={inputStyle} type="text" placeholder="Ví dụ: Đại hội Giới trẻ Hạt Bà Rịa..." />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Đơn vị Tổ chức (Giáo xứ / Ban ngành) *</label>
                <input style={inputStyle} type="text" placeholder="Nhập tên giáo xứ..." />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Người phụ trách (Để học viên liên hệ) *</label>
              <input style={inputStyle} type="text" placeholder="Họ và tên người phụ trách..." />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Số điện thoại (Zalo) *</label>
                <input style={inputStyle} type="text" placeholder="SĐT liên hệ..." />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Email (Tùy chọn)</label>
                <input style={inputStyle} type="email" placeholder="Email hỗ trợ..." />
              </div>
            </div>
            
            <div style={{ marginTop: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>
                💡 <b>Mẹo:</b> Các trường thông tin người đăng ký (Họ tên, Năm sinh, Giáo xứ...) sẽ tự động được hệ thống tạo sẵn theo chuẩn chung. Bạn chỉ cần cung cấp thông tin liên hệ của Ban Tổ Chức như trên.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)' };
