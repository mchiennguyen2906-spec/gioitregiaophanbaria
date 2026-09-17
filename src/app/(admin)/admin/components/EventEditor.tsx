import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addArticle, updateArticle, getArticlesFromStore, Article } from '../../../utils/store';

export default function EventEditor({ onSave, onPublish, articleToEdit }: { onSave: () => void, onPublish: () => void, articleToEdit?: Article }) {
  const [hasArticle, setHasArticle] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [linkedArticleId, setLinkedArticleId] = useState('');
  
  // Form fields
  const [eventName, setEventName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [organizerNotes, setOrganizerNotes] = useState('');
  const [eventType, setEventType] = useState<'su-kien' | 'lich-hoc'>('su-kien');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      const all = await getArticlesFromStore();
      // Lấy các bài viết thông thường (không phải form/sự kiện) để làm bài liên kết
      setArticles(all.filter(a => a.categoryId !== 'su-kien' && a.categoryId !== 'bieu-mau'));
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (articleToEdit) {
      setHasArticle(true);
      setEventName(articleToEdit.title || '');
      if (articleToEdit.metadata) {
        setLinkedArticleId(articleToEdit.metadata.linkedArticleId || '');
        setOrganizer(articleToEdit.metadata.organizer || '');
        setContactName(articleToEdit.metadata.contactName || '');
        setPhone(articleToEdit.metadata.phone || '');
        setEmail(articleToEdit.metadata.email || '');
        setOrganizerNotes(articleToEdit.metadata.organizerNotes || '');
        setEventType((articleToEdit.categoryId as 'su-kien' | 'lich-hoc') || 'su-kien');
      }
    }
  }, [articleToEdit]);

  const handlePublish = async () => {
    if (!linkedArticleId || !eventName || !organizer || !contactName || !phone) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc (*)');
      return;
    }
    
    setIsSaving(true);
    try {
      const payload = {
        title: eventName,
        categoryId: eventType,
        author: organizer,
        content: '',
        status: 'published' as const,
        metadata: {
          linkedArticleId,
          organizer,
          contactName,
          phone,
          email,
          organizerNotes
        }
      };

      if (articleToEdit) {
        await updateArticle(articleToEdit.id, payload);
        toast.success('Cập nhật Form Sự Kiện thành công!');
      } else {
        await addArticle(payload);
        toast.success('Đăng Form Sự Kiện thành công!');
      }
      onPublish();
    } catch (err: any) {
      toast.error('Lỗi khi lưu: ' + err.message);
    }
    setIsSaving(false);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-red)', margin: 0 }}>Tạo Sự Kiện Mới</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} disabled={isSaving} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Hủy bỏ / Quay lại</button>
          
          <button onClick={handlePublish} disabled={isSaving} style={{
            background: 'var(--color-brand-cyan)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>{isSaving ? 'Đang lưu...' : (articleToEdit ? 'Cập nhật Mẫu Đăng Ký' : 'Xác Nhận Đăng Mẫu Đăng Ký')}</button>
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
            <select 
              style={inputStyle} 
              value={linkedArticleId}
              onChange={e => {
                setLinkedArticleId(e.target.value);
                setHasArticle(e.target.value !== "");
              }}
            >
              <option value="">-- Chọn bài viết --</option>
              {articles.map(a => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {hasArticle && (
        <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
          <h4 style={{ marginTop: 0, borderBottom: '1px solid #cbd5e1', paddingBottom: '10px' }}>Bước 2: Cài đặt Form Đăng ký</h4>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
            <div>
              <label style={labelStyle}>Tên Sự Kiện hiển thị trên Form *</label>
              <input style={inputStyle} type="text" placeholder="Ví dụ: Đại hội Giới trẻ Hạt Bà Rịa..." value={eventName} onChange={e => setEventName(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Đơn vị Tổ chức (Giáo xứ / Ban ngành) *</label>
                <input style={inputStyle} type="text" placeholder="Nhập tên giáo xứ..." value={organizer} onChange={e => setOrganizer(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Người phụ trách (Để học viên liên hệ) *</label>
              <input style={inputStyle} type="text" placeholder="Họ và tên người phụ trách..." value={contactName} onChange={e => setContactName(e.target.value)} />
            </div>
            
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Số điện thoại (Zalo) *</label>
                <input style={inputStyle} type="text" placeholder="SĐT liên hệ..." value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Email nhận thông báo (Không bắt buộc)</label>
                <input style={inputStyle} type="email" placeholder="Ví dụ: gioitrebvt@gmail.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Lưu ý của Ban tổ chức (Dặn dò học viên/người tham gia)</label>
              <textarea 
                style={{...inputStyle, minHeight: '80px', resize: 'vertical'}} 
                placeholder="Ví dụ: Các bạn nhớ mang theo áo đồng phục, có mặt lúc 7h00 sáng..." 
                value={organizerNotes} 
                onChange={e => setOrganizerNotes(e.target.value)} 
              />
            </div>

            {/* CHỌN LOẠI ĐĂNG KÝ */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#1e293b' }}>
                Loại Form Đăng Ký <span style={{ color: 'red' }}>*</span>
              </label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value as 'su-kien' | 'lich-hoc')}
                style={{
                  width: '100%', padding: '12px', border: '1px solid #cbd5e1',
                  borderRadius: '6px', outline: 'none', background: '#f8fafc'
                }}
              >
                <option value="su-kien">Sự kiện</option>
                <option value="lich-hoc">Khóa học</option>
              </select>
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
