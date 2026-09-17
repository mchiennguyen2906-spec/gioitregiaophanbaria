import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { addArticle, updateArticle, getArticlesFromStore, Article } from '../../../utils/store';

export default function CourseEditor({ onSave, onPublish, articleToEdit }: { onSave: () => void, onPublish: () => void, articleToEdit?: Article }) {
  const [hasArticle, setHasArticle] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [linkedArticleId, setLinkedArticleId] = useState('');
  
  const [courseName, setCourseName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [location, setLocation] = useState('');
  const [lessonCount, setLessonCount] = useState('');
  const [certType, setCertType] = useState('Cấp Chứng Chỉ (Có phôi chuẩn)');
  const [isSaving, setIsSaving] = useState(false);

  const [lessons, setLessons] = useState([{ id: 1, title: '', trainer: '', time: '' }]);
  const [customFields, setCustomFields] = useState([{ id: 1, label: 'Giáo xứ', type: 'text' }]);

  useEffect(() => {
    const fetchArticles = async () => {
      const all = await getArticlesFromStore();
      setArticles(all.filter(a => a.categoryId !== 'lich-hoc' && a.categoryId !== 'bieu-mau'));
    };
    fetchArticles();
  }, []);

  useEffect(() => {
    if (articleToEdit) {
      setCourseName(articleToEdit.title || '');
      if (articleToEdit.metadata) {
        setLinkedArticleId(articleToEdit.metadata.linkedArticleId || '');
        setHasArticle(!!articleToEdit.metadata.linkedArticleId);
        setStartDate(articleToEdit.metadata.startDate || '');
        setEndDate(articleToEdit.metadata.endDate || '');
        setLocation(articleToEdit.metadata.location || '');
        setLessonCount(articleToEdit.metadata.lessonCount || '');
        setCertType(articleToEdit.metadata.certType || 'Cấp Chứng Chỉ (Có phôi chuẩn)');
        setLessons(articleToEdit.metadata.lessons || [{ id: 1, title: '', trainer: '', time: '' }]);
        setCustomFields(articleToEdit.metadata.customFields || [{ id: 1, label: 'Giáo xứ', type: 'text' }]);
      }
    }
  }, [articleToEdit]);

  const addLesson = () => setLessons([...lessons, { id: Date.now(), title: '', trainer: '', time: '' }]);
  const removeLesson = (id: number) => setLessons(lessons.filter(l => l.id !== id));
  
  const addCustomField = () => setCustomFields([...customFields, { id: Date.now(), label: 'Trường thông tin mới', type: 'text' }]);
  const removeCustomField = (id: number) => setCustomFields(customFields.filter(f => f.id !== id));

  const handlePublish = async () => {
    if (!courseName || !startDate || !location || !lessonCount) {
      toast.error('Vui lòng điền các trường bắt buộc (*)');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        title: courseName,
        categoryId: 'lich-hoc',
        author: 'Ban Đào Tạo',
        content: '',
        status: 'published' as const,
        metadata: {
          linkedArticleId,
          startDate,
          endDate,
          location,
          lessonCount,
          certType,
          lessons,
          customFields
        }
      };

      if (articleToEdit) {
        await updateArticle(articleToEdit.id, payload);
        toast.success('Cập nhật Khóa Học thành công!');
      } else {
        await addArticle(payload);
        toast.success('Đăng Khóa Học thành công!');
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
        <h2 style={{ color: 'var(--color-brand-red)', margin: 0 }}>Tạo Khóa Học Đào Tạo Mới</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onSave} disabled={isSaving} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Hủy bỏ / Quay lại</button>
          
          <button onClick={handlePublish} disabled={isSaving} style={{
            background: 'var(--color-brand-cyan)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>{isSaving ? 'Đang lưu...' : (articleToEdit ? 'Cập nhật Khóa Học' : 'Đăng Khóa Học')}</button>
        </div>
      </div>

      <div style={{ background: '#fef2f2', border: '1px solid #f87171', borderRadius: '8px', padding: '15px', marginBottom: '20px' }}>
        <h3 style={{ color: '#b91c1c', margin: '0 0 5px 0', fontSize: '1rem' }}>📌 Hướng dẫn tạo Khóa Học</h3>
        <ul style={{ color: '#7f1d1d', margin: 0, paddingLeft: '20px', fontSize: '0.9rem' }}>
          <li>Hãy đảm bảo bạn đã viết <strong>Bài Viết Chi Tiết</strong> giới thiệu về khóa học ở mục "Bài viết" trước khi vào đây tạo Form đăng ký.</li>
          <li>Nội dung lịch trình (các bài học) cần rõ ràng ngày giờ, người phụ trách để học viên tiện theo dõi.</li>
          <li>Cân nhắc các trường thông tin đăng ký: Chỉ thu thập các dữ liệu thật sự phục vụ cho công tác điểm danh và cấp chứng chỉ.</li>
        </ul>
      </div>

      <div style={{ background: '#eff6ff', padding: '20px', borderRadius: '8px', border: '1px solid #bfdbfe', marginBottom: '20px' }}>
        <h4 style={{ color: '#1e3a8a', marginTop: 0 }}>Bước 1: Liên kết bài viết gốc (Tùy chọn)</h4>
        <p style={{ fontSize: '0.9rem', color: '#3b82f6' }}>Khóa học có thể liên kết với một bài viết chi tiết để học viên đọc trước khi đăng ký.</p>
        
        <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
          <select 
            style={inputStyle} 
            value={linkedArticleId}
            onChange={e => {
              setLinkedArticleId(e.target.value);
              setHasArticle(e.target.value !== "");
            }}
          >
            <option value="">-- Có thể chọn bài viết liên kết --</option>
            {articles.map(a => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
        <h4 style={{ marginTop: 0, borderBottom: '1px solid #cbd5e1', paddingBottom: '10px', color: '#1e293b' }}>Bước 2: Cài Đặt Khóa Học</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '20px' }}>
          <div>
            <label style={labelStyle}>Tên Khóa Học *</label>
            <input style={inputStyle} type="text" placeholder="Ví dụ: Khóa Huynh trưởng cấp 1..." value={courseName} onChange={e => setCourseName(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Thời gian khai giảng *</label>
              <input style={inputStyle} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Thời gian bế giảng</label>
              <input style={inputStyle} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
          </div>

          <div>
            <label style={labelStyle}>Địa điểm đào tạo *</label>
            <input style={inputStyle} type="text" placeholder="Ví dụ: Trung tâm hành hương Bãi Dâu..." value={location} onChange={e => setLocation(e.target.value)} />
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Số buổi học *</label>
              <input style={inputStyle} type="number" placeholder="Ví dụ: 8" value={lessonCount} onChange={e => setLessonCount(e.target.value)} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Loại chứng nhận sau khóa học *</label>
              <select style={inputStyle} value={certType} onChange={e => setCertType(e.target.value)}>
                <option value="Cấp Chứng Chỉ (Có phôi chuẩn)">Cấp Chứng Chỉ (Có phôi chuẩn)</option>
                <option value="Cấp Giấy Xác Nhận">Cấp Giấy Xác Nhận</option>
                <option value="Không Cấp">Không Cấp</option>
              </select>
            </div>
          </div>

          {/* Lịch trình các bài học */}
          <div style={{ marginTop: '10px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <label style={{ ...labelStyle, fontSize: '1rem', color: 'var(--color-brand-cyan)' }}>Lịch trình / Các bài đào tạo</label>
            
            {lessons.map((lesson, index) => (
              <div key={lesson.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px', background: 'white', padding: '10px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <span style={{ fontWeight: 'bold', color: '#64748b' }}>#{index + 1}</span>
                <input style={{ ...inputStyle, flex: 2 }} type="text" placeholder="Tên bài học..." value={lesson.title} onChange={e => {
                  const newLessons = [...lessons];
                  newLessons[index].title = e.target.value;
                  setLessons(newLessons);
                }} />
                <input style={{ ...inputStyle, flex: 1.5 }} type="text" placeholder="Giảng viên / Người đào tạo..." value={lesson.trainer} onChange={e => {
                  const newLessons = [...lessons];
                  newLessons[index].trainer = e.target.value;
                  setLessons(newLessons);
                }} />
                <input style={{ ...inputStyle, flex: 1 }} type="datetime-local" title="Ngày giờ đào tạo" value={lesson.time} onChange={e => {
                  const newLessons = [...lessons];
                  newLessons[index].time = e.target.value;
                  setLessons(newLessons);
                }} />
                <button onClick={() => removeLesson(lesson.id)} style={{ padding: '8px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
              </div>
            ))}
            <button onClick={addLesson} style={{ marginTop: '10px', padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Thêm Bài Học</button>
          </div>

          {/* Cấu hình form đăng ký */}
          <div style={{ marginTop: '10px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
            <label style={{ ...labelStyle, fontSize: '1rem', color: 'var(--color-brand-red)' }}>Cấu hình Form Thu Thập Thông Tin Học Viên</label>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: 0 }}>Mặc định đã có: Họ tên, Năm sinh, Số điện thoại. Bạn có thể thêm các trường tùy chỉnh bên dưới.</p>
            
            {customFields.map((field, index) => (
              <div key={field.id} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
                <input 
                  style={{ ...inputStyle, flex: 2 }} 
                  type="text" 
                  value={field.label} 
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].label = e.target.value;
                    setCustomFields(newFields);
                  }}
                />
                <select 
                  style={{ ...inputStyle, flex: 1 }}
                  value={field.type}
                  onChange={(e) => {
                    const newFields = [...customFields];
                    newFields[index].type = e.target.value;
                    setCustomFields(newFields);
                  }}
                >
                  <option value="text">Văn bản (Chữ ngắn)</option>
                  <option value="textarea">Đoạn văn (Chữ dài)</option>
                  <option value="select">Lựa chọn (Dropdown)</option>
                </select>
                <button onClick={() => removeCustomField(field.id)} style={{ padding: '10px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>X</button>
              </div>
            ))}
            <button onClick={addCustomField} style={{ marginTop: '10px', padding: '8px 15px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>+ Thêm Trường Tùy Chỉnh</button>
          </div>
          
        </div>
      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outlineColor: 'var(--color-brand-cyan)' };
