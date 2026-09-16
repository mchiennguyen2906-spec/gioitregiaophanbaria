"use client";
import { useState, useEffect } from 'react';
import { getParishesFromStore, Parish } from '../utils/store';

export default function ParishSchedule() {
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [mounted, setMounted] = useState(false);
  const [search, setSearch] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

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
  
  const maxIndex = Math.max(0, Math.ceil(filtered.length / 4) - 1);

  useEffect(() => {
    if (filtered.length <= 4) return;
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [filtered.length, maxIndex, search]);

  useEffect(() => setCurrentIndex(0), [search]);

  const handlePrev = () => setCurrentIndex(prev => prev > 0 ? prev - 1 : maxIndex);
  const handleNext = () => setCurrentIndex(prev => prev < maxIndex ? prev + 1 : 0);

  if (!mounted) return null;

  const daysOrder = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chúa Nhật"];
  const shortDays = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="container" style={{ marginTop: '20px' }}>
      <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '15px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
          <h3 style={{ margin: 0, color: 'var(--color-brand-cyan)', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '1.2rem' }}>
            <span style={{ background: 'var(--color-brand-red)', color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>TỔNG HỢP</span>
            Giờ Lễ Các Giáo Xứ
          </h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="🔍 Tìm giáo xứ..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '20px', border: '1px solid #cbd5e1', outline: 'none', width: '250px', fontSize: '0.95rem' }}
            />
            {filtered.length > 4 && (
              <div style={{ display: 'flex', gap: '5px' }}>
                <button onClick={handlePrev} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>❮</button>
                <button onClick={handleNext} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid #cbd5e1', background: '#fff', cursor: 'pointer', fontWeight: 'bold', color: '#64748b' }}>❯</button>
              </div>
            )}
          </div>
        </div>

        <div style={{ overflow: 'hidden', position: 'relative' }}>
          <div style={{ 
            display: 'flex', 
            transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)',
            transform: `translateX(-${currentIndex * 100}%)`
          }}>
            {Array.from({ length: maxIndex + 1 }).map((_, slideIndex) => (
              <div key={slideIndex} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '15px', minWidth: '100%', flexShrink: 0 }}>
                {filtered.slice(slideIndex * 4, slideIndex * 4 + 4).map(p => (
                  <div key={p.id} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '15px', boxShadow: '0 2px 4px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column' }}>
                    <h4 style={{ margin: '0 0 12px 0', color: 'var(--color-text-main)', fontSize: '1.05rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', textAlign: 'center' }}>
                      {p.name}
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, minmax(0, 1fr))', gap: '2px', textAlign: 'center', marginBottom: '12px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '12px' }}>
                      {daysOrder.map((day, idx) => {
                        // Tách giờ trong trường hợp user nhập "05:00 18:00" thay vì dùng dấu phẩy
                        const rawTimes = p.schedules[day] || [];
                        const times = rawTimes.flatMap(t => t.includes(',') ? t.split(',') : t.split(' ')).map(t => t.trim()).filter(t => t);
                        
                        const isToday = new Date().getDay() === (idx === 6 ? 0 : idx + 1); // JS Date.getDay(): 0 is Sunday
                        
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
              </div>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div style={{ padding: '30px', textAlign: 'center', color: '#64748b', background: '#fff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
              Chưa có dữ liệu giáo xứ nào.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
