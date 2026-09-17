import React, { useState, useEffect } from 'react';
import { addQuestion } from '../utils/store';

export default function QuestionFormPopup({ onClose }: { onClose: () => void }) {
  const [senderName, setSenderName] = useState('');
  const [dob, setDob] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  
  const [recipient, setRecipient] = useState('Ban Tư vấn Tâm lý Giáo phận');
  const [questionText, setQuestionText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Khôi phục nháp
  useEffect(() => {
    const draft = localStorage.getItem('question_form_draft');
    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        if (parsed.senderName) setSenderName(parsed.senderName);
        if (parsed.dob) setDob(parsed.dob);
        if (parsed.phone) setPhone(parsed.phone);
        if (parsed.email) setEmail(parsed.email);
        if (parsed.recipient) setRecipient(parsed.recipient);
        if (parsed.questionText) setQuestionText(parsed.questionText);
        if (parsed.isAnonymous !== undefined) setIsAnonymous(parsed.isAnonymous);
      } catch (e) {}
    }
  }, []);

  // Lưu nháp khi có thay đổi
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('question_form_draft', JSON.stringify({
        senderName, dob, phone, email, recipient, questionText, isAnonymous
      }));
    }, 1000);
    return () => clearTimeout(timer);
  }, [senderName, dob, phone, email, recipient, questionText, isAnonymous]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName || !dob || !phone || !questionText || !recipient) {
      alert('Vui lòng điền đủ các trường có dấu (*)');
      return;
    }

    const phoneRegex = /^(0|\+84)[3|5|7|8|9][0-9]{8}$/;
    if (!phoneRegex.test(phone.replace(/\s/g, ''))) {
      alert("Số điện thoại không hợp lệ. Vui lòng nhập đúng định dạng Việt Nam.");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      alert("Email không hợp lệ. Vui lòng kiểm tra lại.");
      return;
    }

    setIsSubmitting(true);

    const formattedContent = `
[THÔNG TIN NGƯỜI GỬI]
- Họ tên: ${senderName}
- Ngày sinh: ${new Date(dob).toLocaleDateString('vi-VN')}
- Điện thoại: ${phone}
- Email: ${email || 'Không có'}
- Lựa chọn: ${isAnonymous ? 'Muốn ẨN DANH (Chỉ chia sẻ nội bộ)' : 'Đồng ý CÔNG KHAI câu chuyện'}

[NỘI DUNG CÂU HỎI]
${questionText}
    `.trim();

    try {
      await addQuestion({
        senderName: isAnonymous ? 'Ẩn danh' : senderName,
        senderContact: email || phone,
        recipient,
        questionText: formattedContent
      });
      alert('Gửi thông tin thành công! Cám ơn bạn đã tin tưởng chia sẻ. Ban tư vấn sẽ sớm liên hệ lại với bạn.');
      localStorage.removeItem('question_form_draft');
      onClose();
    } catch (err) {
      alert('Có lỗi xảy ra, vui lòng thử lại sau.');
      setIsSubmitting(false);
    }
  };

  const inputStyle = { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' };
  const labelStyle = { display: 'block', marginBottom: '6px', fontWeight: 'bold', color: '#334155', fontSize: '0.95rem' };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(15, 23, 42, 0.75)', zIndex: 1000,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', width: '100%', maxWidth: '650px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.3)', display: 'flex', flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Header */}
        <div style={{ background: 'var(--color-brand-cyan)', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderRadius: '16px 16px 0 0' }}>
          <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: 800 }}>💬 Gửi Câu Hỏi / Tâm Sự</h3>
          <button type="button" aria-label="Đóng popup" onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'white', fontSize: '1.8rem', cursor: 'pointer', lineHeight: 1 }}>×</button>
        </div>

        {/* Body (Scrollable) */}
        <div style={{ padding: '25px', overflowY: 'auto' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px' }}>
                <label style={labelStyle}>Họ và tên *</label>
                <input type="text" value={senderName} onChange={e => setSenderName(e.target.value)} placeholder="Nhập họ tên của bạn" style={inputStyle} required />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Ngày tháng năm sinh *</label>
                <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 250px' }}>
                <label style={labelStyle}>Số điện thoại liên hệ *</label>
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="09xx..." style={inputStyle} required />
              </div>
              <div style={{ flex: '1 1 200px' }}>
                <label style={labelStyle}>Email (Nếu có)</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="example@gmail.com" style={inputStyle} />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Bạn muốn gửi tâm sự này đến ai? *</label>
              <select value={recipient} onChange={e => setRecipient(e.target.value)} style={inputStyle} required>
                <option value="Ban Tư vấn Tâm lý Giáo phận">Ban Tư vấn Tâm lý Giáo phận</option>
                <option value="Cha Giám đốc Trung tâm Mục vụ">Cha Giám đốc Trung tâm Mục vụ</option>
                <option value="Các Cha sở / Giáo xứ">Các Cha sở / Giáo xứ</option>
              </select>
            </div>

            <div>
              <label style={labelStyle}>Nội dung câu hỏi / Trải lòng *</label>
              <textarea 
                value={questionText} 
                onChange={e => setQuestionText(e.target.value)}
                placeholder="Đừng ngại chia sẻ những khúc mắc bạn đang gặp phải. Chúng tôi luôn ở đây lắng nghe..."
                style={{ ...inputStyle, minHeight: '140px', resize: 'vertical' }}
                required
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <label style={{...labelStyle, color: 'var(--color-brand-cyan)'}}>Tùy chọn bảo mật thông tin</label>
              
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '10px' }}>
                <input type="radio" checked={!isAnonymous} onChange={() => setIsAnonymous(false)} style={{ marginTop: '3px' }} />
                <span style={{ fontSize: '0.95rem', color: '#334155' }}>
                  <strong>Tôi đồng ý chia sẻ công khai câu hỏi này.</strong> (Thông tin của bạn sẽ được ẩn danh một phần trên các bài viết giải đáp để giúp đỡ những bạn trẻ khác có cùng hoàn cảnh).
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input type="radio" checked={isAnonymous} onChange={() => setIsAnonymous(true)} style={{ marginTop: '3px' }} />
                <span style={{ fontSize: '0.95rem', color: '#334155' }}>
                  <strong>Tôi muốn hoàn toàn ẩn danh.</strong> (Mọi thông tin của bạn chỉ được Ban tư vấn và Cha phụ trách nhìn thấy, tuyệt đối không đăng tải công khai dưới bất kỳ hình thức nào).
                </span>
              </label>
            </div>

            {/* Privacy Guarantee Message */}
            <div style={{ fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', textAlign: 'justify', lineHeight: 1.6, borderLeft: '3px solid var(--color-brand-red)', paddingLeft: '15px' }}>
              "Giáo phận cam kết bảo mật mọi thông tin cá nhân của bạn một cách tuyệt đối. Chúng tôi thấu hiểu những lo lắng của bạn. 
              Hãy an tâm trải lòng, mọi chia sẻ đều được tiếp nhận với sự đồng cảm và trân trọng nhất."
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '10px' }}>
              <button type="button" onClick={onClose} style={{ padding: '12px 25px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
                Hủy
              </button>
              <button type="submit" disabled={isSubmitting} style={{ padding: '12px 30px', background: 'var(--color-brand-cyan)', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', fontSize: '1.05rem', boxShadow: '0 4px 10px rgba(6,182,212,0.3)' }}>
                {isSubmitting ? 'Đang gửi...' : 'Gửi Thông Tin ➔'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
