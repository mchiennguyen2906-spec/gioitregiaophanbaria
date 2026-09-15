"use client";
import React, { useState, useEffect } from 'react';
import styles from '../../../page.module.css';
import LoiChuaWidget from '../../../components/LoiChuaWidget';
import { getTitle } from '../../../utils/categoryMap';
import { getArticlesFromStore, getDonationsFromStore, Article, DonationProgram } from '../../../utils/store';
import EventRegistrationForm from '../../../components/EventRegistrationForm';

export default function SubPage({ params }: { params: any }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [articleDetail, setArticleDetail] = useState<Article | null>(null);
  const [subcategoryArticles, setSubcategoryArticles] = useState<Article[]>([]);
  const [donations, setDonations] = useState<DonationProgram[]>([]);

  // Xử lý params cho Next.js 15+ (nếu params là Promise)
  const resolvedParams = params instanceof Promise ? React.use(params) : params;
  const category = resolvedParams?.category || '';
  const slug = resolvedParams?.slug || '';

  const titleStr = getTitle(category, slug).toUpperCase();
  const isEventRegistration = category === 'dao-tao' && slug === 'su-kien';

  useEffect(() => {
    // Tìm bài viết theo ID (nếu slug là ID)
    const all = getArticlesFromStore();
    const foundArticle = all.find(a => a.id === slug);
    if (foundArticle) {
      setArticleDetail(foundArticle);
    } else {
      // Nếu không phải ID bài viết, giả định đây là trang danh sách subcategory
      setSubcategoryArticles(all.filter(a => a.categoryId === slug && a.status === 'published'));
    }
    
    setDonations(getDonationsFromStore());
  }, [slug]);

  const isArticleCompleted = (articleId: string) => {
    return donations.some(d => d.isCompleted && d.linkedArticleId === articleId);
  };

  const featuredArticles = subcategoryArticles.filter(a => a.isFeatured).slice(0, 6);
  const priorityArticles = subcategoryArticles.filter(a => a.isPriority).slice(0, 6);

  useEffect(() => {
    if (isEventRegistration || articleDetail || featuredArticles.length <= 1) return;
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % featuredArticles.length), 3000); 
    return () => clearInterval(timer);
  }, [isEventRegistration, articleDetail, featuredArticles.length]);

  return (
    <div style={{ background: '#f8fafc', paddingBottom: '40px' }}>
      
      {/* Breadcrumb / Title */}
      <div className="container" style={{ padding: '20px 15px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--color-brand-cyan)', margin: 0, textTransform: 'uppercase', fontWeight: 800 }}>
          {articleDetail ? articleDetail.title : titleStr}
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>
          <a href="/" style={{color: '#64748b', textDecoration: 'none'}}>Trang chủ</a> 
          {articleDetail ? ` » ${articleDetail.title}` : ` » ${titleStr}`}
        </p>
      </div>

      {isEventRegistration ? (
        <EventRegistrationForm />
      ) : articleDetail ? (
        <div className="container" style={{ background: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          {articleDetail.categoryId === 'guong-mat' ? (
            // Giao diện riêng cho Gương Mặt Truyền Cảm Hứng
            <div>
              <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '20px' }}>
                <img src={articleDetail.thumbnailUrl} alt="Avatar" style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-brand-red)' }} />
                <div>
                  <h1 style={{ color: 'var(--color-brand-cyan)', margin: '0 0 10px 0', fontSize: '2rem' }}>{articleDetail.title}</h1>
                  <p style={{ color: '#475569', margin: '0 0 5px 0', fontSize: '1.1rem', fontWeight: 600 }}>🌟 Vị trí / Chức vụ: {articleDetail.author}</p>
                  <p style={{ color: '#64748b', margin: 0, fontSize: '0.95rem' }}>⛪ Giáo xứ: {articleDetail.parish}</p>
                </div>
              </div>
              <div style={{ padding: '20px', background: '#fef2f2', borderLeft: '4px solid var(--color-brand-red)', borderRadius: '0 8px 8px 0', marginBottom: '30px', fontSize: '1.2rem', fontStyle: 'italic', color: '#991b1b', lineHeight: 1.6 }}>
                "{articleDetail.excerpt}"
              </div>
              <div dangerouslySetInnerHTML={{ __html: articleDetail.content }} style={{ lineHeight: '1.8', color: '#1e293b', fontSize: '1.05rem' }} />
            </div>
          ) : (
            // Giao diện bài viết thông thường
            <div>
              <h1 style={{ color: 'var(--color-brand-red)', marginBottom: '10px' }}>
                {articleDetail.title}
                {isArticleCompleted(articleDetail.id) && (
                  <span style={{ background: '#22c55e', color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.9rem', marginLeft: '12px', verticalAlign: 'middle', fontWeight: 'bold' }}>✓ Đã hoàn thành quyên góp</span>
                )}
              </h1>
              <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                Đăng bởi: {articleDetail.author} {articleDetail.parish ? `(${articleDetail.parish})` : ''} | {new Date(articleDetail.date).toLocaleDateString('vi-VN')}
              </p>
              <div style={{ fontSize: '1.1rem', fontStyle: 'italic', color: '#334155', marginBottom: '20px', lineHeight: 1.6 }}>
                {articleDetail.excerpt}
              </div>
              
              {articleDetail.audioUrl && (
                <div style={{ marginBottom: '25px', padding: '15px', background: '#f1f5f9', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{ fontSize: '1.5rem', color: 'var(--color-brand-cyan)' }}>🎧</span>
                    <span style={{ fontWeight: 'bold', color: '#334155', fontSize: '1.1rem' }}>Nghe Audio / Podcast</span>
                  </div>
                  <audio controls style={{ width: '100%', outline: 'none' }}>
                    <source src={articleDetail.audioUrl} type="audio/mpeg" />
                    Trình duyệt của bạn không hỗ trợ thẻ audio.
                  </audio>
                </div>
              )}

              <div dangerouslySetInnerHTML={{ __html: articleDetail.content }} style={{ lineHeight: '1.8', color: '#1e293b', fontSize: '1.05rem' }} />
            </div>
          )}
        </div>
      ) : (
        <>
          {/* TOP SECTION (Giống Trang Chủ) */}
          <div className="container" style={{ marginBottom: '30px' }}>
            {/* Dùng đúng className heroGrid để có cấu trúc 3 cột */}
            <section className={styles.heroGrid}>
              {/* Col 1: Hero Slider */}
              <div className={`${styles.heroSlider} slider-hover-container`} style={{ position: 'relative', overflow: 'hidden' }}>
                 {featuredArticles.length > 0 ? (
                   <>
                     <a href={`/${category}/${featuredArticles[currentSlide].id}`}>
                       <img src={featuredArticles[currentSlide].thumbnailUrl} className={styles.sliderImg} alt="Hero" style={{ transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)' }} />
                       <div className={styles.sliderText} style={{ transition: 'all 0.4s ease-in-out', padding: '30px', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)', color: 'white' }}>
                          <span style={{ background: 'var(--color-brand-red)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>TIÊU ĐIỂM</span>
                          <h3 style={{ fontSize: '1.6rem', marginTop: '10px', marginBottom: '8px', lineHeight: 1.3 }}>{featuredArticles[currentSlide].title}</h3>
                          <p style={{ fontSize: '0.95rem', opacity: 0.9 }}>{featuredArticles[currentSlide].excerpt}</p>
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

              {/* Col 2: Tin Tức Mới / Ưu Tiên */}
              <div className={styles.heroNewsBox}>
                <div className="section-header" style={{ borderBottom: '1px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '15px' }}>
                  <h2 className="section-title" style={{ fontSize: '1.1rem', color: 'var(--color-brand-cyan)' }}>Ưu Tiên</h2>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {priorityArticles.length > 0 ? priorityArticles.map((article) => (
                    <a key={article.id} href={`/${category}/${article.id}`} style={{ display: 'flex', gap: '12px', alignItems: 'center', textDecoration: 'none' }}>
                      <img src={article.thumbnailUrl} style={{ width: '80px', height: '65px', objectFit: 'cover', borderRadius: '6px' }} alt="Thumb" />
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
              {subcategoryArticles.length > 0 ? subcategoryArticles.map((article) => (
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
                    <img src={article.thumbnailUrl} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={article.title} />
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
              <button style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>2</button>
              <button style={{ padding: '8px 15px', border: '1px solid #cbd5e1', background: '#fff', borderRadius: '4px', cursor: 'pointer' }}>Sau</button>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
