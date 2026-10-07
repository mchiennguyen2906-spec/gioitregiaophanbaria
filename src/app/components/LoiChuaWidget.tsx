"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getArticlesFromStore, Article, getWordOfGodsFromStore, WordOfGod } from '../utils/store';

export default function LoiChuaWidget() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [wordOfGod, setWordOfGod] = useState<WordOfGod | null>(null);

  useEffect(() => {
    const loadArticles = async () => {
      const allArticles = await getArticlesFromStore();
      const validArticles = allArticles
        .filter(a => a.categoryId === 'loi-chua')
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setArticles(validArticles);
      
      const words = await getWordOfGodsFromStore();
      const nowDay = new Date().getDay();
      const dayOfWeek = nowDay === 0 ? 7 : nowDay; // 1-7
      const todayWord = words.find(w => w.dayOfWeek === dayOfWeek);
      setWordOfGod(todayWord || null);
    };
    loadArticles();
    window.addEventListener('storage_update', loadArticles);
    return () => window.removeEventListener('storage_update', loadArticles);
  }, []);

  const getDateBadge = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const dZero = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
      const nowZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const diffDays = Math.round((dZero - nowZero) / (1000 * 60 * 60 * 24));
      
      const days = ['Chúa Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
      const dayName = days[d.getDay()];
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');

      if (diffDays === 0) return { label: 'Hôm nay', sub: `${dayName} ${dd}/${mm}`, isToday: true, isTomorrow: false };
      if (diffDays === 1) return { label: 'Ngày mai', sub: `${dayName} ${dd}/${mm}`, isToday: false, isTomorrow: true };
      if (diffDays === -1) return { label: 'Hôm qua', sub: `${dayName} ${dd}/${mm}`, isToday: false, isTomorrow: false };
      return { label: dayName, sub: `${dd}/${mm}`, isToday: false, isTomorrow: false };
    } catch (e) {
      return { label: '', sub: '', isToday: false, isTomorrow: false };
    }
  };

  // Find today's article if available, otherwise take the latest
  const now = new Date();
  const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  
  const todayArticle = articles.find(a => a.date?.startsWith(todayStr)) || articles[0];
  const otherArticles = articles.filter(a => a.id !== todayArticle?.id).slice(0, 3);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div className="section-header" style={{ borderBottom: '1px solid #c53030', padding: '0 0 10px 0', marginBottom: '15px', flexShrink: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 className="section-title" style={{ fontSize: '0.95rem', textTransform: 'uppercase', color: '#c53030', fontWeight: 'bold', margin: 0 }}>
          ✝ LỜI CHÚA MỖI NGÀY
        </h2>
        <Link href="/kinh-thanh/loi-chua" style={{ fontSize: '0.75rem', color: '#64748b', textDecoration: 'none', fontWeight: 600 }}>
          Xem tất cả »
        </Link>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>

        {/* Bài chính (Hôm nay / Mới nhất) */}
        {todayArticle ? (
          (() => {
            const badge = getDateBadge(todayArticle.date);
            return (
              <div style={{
                background: badge.isToday ? '#fff5f5' : '#f8fafc',
                border: badge.isToday ? '1px solid #fecaca' : '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '10px',
                marginBottom: '12px',
                flexShrink: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    padding: '2px 8px',
                    borderRadius: '4px',
                    background: badge.isToday ? '#dc2626' : badge.isTomorrow ? '#2563eb' : '#64748b',
                    color: '#ffffff'
                  }}>
                    {badge.label}
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>
                    {badge.sub}
                  </span>
                </div>
                
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 700, margin: 0, color: '#1e293b', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      <Link href={`/${todayArticle.categoryId}/${todayArticle.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                        {todayArticle.title}
                      </Link>
                    </h4>
                  </div>
                  <Link href={`/${todayArticle.categoryId}/${todayArticle.id}`} style={{ flexShrink: 0 }}>
                    <img
                      loading="lazy"
                      src={todayArticle.thumbnailUrl || "https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=200&auto=format&fit=crop"}
                      style={{ width: '65px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }}
                      alt={todayArticle.title}
                    />
                  </Link>
                </div>
              </div>
            );
          })()
        ) : null}

        {/* Danh sách các ngày kế tiếp / trước đó */}
        {otherArticles.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingBottom: '10px', flexShrink: 0, flex: 1 }}>
            {otherArticles.map((article) => {
              const badge = getDateBadge(article.date);
              return (
                <div key={article.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', fontSize: '0.82rem', lineHeight: 1.35 }}>
                  <span style={{
                    fontSize: '0.68rem',
                    fontWeight: 600,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    background: badge.isTomorrow ? '#eff6ff' : '#f1f5f9',
                    color: badge.isTomorrow ? '#1d4ed8' : '#475569',
                    flexShrink: 0,
                    whiteSpace: 'nowrap'
                  }}>
                    {badge.sub || badge.label}
                  </span>
                  <Link href={`/${article.categoryId}/${article.id}`} style={{ color: '#334155', textDecoration: 'none', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {article.title}
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Banner: Suy Niệm Tin Mừng Chúa Nhật */}
        <div style={{ marginTop: 'auto', flexShrink: 0, paddingTop: '6px' }}>
          <Link href="/kinh-thanh/suy-niem" style={{
            background: 'linear-gradient(135deg, #fee2e2 0%, #ffedd5 100%)',
            border: '1px solid #fecaca',
            height: '68px',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
            textDecoration: 'none',
            borderRadius: '8px',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}>
            <img
              loading="lazy"
              src="https://images.unsplash.com/photo-1507434965515-61970f2bd7c6?q=80&w=200&auto=format&fit=crop"
              style={{ width: '68px', height: '100%', objectFit: 'cover' }}
              alt="Suy niệm Tin Mừng"
            />
            <div style={{ flex: 1, padding: '0 10px', textAlign: 'center' }}>
              <div style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2, textTransform: 'uppercase' }}>
                Suy Niệm
              </div>
              <div style={{ color: '#b45309', fontWeight: 600, fontSize: '0.78rem', marginTop: '2px' }}>
                Tin Mừng Chúa Nhật »
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
