"use client";
import React from 'react';

// Dữ liệu mô phỏng Lời Chúa trong tuần
const bibleVerses = [
  { day: "Thứ Hai", verse: '"Chúa là mục tử chăn dắt tôi, tôi chẳng thiếu thốn gì." (Tv 23,1)' },
  { day: "Thứ Ba", verse: '"Tất cả những ai đang vất vả mang gánh nặng nề, hãy đến cùng tôi, tôi sẽ cho nghỉ ngơi bồi dưỡng." (Mt 11,28)' },
  { day: "Thứ Tư", verse: '"Thầy để lại bình an cho anh em, Thầy ban cho anh em bình an của Thầy." (Ga 14,27)' },
  { day: "Thứ Năm", verse: '"Anh em hãy yêu thương nhau như Thầy đã yêu thương anh em." (Ga 15,12)' },
  { day: "Thứ Sáu", verse: '"Phúc thay ai xót thương người, vì họ sẽ được Thiên Chúa xót thương." (Mt 5,7)' },
  { day: "Thứ Bảy", verse: '"Bởi vì đối với Thiên Chúa, không có gì là không thể làm được." (Lc 1,37)' },
  { day: "Chúa Nhật", verse: '"Này Thầy ở cùng anh em mọi ngày cho đến tận thế." (Mt 28,20)' }
];

export default function BibleTicker() {
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
