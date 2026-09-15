"use client";
import React, { useState, useEffect } from 'react';
import { getArticlesFromStore, Article, getWordOfGodsFromStore, WordOfGod } from '../utils/store';

export default function LoiChuaWidget() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [wordOfGod, setWordOfGod] = useState<WordOfGod | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      const allArticles = await getArticlesFromStore();
      const validArticles = allArticles.filter(a => a.categoryId === 'loi-chua');
      setArticles(validArticles);
      
      const words = getWordOfGodsFromStore();
      const nowDay = new Date().getDay();
      const dayOfWeek = nowDay === 0 ? 7 : nowDay; // 1-7
      const todayWord = words.find(w => w.dayOfWeek === dayOfWeek);
      setWordOfGod(todayWord || null);
    };
    loadArticles();
    window.addEventListener('storage_update', loadArticles);
    return () => window.removeEventListener('storage_update', loadArticles);
  }, []);

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const days = ['Chúa Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${dayName} ${dd}/${mm}/${yyyy}`;
    } catch (e) {
      return '';
    }
  };

  const todayArticle = articles[0];
  const oldArticles = articles.slice(1, 3); // Chỉ lấy 2 bài cũ để tổng cộng có 3 bài

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="section-header" style={{ borderBottom: '1px solid #c53030', padding: '0 0 10px 0', marginBottom: '20px', flexShrink: 0 }}>
        <h2 className="section-title" style={{ fontSize: '0.95rem', textTransform: 'uppercase', color: '#c53030', fontWeight: 'bold', margin: 0 }}>
          ✝ LỜI CHÚA MỖI NGÀY
        </h2>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Ngày hiện tại */}
        {todayArticle ? (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexShrink: 0 }}>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <h4 style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '4px', color: '#333', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                <a href={`/${todayArticle.categoryId}/${todayArticle.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {formatDate(todayArticle.date)} – {todayArticle.title}
                </a>
              </h4>
            </div>
            <a href={`/${todayArticle.categoryId}/${todayArticle.id}`}>
              <img src={todayArticle.thumbnailUrl || "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=200&auto=format&fit=crop"} style={{ width: '70px', height: '55px', objectFit: 'cover', borderRadius: '4px' }} alt={todayArticle.title} />
            </a>
          </div>
        ) : null}

        {/* Các ngày cũ */}
        {oldArticles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '10px', flexShrink: 0, flex: 1 }}>
            {oldArticles.map((article) => (
              <div key={article.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <span style={{ color: '#3b82f6', fontWeight: 'bold', fontSize: '1.2rem', lineHeight: '1' }}>»</span>
                <a href={`/${article.categoryId}/${article.id}`} style={{ color: '#555', textDecoration: 'none', lineHeight: '1.4', fontSize: '0.85rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {formatDate(article.date)} – {article.title}
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Banners */}
        <div style={{ marginTop: 'auto', flexShrink: 0 }}>
          <a href="#" style={{
            background: 'linear-gradient(to right, #e0e7ff, #c7d2fe)',
            height: '75px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            textDecoration: 'none',
            borderRadius: '8px'
          }}>
            <img src="https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?q=80&w=200&auto=format&fit=crop" style={{ width: '75px', height: '100%', objectFit: 'cover' }} alt="Suy niệm" />
            <div style={{ flex: 1, textAlign: 'center', color: '#dc2626', fontWeight: 'bold', fontSize: '1.1rem', lineHeight: '1.3' }}>
              Suy Niệm<br />Tin Mừng Chúa Nhật
            </div>
          </a>
        </div>
      </div>
    </div>
  );
}
