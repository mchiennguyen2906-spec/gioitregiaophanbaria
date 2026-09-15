"use client";
import { useState, useEffect } from 'react';
import { getWordOfGodsFromStore, WordOfGod } from '../utils/store';

const dayNames = ["", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chúa Nhật"];

export default function BibleTicker() {
  const [bibleVerses, setBibleVerses] = useState<{day: string, verse: string}[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadWords = async () => {
      const words = await getWordOfGodsFromStore();
      const sorted = words.sort((a, b) => a.dayOfWeek - b.dayOfWeek);
      setBibleVerses(sorted.map(w => ({
        day: dayNames[w.dayOfWeek],
        verse: `"${w.quote}" (${w.source})`
      })));
    };
    loadWords();
    window.addEventListener('storage_update', loadWords);
    return () => window.removeEventListener('storage_update', loadWords);
  }, []);

  if (!mounted || bibleVerses.length === 0) return null;

  return (
    <div className="mass-ticker-wrapper">
      {/* Cột nhãn cố định */}
      <div className="ticker-label">
        <span style={{marginRight: '8px'}}>📖</span> LỜI CHÚA TRONG TUẦN
      </div>
      
      {/* Vùng nội dung chữ chạy */}
      <div className="ticker-content-container">
        {/* Do nội dung Lời Chúa dài gấp ~2.5 lần Giờ Lễ, ta phải tăng thời gian vòng lặp lên 300s để vận tốc thật sự (pixel/s) bằng nhau */}
        <div className="ticker-track" style={{ animationDuration: '300s' }}>
          {/* Lặp lại mảng để tạo hiệu ứng chạy vô tận */}
          {[...bibleVerses, ...bibleVerses].map((item, index) => (
            <span key={index} className="ticker-item" style={{padding: '0 60px'}}>
              <span style={{color: 'var(--color-brand-gold)', fontWeight: 'bold', marginRight: '5px'}}>{item.day}:</span> 
              <span style={{fontStyle: 'italic'}}>{item.verse}</span>
              <span style={{color: 'rgba(255,255,255,0.3)', marginLeft: '60px'}}>|</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
