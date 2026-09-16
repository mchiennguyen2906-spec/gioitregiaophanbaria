"use client";
import { useState, useEffect, useRef } from 'react';
import { getParishesFromStore, Parish } from '../utils/store';

export default function ParishSchedule() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isOpen = isHovered || isPinned || search.trim().length > 0;

  const togglePin = () => {
    if (isPinned) {
      setIsPinned(false);
      setIsHovered(false); // Xóa trạng thái hover ảo trên điện thoại để có thể đóng ngay
    } else {
      setIsPinned(true);
    }
  };

  useEffect(() => {
    setMounted(true);
    const load = async () => {
      const data = await getParishesFromStore();
      setParishes(data);
    };
    load();
    window.addEventListener('storage_update', load);
    return () => window.removeEventListener('storage_update', load);
  }, []);

  const filtered = parishes.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  useEffect(() => {
    if (filtered.length <= 1 || !isOpen) return;
    
    // Ngừng tự động cuộn nếu user đang rê chuột vào (để họ dễ đọc)
    if (isHovered) return;

    const timer = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 280;
          scrollRef.current.scrollBy({ left: cardWidth + 15, behavior: 'smooth' });
        }
      }
    }, 2000);
    return () => clearInterval(timer);
  }, [filtered.length, isOpen, isHovered]);

  const handlePrev = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 280;
      scrollRef.current.scrollBy({ left: -(cardWidth + 15), behavior: 'smooth' });
    }
  };
  
  const handleNext = () => {
    if (scrollRef.current) {
      const cardWidth = scrollRef.current.firstElementChild?.clientWidth || 280;
      scrollRef.current.scrollBy({ left: cardWidth + 15, behavior: 'smooth' });
    }
  };

  if (!mounted) return null;

  const daysOrder = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chúa Nhật"];
  const shortDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div 
        style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', transition: 'all 0.3s ease-in-out' }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div onClick={togglePin} style={{ cursor: 'pointer', flex: '1 1 250px', userSelect: 'none' }}>
            <h3 style={{ margin: 0, color: 'var(--color-brand-cyan)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1.15rem', flexWrap: 'wrap' }}>
              <span style={{ background: 'var(--color-brand-red)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>TỔNG HỢP</span>
              <span style={{ whiteSpace: 'nowrap' }}>Giờ Lễ Các Giáo Xứ</span>
              {isPinned && <span style={{ fontSize: '0.8rem', background: '#e2e8f0', color: '#475569', padding: '2px 6px', borderRadius: '4px', fontWeight: 'normal', whiteSpace: 'nowrap' }}>📌 Đã ghim</span>}
            </h3>
            {!isOpen && (
              <span style={{ fontStyle: 'italic', color: '#64748b', fontSize: '0.9rem', display: 'block', marginTop: '8px' }}>
                👉 Nhấp vào đây để ghim lịch
              </span>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: '1 1 200px' }}>
            <input 
              type="text" 
              placeholder="🔍 Tìm giáo xứ..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setIsPinned(true)}
              style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', width: '100%', fontSize: '0.95rem' }}
            />
            {isOpen && filtered.length > 2 && (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handlePrev} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>❮</button>
                <button onClick={handleNext} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>❯</button>
              </div>
            )}
          </div>
        </div>

        {isOpen && (
          <div 
            ref={scrollRef}
            style={{ 
              overflowX: 'auto', 
              display: 'flex', 
              gap: '15px', 
              marginTop: '15px', 
              paddingBottom: '10px', 
              scrollSnapType: 'x mandatory', 
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none' 
            }}
            className="hide-scrollbar"
          >
            <style jsx>{`
              .hide-scrollbar::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            
            {filtered.map((p) => (
              <div 
                key={p.id} 
                style={{ 
                  background: '#fff', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '8px', 
                  padding: '15px', 
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)', 
                  display: 'flex', 
                  flexDirection: 'column',
                  flex: '0 0 auto',
                  minWidth: '280px',
                  maxWidth: '300px',
                  scrollSnapAlign: 'start'
                }}
              >
                <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-main)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                  {p.name}
                </h4>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px', textAlign: 'center', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px' }}>
                  {daysOrder.map((day, idx) => {
                    const rawTimes = p.schedules[day] || [];
                    const times = rawTimes.flatMap(t => t.includes(',') ? t.split(',') : t.split(' ')).map(t => t.trim()).filter(t => t);
                    const isToday = new Date().getDay() === (idx === 6 ? 0 : idx + 1); 
                    
                    return (
                      <div key={day} style={{ display: 'flex', flexDirection: 'column', background: isToday ? '#f0f9ff' : 'transparent', borderRadius: '4px', padding: '4px 0' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: isToday ? '#0284c7' : '#64748b', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px', marginBottom: '4px' }}>
                          {shortDays[idx]}
                        </div>
                        {times.map((time, tIdx) => (
                          <div key={tIdx} style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--color-brand-cyan)', marginTop: '2px', letterSpacing: '-0.5px' }}>
                            {time}
                          </div>
                        ))}
                        {times.length === 0 && (
                          <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>-</div>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 'auto' }}>
                  {p.map_url ? (
                    <a href={p.map_url} target="_blank" rel="noreferrer" style={{ color: '#0284c7', textDecoration: 'none', fontWeight: '500' }}>
                      📍 {p.address || 'Xem bản đồ'}
                    </a>
                  ) : (
                    <span style={{ color: '#64748b' }}>📍 {p.address || 'Chưa cập nhật địa chỉ'}</span>
                  )}
                </div>
              </div>
            ))}
            
            {filtered.length === 0 && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1', width: '100%' }}>
                Chưa có dữ liệu giáo xứ nào.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
