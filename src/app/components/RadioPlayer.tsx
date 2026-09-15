"use client";
import React, { useState, useEffect } from 'react';
import styles from '../page.module.css';
import { getRadioLinkFromStore, getWordOfGodsFromStore, WordOfGod } from '../utils/store';

export default function RadioPlayer() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [radioLink, setRadioLink] = useState('');
  const [todayWord, setTodayWord] = useState<WordOfGod | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setRadioLink(getRadioLinkFromStore());
      
      const words = await getWordOfGodsFromStore();
      const nowDay = new Date().getDay();
      const dayOfWeek = nowDay === 0 ? 7 : nowDay; // 1-7
      const word = words.find(w => w.dayOfWeek === dayOfWeek);
      setTodayWord(word || null);
    };
    
    loadData();
    window.addEventListener('storage_update', loadData);
    return () => window.removeEventListener('storage_update', loadData);
  }, []);

  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chúa Nhật'];
  const dayName = todayWord ? dayNames[todayWord.dayOfWeek - 1] : 'Hôm nay';

  if (!radioLink) {
    return null; // Ẩn nếu không có link radio
  }

  return (
    <div 
      className={`${styles.audioPlayerBox} ${isExpanded ? styles.expanded : ''}`}
      onClick={() => !isExpanded && setIsExpanded(true)}
      style={{ cursor: isExpanded ? 'default' : 'pointer', display: 'flex', flexDirection: 'column' }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div 
          className={styles.audioIcon} 
          onClick={(e) => {
            if (isExpanded) {
              e.stopPropagation();
              setIsExpanded(false);
            }
          }}
          style={{ cursor: 'pointer' }}
        >
          {isExpanded ? '▼' : '▶'}
        </div>
        <div className={styles.audioInfo}>
          <h4 style={{ margin: '0 0 2px 0' }}>Radio Lời Chúa</h4>
          <p style={{ margin: 0 }}>{dayName} {todayWord ? `- ${todayWord.source}` : ''}</p>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: '15px', width: '100%' }}>
          <audio controls src={radioLink} style={{ width: '100%' }} autoPlay={false}>
            Trình duyệt của bạn không hỗ trợ thẻ audio.
          </audio>
        </div>
      )}
    </div>
  );
}
