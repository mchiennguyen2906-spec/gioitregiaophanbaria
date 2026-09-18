"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from '../../page.module.css';
import { getTitle } from '../../utils/categoryMap';
import LoiChuaWidget from '../../components/LoiChuaWidget';
import { getArticlesFromStore, getDonationsFromStore, Article, DonationProgram } from '../../utils/store';
import QuestionFormPopup from '../../components/QuestionFormPopup';

const heroSlides = [
  { img: "https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop", title: "Bài Viết Quan Trọng Nhất Của Chuyên Mục", desc: "Tóm tắt nội dung chính của bài viết điểm nhấn..." },
  { img: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=1200&auto=format&fit=crop", title: "Gắn kết yêu thương", desc: "Giao lưu gặp gỡ giới trẻ toàn giáo phận..." },
  { img: "https://images.unsplash.com/photo-1529070538774-1843cb1665e8?q=80&w=1200&auto=format&fit=crop", title: "Cùng nhau bước đi", desc: "Chương trình tĩnh tâm..." }
];

export default function CategoryClient({ 
  params, 
  initialArticles, 
  initialDonations 
}: { 
  params: any, 
  initialArticles: Article[], 
  initialDonations: DonationProgram[] 
}) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);

  // Xử lý params cho Next.js 15+ (nếu params là Promise)
  const resolvedParams = params instanceof Promise ? React.use(params) : params;
  const category = resolvedParams?.category || '';

  const titleStr = getTitle(category).toUpperCase();

  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [donations, setDonations] = useState<DonationProgram[]>(initialDonations);

  useEffect(() => {
    // Keep this for client-side syncing without reloading
    const syncData = () => {
    };
    window.addEventListener('storage_update', syncData);
    return () => window.removeEventListener('storage_update', syncData);
  }, [category]);

  const isArticleCompleted = (articleId: string) => {
    return donations.some(d => d.isCompleted && d.linkedArticleId === articleId);
  };

  const pinnedFeatured = articles.filter(a => a.isFeatured);
  const pinnedPriority = articles.filter(a => a.isPriority && !a.isFeatured);
  const unpinned = articles.filter(a => !a.isFeatured && !a.isPriority);
  
  const featuredArticles = [...pinnedFeatured];
  while (featuredArticles.length < 5 && unpinned.length > 0) {
    featuredArticles.push(unpinned.shift()!);
  }

  const priorityArticles = [...pinnedPriority];
  while (priorityArticles.length < 5 && unpinned.length > 0) {
    priorityArticles.push(unpinned.shift()!);
  }

  useEffect(() => {
    if (featuredArticles.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % featuredArticles.length);
    }, 3000); 
    return () => clearInterval(timer);
  }, [featuredArticles.length]);

  return (
    <div style={{ background: '#f8fafc', paddingBottom: '40px' }}>
      
      {/* Breadcrumb / Title */}
      <div className="container" style={{ padding: '20px 15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', color: 'var(--color-brand-cyan)', margin: 0, textTransform: 'uppercase', fontWeight: 800 }}>
            {titleStr}
          </h1>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
            <a href="/" style={{color: '#64748b', textDecoration: 'none'}}>Trang chủ</a> &raquo; {titleStr}
          </p>
        </div>
        {category === 'tam-ly' && (
          <button 
            onClick={() => setShowQuestionPopup(true)}
            style={{
              background: 'var(--color-brand-red)', color: 'white', border: 'none',
              padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer',
              boxShadow: '0 4px 10px rgba(220, 38, 38, 0.3)'
            }}
          >
            ✉️ Gửi câu hỏi / Thông tin
          </button>
        )}
      </div>

      {showQuestionPopup && <QuestionFormPopup onClose={() => setShowQuestionPopup(false)} />}

      {/* TOP SECTION (Giống Trang Chủ) */}
      <div className="container" style={{ marginBottom: '30px' }}>
        <section className={styles.heroGrid}>
          {/* Col 1: Hero Slider */}
          <div className={`${styles.heroSlider} slider-hover-container`} style={{ position: 'relative', overflow: 'hidden' }}>
             {featuredArticles.length > 0 ? (
               <>
                 <a href={`/${category}/${featuredArticles[currentSlide].id}`}>
                   <img loading="lazy" src={featuredArticles[currentSlide].thumbnailUrl} className={styles.sliderImg} alt="Hero" style={{ transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                   <div className={styles.sliderText} style={{ transition: 'all 0.4s ease-in-out', padding: '15px 20px', background: 'rgba(0, 0, 0, 0.65)', color: 'white' }}>
                      <span style={{ background: 'var(--color-brand-red)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold' }}>TIÊU ĐIỂM</span>
                      <h3 style={{ fontSize: 'clamp(1.1rem, 2vw, 1.5rem)', marginTop: '8px', marginBottom: '0', lineHeight: 1.3 }}>{featuredArticles[currentSlide].title}</h3>
                   </div>
                 </a>
                 {/* Progress Indicators */}
                 {featuredArticles.length > 1 && (
                   <div style={{position: 'absolute', bottom: '30px', right: '30px', display: 'flex', gap: '8px', zIndex: 10}}>
                      {featuredArticles.map((_, idx) => (
                        <div 
                          key={idx} 
                          onClick={() => setCurrentSlide(idx)}
                          style={{
                            width: idx === currentSlide ? '35px' : '10px', 
                            height: '4px', 
                            background: idx === currentSlide ? '#fff' : 'rgba(255,255,255,0.3)', 
                            transition: 'all 0.4s ease', 
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                   </div>
                 )}
               </>
             ) : (
               <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e2e8f0', color: '#64748b' }}>
                 Chưa có tin nổi bật
               </div>
             )}
          </div>

          {/* Col 2: Tin Tức Mới */}
          <div className={styles.heroNewsBox}>
            <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '15px' }}>
              <h2 className="section-title" style={{ fontSize: '1.1rem', color: 'var(--color-brand-cyan)' }}>Ưu Tiên</h2>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {priorityArticles.length > 0 ? priorityArticles.map((article) => (
                <a key={article.id} href={`/${category}/${article.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', textDecoration: 'none' }}>
                  <img loading="lazy" src={article.thumbnailUrl} style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '6px' }} alt="Thumb" />
                  <div>
                    <h4 style={{ fontSize: '0.9rem', marginBottom: '5px', color: 'var(--color-text-main)', lineHeight: '1.4', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{article.title}</h4>
                    <p style={{ fontSize: '0.75rem', color: '#64748b' }}>📅 {new Date(article.date).toLocaleDateString('vi-VN')}</p>
                  </div>
                </a>
              )) : (
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>Chưa có tin ưu tiên.</div>
              )}
            </div>
          </div>

          {/* Col 3: Lời Chúa */}
          <div className={styles.heroNewsBox}>
            <LoiChuaWidget />
          </div>
        </section>
      </div>

      {/* BOTTOM SECTION: 4-Column Article Grid */}
      <div className="container">
        <div className="section-header" style={{ borderBottom: '2px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '25px' }}>
          <h2 className="section-title" style={{ fontSize: '1.4rem' }}>DANH SÁCH BÀI VIẾT</h2>
        </div>
        
        {/* CSS Grid for 4 Columns */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {articles.length > 0 ? articles.map((article) => (
            <a key={article.id} href={`/${category}/${article.id}`} style={{
              background: '#fff',
              borderRadius: '8px',
              overflow: 'hidden',
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              transition: 'transform 0.2s',
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ height: '160px', overflow: 'hidden' }}>
                <img loading="lazy" src={article.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={article.title} />
              </div>
              <div style={{ padding: '15px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text-heading)', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.title}
                  {isArticleCompleted(article.id) && (
                    <span style={{ display: 'inline-block', background: '#22c55e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', marginLeft: '6px', verticalAlign: 'middle', fontWeight: 'bold' }}>✓ Hoàn thành</span>
                  )}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '15px', flex: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {article.excerpt}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-brand-red)', fontWeight: 'bold' }}>
                  ĐỌC TIẾP &raquo;
                </div>
              </div>
            </a>
          )) : (
            <div style={{ gridColumn: '1 / -1', padding: '40px', textAlign: 'center', color: '#64748b' }}>
              Chưa có bài viết nào trong chuyên mục này.
            </div>
          )}
        </div>
        
        {/* Pagination Dummy */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '40px', gap: '8px' }}>
          <button style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Trước</button>
          <button style={{ padding: '8px 15px', border: 'none', background: 'var(--color-brand-cyan)', color: 'white', borderRadius: '4px', cursor: 'pointer' }}>1</button>
          <button style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Sau</button>
        </div>

      </div>
    </div>
  );
}
