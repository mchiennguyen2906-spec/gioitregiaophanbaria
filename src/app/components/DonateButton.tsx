"use client";
import { useState, useEffect } from 'react';
import { getDonationsFromStore, DonationProgram } from '../utils/store';
import { slugMap } from '../utils/categoryMap';

export default function DonateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [donations, setDonations] = useState<DonationProgram[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loadDonations = async () => {
        const allDonations = await getDonationsFromStore();
        const activeDonations = allDonations
          .filter(d => !d.isCompleted)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDonations(activeDonations.slice(0, 5));
      };
      loadDonations();
      window.addEventListener('donation_update', loadDonations);
      return () => window.removeEventListener('donation_update', loadDonations);
    }
  }, [isOpen]);

  const filteredDonations = donations.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <>
      {/* Nút hiển thị trên thanh Nav */}
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          background: 'var(--color-brand-red)',
          color: 'white',
          border: 'none',
          padding: '8px 15px',
          fontWeight: 700,
          textTransform: 'uppercase',
          fontSize: '0.8rem',
          letterSpacing: '0.5px',
          cursor: 'pointer',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(153, 27, 27, 0.3)'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={e => e.currentTarget.style.transform = 'translateY(0)'}
      >
        QUYÊN GÓP
      </button>

      {/* Modal Popup Xổ ra khi bấm */}
      {isOpen && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(5px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.3s ease-out'
        }}>
          
          <div style={{
            background: 'white',
            width: '100%',
            maxWidth: '650px',
            borderRadius: '12px',
            overflow: 'hidden',
            position: 'relative',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
          }}>
            {/* Nút Đóng (X) */}
            <button 
              onClick={() => setIsOpen(false)}
              style={{
                position: 'absolute', top: '15px', right: '15px',
                background: 'rgba(0,0,0,0.1)', border: 'none',
                width: '32px', height: '32px', borderRadius: '50%',
                cursor: 'pointer', fontSize: '1.2rem',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = 'rgba(0,0,0,0.2)'}
              onMouseOut={e => e.currentTarget.style.background = 'rgba(0,0,0,0.1)'}
            >
              ✕
            </button>

            {/* Tiêu đề Modal */}
            <div style={{padding: '30px', borderBottom: '1px solid var(--border-color)', background: '#f8fafc'}}>
              <h2 style={{margin: 0, fontSize: '1.5rem', color: 'var(--color-brand-cyan)'}}>❤️ Các Chương Trình Cần Sự Chung Tay</h2>
              <p style={{margin: '5px 0 0 0', color: '#64748b', fontSize: '0.95rem'}}>
                "Phúc thay ai xót thương người, vì họ sẽ được Thiên Chúa xót thương." (Mt 5,7)
              </p>
            </div>

            {/* Danh sách các chiến dịch */}
            <div style={{padding: '30px', maxHeight: '60vh', overflowY: 'auto'}}>
              
              <input 
                type="text" 
                placeholder="🔍 Nhập tên chương trình để tìm kiếm..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '12px 15px', borderRadius: '8px', border: '1px solid #cbd5e1', marginBottom: '25px', fontSize: '0.95rem' }}
              />

              {filteredDonations.length > 0 ? filteredDonations.map((donation, index) => {
                const percentage = Math.min(100, Math.round((donation.raisedAmount / donation.targetAmount) * 100));
                const isExpanded = expandedId === donation.id;

                return (
                  <div key={donation.id} style={{marginBottom: '30px', paddingBottom: '30px', borderBottom: '1px dashed #e2e8f0'}}>
                    <div style={{display: 'flex', gap: '20px'}}>
                      <div style={{flex: 1}}>
                        <h4 style={{margin: '0 0 8px 0', fontSize: '1.1rem', color: 'var(--color-text-heading)'}}>{index + 1}. {donation.name}</h4>
                        <p style={{margin: '0 0 15px 0', fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, whiteSpace: 'pre-wrap'}}>{donation.description}</p>
                        
                        <div style={{background: '#f1f5f9', height: '6px', borderRadius: '3px', marginBottom: '10px', overflow: 'hidden'}}>
                          <div style={{background: 'var(--color-brand-red)', width: `${percentage}%`, height: '100%', transition: 'width 0.5s ease'}}></div>
                        </div>
                        
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px'}}>
                          <span style={{fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-brand-red)'}}>
                            Đã quyên góp: {percentage}% ({donation.raisedAmount.toLocaleString('vi-VN')}đ / {donation.targetAmount.toLocaleString('vi-VN')}đ)
                          </span>
                          
                          <div style={{ display: 'flex', gap: '10px' }}>
                            {donation.linkedArticleId && (
                              <a 
                                href={`/thien-nguyen/${donation.linkedArticleId}`} 
                                style={{ color: '#3b82f6', fontSize: '0.85rem', textDecoration: 'none', padding: '6px 10px', border: '1px solid #bfdbfe', borderRadius: '4px', background: '#eff6ff' }}
                              >
                                Xem chi tiết bài viết ➔
                              </a>
                            )}
                            <button 
                              onClick={() => setExpandedId(isExpanded ? null : donation.id)}
                              style={{background: isExpanded ? '#475569' : 'var(--color-brand-cyan)', color: 'white', border: 'none', padding: '6px 15px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold'}}
                            >
                              {isExpanded ? 'Đóng Lại' : 'Đóng Góp Ngay ➔'}
                            </button>
                          </div>
                        </div>

                        {/* Inline Expand for QR & Bank Info */}
                        {isExpanded && (
                          <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', gap: '20px', animation: 'fadeIn 0.3s ease-out' }}>
                            {donation.qrCodeUrl && (
                              <div style={{ textAlign: 'center' }}>
                                <img src={donation.qrCodeUrl} alt="QR Code" style={{ width: '120px', height: '120px', borderRadius: '8px', objectFit: 'cover', border: '1px solid #cbd5e1' }} />
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '5px' }}>Quét mã QR</p>
                              </div>
                            )}
                            <div style={{ flex: 1 }}>
                              <h5 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#334155' }}>Thông tin chuyển khoản:</h5>
                              <p style={{ margin: 0, fontSize: '0.9rem', color: '#0f172a', whiteSpace: 'pre-wrap', lineHeight: 1.6, fontWeight: 500 }}>
                                {donation.bankInfo || 'Chưa cập nhật thông tin ngân hàng.'}
                              </p>
                              <p style={{ margin: '15px 0 0 0', fontSize: '0.85rem', color: 'var(--color-brand-red)', fontStyle: 'italic' }}>
                                Lời nguyện xin Chúa chúc lành cho tấm lòng vàng của quý vị. Xin chân thành cảm ơn!
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              }) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  Hiện tại không có chương trình quyên góp nào đang chạy.
                </div>
              )}
            </div>
          </div>
          
          <style dangerouslySetInnerHTML={{__html: `
            @keyframes slideUp {
              from { opacity: 0; transform: translateY(40px) scale(0.95); }
              to { opacity: 1; transform: translateY(0) scale(1); }
            }
            @keyframes fadeIn {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}} />
        </div>
      )}
    </>
  );
}
