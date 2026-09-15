import React, { useState, useEffect } from 'react';
import { getWordOfGodsFromStore, saveWordOfGodsToStore, WordOfGod } from "../../../utils/store";
import toast from 'react-hot-toast';

export default function WordOfGodManager() {
  const [words, setWords] = useState<WordOfGod[]>([]);

  useEffect(() => {
    const loadWords = async () => setWords(await getWordOfGodsFromStore());
    loadWords();
  }, []);

  const handleChange = (dayOfWeek: number, field: keyof WordOfGod, value: string) => {
    setWords(words.map(w => w.dayOfWeek === dayOfWeek ? { ...w, [field]: value } : w));
  };

  const handleSave = async () => {
    if (words.some(w => !w.quote || !w.source)) {
      toast.error('Vui lòng điền đầy đủ Câu Lời Chúa và Nguồn cho tất cả các ngày!');
      return;
    }
    try {
      await saveWordOfGodsToStore(words);
      toast.success('Đã cập nhật Lời Chúa mỗi ngày!');
    } catch (err: any) {
      toast.error('Lỗi khi lưu: ' + err.message);
    }
  };

  const dayNames = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chúa Nhật'];

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: 'var(--color-brand-cyan)', margin: '0 0 20px 0', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
        Quản lý Lời Chúa Mỗi Ngày
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {words.map((word) => (
          <div key={word.dayOfWeek} style={{ padding: '15px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#f8fafc' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', fontSize: '1.1rem' }}>{dayNames[word.dayOfWeek - 1]}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#64748b' }}>Câu Lời Chúa *</label>
                <textarea 
                  value={word.quote}
                  onChange={e => handleChange(word.dayOfWeek, 'quote', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1', resize: 'vertical' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '5px', color: '#64748b' }}>Trích dẫn (Nguồn) *</label>
                <input 
                  type="text"
                  value={word.source}
                  onChange={e => handleChange(word.dayOfWeek, 'source', e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </div>
            </div>
          </div>
        ))}

        <button 
          onClick={handleSave}
          style={{ 
            background: 'var(--color-brand-red)', color: 'white', padding: '12px', 
            borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px'
          }}
        >
          Lưu Lời Chúa
        </button>
      </div>
    </div>
  );
}
