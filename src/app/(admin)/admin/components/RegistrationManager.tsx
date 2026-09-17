import React, { useState, useEffect } from 'react';
import { getRegistrations, EventRegistration, Article } from '../../../utils/store';

export default function RegistrationManager({ articles }: { articles: Article[] }) {
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [expandedRegId, setExpandedRegId] = useState<string | null>(null);

  useEffect(() => {
    const loadRegs = async () => {
      const data = await getRegistrations();
      setRegistrations(data);
    };
    loadRegs();
  }, []);

  const handleEventClick = (eventId: string) => {
    if (selectedEventId === eventId) {
      setSelectedEventId(null);
      setExpandedRegId(null);
    } else {
      setSelectedEventId(eventId);
      setExpandedRegId(null);
    }
  };

  const handleRegClick = (regId: string) => {
    if (expandedRegId === regId) {
      setExpandedRegId(null);
    } else {
      setExpandedRegId(regId);
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      {selectedEventId === null ? (
        // Danh sách Sự kiện / Khóa học
        <div>
          <h3 style={{ color: '#1e293b', marginBottom: '15px' }}>Chọn chương trình để xem danh sách đăng ký</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '15px' }}>
            {articles.map(article => {
              const regCount = registrations.filter(r => r.event_id === article.id).length;
              return (
                <div 
                  key={article.id} 
                  onClick={() => handleEventClick(article.id)}
                  style={{ 
                    background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', 
                    cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', transition: 'all 0.2s',
                    display: 'flex', flexDirection: 'column', gap: '10px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  <h4 style={{ margin: 0, color: 'var(--color-brand-cyan)', fontSize: '1.1rem' }}>{article.title}</h4>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748b', fontSize: '0.9rem' }}>{article.author}</span>
                    <span style={{ 
                      background: '#f1f5f9', color: '#334155', padding: '4px 10px', 
                      borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' 
                    }}>
                      {regCount} lượt đăng ký
                    </span>
                  </div>
                </div>
              );
            })}
            {articles.length === 0 && (
              <p style={{ color: '#64748b', gridColumn: '1 / -1' }}>Chưa có Sự kiện / Khóa học nào.</p>
            )}
          </div>
        </div>
      ) : (
        // Danh sách học viên của sự kiện được chọn
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <div>
              <button 
                onClick={() => setSelectedEventId(null)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', padding: 0, marginBottom: '10px' }}
              >
                ← Quay lại danh sách
              </button>
              <h3 style={{ color: 'var(--color-brand-cyan)', margin: 0, fontSize: '1.3rem' }}>
                Danh sách học viên: {articles.find(a => a.id === selectedEventId)?.title}
              </h3>
            </div>
            <div style={{ background: '#f1f5f9', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold', color: '#334155' }}>
              Tổng: {registrations.filter(r => r.event_id === selectedEventId).length}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {registrations.filter(r => r.event_id === selectedEventId).map((reg, index) => (
              <div 
                key={reg.id} 
                style={{ 
                  border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden',
                  background: expandedRegId === reg.id ? '#f8fafc' : 'white'
                }}
              >
                <div 
                  onClick={() => handleRegClick(reg.id)}
                  style={{ 
                    padding: '15px', display: 'flex', alignItems: 'center', gap: '15px', 
                    cursor: 'pointer', fontWeight: 'bold', color: '#1e293b'
                  }}
                >
                  <span style={{ color: '#94a3b8', width: '30px', textAlign: 'center' }}>{index + 1}</span>
                  <span style={{ flex: 1, fontSize: '1.05rem' }}>{reg.full_name}</span>
                  <span style={{ color: '#64748b', fontSize: '0.8rem' }}>{expandedRegId === reg.id ? '▲ Thu gọn' : '▼ Chi tiết'}</span>
                </div>
                
                {expandedRegId === reg.id && (
                  <div style={{ padding: '0 15px 15px 60px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b' }}>Số điện thoại</p>
                      <p style={{ margin: 0, fontWeight: '500', color: '#0f172a' }}>{reg.phone}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b' }}>Email</p>
                      <p style={{ margin: 0, fontWeight: '500', color: '#0f172a' }}>{reg.email || 'Không có'}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b' }}>Giáo xứ</p>
                      <p style={{ margin: 0, fontWeight: '500', color: '#0f172a' }}>{reg.parish}</p>
                    </div>
                    <div>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b' }}>Địa chỉ</p>
                      <p style={{ margin: 0, fontWeight: '500', color: '#0f172a' }}>{reg.address || 'Không có'}</p>
                    </div>
                    <div style={{ gridColumn: '1 / -1', marginTop: '5px' }}>
                      <p style={{ margin: '0 0 5px 0', fontSize: '0.85rem', color: '#64748b' }}>Ngày đăng ký</p>
                      <p style={{ margin: 0, fontWeight: '500', color: '#0f172a' }}>{new Date(reg.created_at).toLocaleString('vi-VN')}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
            
            {registrations.filter(r => r.event_id === selectedEventId).length === 0 && (
              <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                Chưa có ai đăng ký chương trình này.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

