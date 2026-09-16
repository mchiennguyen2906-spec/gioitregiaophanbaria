"use client";
import { useState, useEffect } from 'react';
import { getWordOfGodsFromStore, WordOfGod, getSettingFromStore } from '../utils/store';

const dayNames = ["", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chúa Nhật"];

export default function BibleTicker() {
  const [bibleVerses, setBibleVerses] = useState<{day: string, verse: string}[]>([]);
  const [mounted, setMounted] = useState(false);
  const [speed, setSpeed] = useState(300); // Mặc định 300s

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
    const loadSpeed = async () => {
      const spd = await getSettingFromStore('bible_ticker_speed', '300');
      setSpeed(Number(spd));
    };
    
    loadWords();
    loadSpeed();
    window.addEventListener('storage_update', loadWords);
    window.addEventListener('storage_update', loadSpeed);
    return () => {
      window.removeEventListener('storage_update', loadWords);
      window.removeEventListener('storage_update', loadSpeed);
    };
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
        {/* Do nội dung Lời Chúa dài, có thể thiết lập thời gian dài hơn để chạy mượt */}
        <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
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
