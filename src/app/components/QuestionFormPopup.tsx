import React, { useState } from 'react';
import { addQuestion } from '../utils/store';

export default function QuestionFormPopup({ onClose }: { onClose: () => void }) {
  const [senderName, setSenderName] = useState('');
  const [senderContact, setSenderContact] = useState('');
  const [recipient, setRecipient] = useState('');
  const [questionText, setQuestionText] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !questionText || !recipient) {
      alert('Vui lòng điền đủ Tên, Nơi gửi và Nội dung câu hỏi!');
      return;
    }
    addQuestion({
      senderName,
      senderContact,
      recipient,
      questionText
    });
    alert('Gửi câu hỏi thành công! Xin cám ơn bạn.');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.7)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', overflow: 'hidden'
      }}>
        <div style={{ background: 'var(--color-brand-cyan)', color: 'white', padding: '15px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '1.2rem' }}>Gửi Câu Hỏi / Tâm Lý</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>Tên của bạn (hoặc Ẩn danh) *</label>
            <input 
              type="text" 
              value={senderName} 
              onChange={e => setSenderName(e.target.value)}
              placeholder="VD: Nguyễn Văn A, hoặc Ẩn danh"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>Thông tin liên hệ (Email / SĐT)</label>
            <input 
              type="text" 
              value={senderContact} 
              onChange={e => setSenderContact(e.target.value)}
              placeholder="Để lại liên hệ nếu muốn được phản hồi riêng (Không bắt buộc)"
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>Gửi đến ai? *</label>
            <select 
              value={recipient} 
              onChange={e => setRecipient(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
            >
              <option value="">-- Chọn Người/Nơi Nhận --</option>
              <option value="Ban Tư vấn Tâm lý Giáo phận">Ban Tư vấn Tâm lý Giáo phận</option>
              <option value="Cha Giám đốc Trung tâm Mục vụ">Cha Giám đốc Trung tâm Mục vụ</option>
              <option value="Các Cha sở / Giáo xứ">Các Cha sở / Giáo xứ</option>
              <option value="Khác">Khác...</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#334155', fontSize: '0.9rem' }}>Nội dung câu hỏi *</label>
            <textarea 
              value={questionText} 
              onChange={e => setQuestionText(e.target.value)}
              placeholder="Hãy trình bày chi tiết vấn đề của bạn..."
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', minHeight: '100px', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <button type="button" onClick={onClose} style={{ padding: '10px 20px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Hủy
            </button>
            <button type="submit" style={{ padding: '10px 20px', background: 'var(--color-brand-red)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
              Gửi Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
