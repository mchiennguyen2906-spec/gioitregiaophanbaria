"use client";
import { useState, useEffect } from 'react';
import styles from '../page.module.css';
import RadioPlayer from "../components/RadioPlayer";
import LoiChuaWidget from "../components/LoiChuaWidget";
import QuestionFormPopup from "../components/QuestionFormPopup";
import ParishSchedule from "../components/ParishSchedule";
import { Article } from "../utils/store";

export default function HomeClient({ initialArticles }: { initialArticles: Article[] }) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentMissionSlide, setCurrentMissionSlide] = useState(0);
  const [currentFaceSlide, setCurrentFaceSlide] = useState(0);
  const [currentCourseSlide, setCurrentCourseSlide] = useState(0);
  const [showQuestionPopup, setShowQuestionPopup] = useState(false);
  const [articles, setArticles] = useState<Article[]>(initialArticles);

  useEffect(() => {
    // Keep this to sync client-side updates if needed without reloading
    const syncArticles = () => {
      // For now we don't fetch again unless we really want real-time.
      // But the initial render is SSR!
    };
    window.addEventListener('storage_update', syncArticles);
    return () => window.removeEventListener('storage_update', syncArticles);
  }, []);

  const homeFeaturedPinned = articles.filter(a => a.isHomeFeatured);
  const homePriorityPinned = articles.filter(a => a.isHomePriority && !a.isHomeFeatured);
  const homeUnpinned = articles.filter(a => !a.isHomeFeatured && !a.isHomePriority);

  const homeFeatured = [...homeFeaturedPinned];
  while (homeFeatured.length < 10 && homeUnpinned.length > 0) {
    homeFeatured.push(homeUnpinned.shift()!);
  }

  const homePriority = [...homePriorityPinned];
  while (homePriority.length < 10 && homeUnpinned.length > 0) {
    homePriority.push(homeUnpinned.shift()!);
  }

  const getCategoryData = (catIds: string[], limit = 4) => {
    const catArticles = articles.filter(a => catIds.includes(a.categoryId));
    const featured = catArticles.find(a => a.isFeatured) || catArticles[0]; // Rơi vào bài mới nhất nếu không có nổi bật
    const priority = catArticles.find(a => a.isPriority && a.id !== featured?.id) || catArticles.find(a => a.id !== featured?.id);
    const rest = catArticles.filter(a => a.id !== featured?.id && a.id !== priority?.id).slice(0, limit);
    return { featured, priority, rest, all: catArticles };
  };

  const kinhThanhData = getCategoryData(['phuc-am', 'giao-ly']);
  const courseArticles = getCategoryData(['lich-hoc']).all.filter(a => a.isHomeFeatured);
  const eventArticles = getCategoryData(['su-kien']).all.filter(a => a.isHomeFeatured);
  const featuredVideo = getCategoryData(['thanh-ca']).all.find(a => a.isHomeFeatured);
  const featuredAlbums = getCategoryData(['hinh-anh']).all.filter(a => a.isHomeFeatured).slice(0, 6);

  // Dữ liệu cho Slider Sứ vụ & Tình nguyện
  const missionSlides = articles.filter(a => a.categoryId === 'su-kien' && a.isHomeFeatured).map(a => ({
    title: a.title,
    desc: a.excerpt,
    quote: '',
    img: a.thumbnailUrl,
    id: a.id
  }));

  const faceSlides = articles.filter(a => a.categoryId === 'guong-mat' && a.isHomeFeatured).map(a => ({
    name: a.title,
    role: a.author,
    parish: a.parish,
    desc: a.excerpt,
    img: a.thumbnailUrl,
    articleTitle: a.title,
    articleHook: a.excerpt,
    id: a.id
  }));
  const giaoXuData = getCategoryData(['giao-xu', 'giao-phan', 'phong-trao', 'lich-hoat-dong']);
  const kyNangData = getCategoryData(['huong-dao-sinh', 'leu-trai', 'quan-tro', 'lanh-dao']);
  const camNangData = getCategoryData(['tinh-yeu', 'bi-tich', 'thu-tuc', 'bieu-mau']);
  const tamLyData = getCategoryData(['tam-ly']);

  useEffect(() => {
    if (homeFeatured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % homeFeatured.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [homeFeatured.length]);

  useEffect(() => {
    const missionTimer = setInterval(() => {
      setCurrentMissionSlide((prev) => (prev + 1) % missionSlides.length);
    }, 4500); 
    return () => clearInterval(missionTimer);
  }, [missionSlides.length]);

  useEffect(() => {
    const faceTimer = setInterval(() => {
      setCurrentFaceSlide((prev) => (prev + 1) % faceSlides.length);
    }, 3000); 
    return () => clearInterval(faceTimer);
  }, [faceSlides.length]);

  useEffect(() => {
    if (courseArticles.length <= 2) return; // Chỉ cuộn nếu có nhiều hơn 2 khóa học
    const courseTimer = setInterval(() => {
      setCurrentCourseSlide((prev) => (prev + 1) % Math.ceil(courseArticles.length / 2));
    }, 4000); 
    return () => clearInterval(courseTimer);
  }, [courseArticles.length]);

  const prevHeroSlide = () => setCurrentSlide((prev) => homeFeatured.length ? (prev - 1 + homeFeatured.length) % homeFeatured.length : 0);
  const nextHeroSlide = () => setCurrentSlide((prev) => homeFeatured.length ? (prev + 1) % homeFeatured.length : 0);

  const prevMissionSlide = () => setCurrentMissionSlide((prev) => (prev - 1 + missionSlides.length) % missionSlides.length);
  const nextMissionSlide = () => setCurrentMissionSlide((prev) => (prev + 1) % missionSlides.length);

  return (
    <>
      {showQuestionPopup && <QuestionFormPopup onClose={() => setShowQuestionPopup(false)} />}
      
      <div className="container">
        {/* HERO SECTION - 2 Column Asymmetrical */}
        <section className={styles.heroGrid} style={{marginTop: '40px'}}>
        
          {/* Col 1: Slider Lớn (2.2fr) - Sự Kiện Giới Trẻ */}
          <div className={`${styles.heroSlider} slider-hover-container`} style={{position: 'relative', overflow: 'hidden'}}>
            {homeFeatured.length > 0 ? (
              <>
                <a href={`/${homeFeatured[currentSlide].categoryId}/${homeFeatured[currentSlide].id}`}>
                  <img fetchPriority="high" src={homeFeatured[currentSlide].thumbnailUrl} className={styles.sliderImg} alt="Youth Events" style={{transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'}} />
                  <div className={styles.sliderText} style={{transition: 'all 0.4s ease-in-out', padding: '30px', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)'}}>
                    <h3 className="text-fluid-hero" style={{color: '#fff'}}>{homeFeatured[currentSlide].title}</h3>
                    <p style={{fontSize: '1.05rem', color: '#f1f5f9', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '10px'}}>{homeFeatured[currentSlide].excerpt}</p>
                  </div>
                </a>
                
                {/* Arrows */}
                {homeFeatured.length > 1 && (
                  <>
                    <button className="slider-arrow arrow-left" onClick={prevHeroSlide}>❮</button>
                    <button className="slider-arrow arrow-right" onClick={nextHeroSlide}>❯</button>
                  </>
                )}

                {/* Progress Indicators */}
                {homeFeatured.length > 1 && (
                  <div style={{position: 'absolute', bottom: '30px', right: '30px', display: 'flex', gap: '8px', zIndex: 10}}>
                    {homeFeatured.map((_, idx) => (
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
                Chưa có tin nổi bật trang chủ
              </div>
            )}
          </div>

          {/* Col 2: Bản Tin Giáo Phận (1fr) */}
          <div className={styles.heroNewsBox} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
              <div className="section-header" style={{borderBottom: '1px solid var(--color-brand-cyan)', padding: '0 0 10px 0', marginBottom: '20px', flexShrink: 0}}>
                <h2 className="section-title" style={{fontSize: '0.95rem', textTransform: 'uppercase', color: 'var(--color-brand-cyan)', fontWeight: 'bold'}}>Bản Tin Giới Trẻ Giáo Phận</h2>
              </div>
              <div className="news-list" style={{display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '5px', flex: 1}}>
                
                {homePriority.length > 0 ? homePriority.map((article, idx) => {
                  const date = new Date(article.date);
                  const day = date.getDate().toString().padStart(2, '0');
                  const month = (date.getMonth() + 1).toString();
                  // Chọn màu nền xen kẽ để giao diện sinh động
                  const bgColors = ['var(--color-brand-red)', 'var(--color-brand-green)', 'var(--color-brand-cyan)'];
                  const bgColor = bgColors[idx % bgColors.length];

                  return (
                    <a key={article.id} href={`/${article.categoryId}/${article.id}`} className={styles.newsItemSmall} style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
                      <div style={{minWidth: '52px', height: '52px', background: bgColor, color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRadius: '6px', fontWeight: 'bold'}}>
                        <span style={{fontSize: '1.05rem'}}>{day}</span>
                        <span style={{fontSize: '0.7rem'}}>THG {month}</span>
                      </div>
                      <div>
                        <h4 style={{fontSize: '0.95rem', marginBottom: '3px', color: 'var(--color-text-main)', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'}}>{article.title}</h4>
                        <p style={{fontSize: '0.8rem', color: '#64748b'}}>📍 {article.author} {article.parish ? `- ${article.parish}` : ''}</p>
                      </div>
                    </a>
                  );
                }) : (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                    Đang tải bản tin...
                  </div>
                )}

              </div>
            </div>
          </div>

          {/* Col 3: Lời Chúa Mỗi Ngày & Các hạng mục (0.9fr) */}
          <div className={styles.heroNewsBox} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100%' }}>
              <LoiChuaWidget />
            </div>
          </div>
        </section>
      </div>

      {/* TỔNG HỢP GIỜ LỄ CÁC GIÁO XỨ (4 CỘT) */}
      <ParishSchedule />

      {/* DẢI 1: SỨ VỤ, Q&A, GƯƠNG MẶT */}
      <section style={{padding: '15px 0', borderBottom: '1px solid var(--border-color)'}}>
        <div className="container">
          
          <div className={styles.mainLayout}>
            {/* Col 1: Sứ Vụ & Tình Nguyện */}
            <div className={styles.categoryBlock}>
              <div className="section-header">
                <span style={{color: 'var(--color-brand-green)'}}>✚</span>
                <h2 className="section-title">Sứ Vụ & Tình Nguyện</h2>
              </div>
              <div className={styles.categoryTop}>
                {missionSlides.length > 0 ? (
                  <>
                    <div style={{position: 'relative', overflow: 'hidden', borderRadius: '8px', marginBottom: '15px'}}>
                      <div style={{
                        display: 'flex', 
                        width: `${missionSlides.length * 100}%`,
                        transform: `translateX(-${(100 / missionSlides.length) * currentMissionSlide}%)`,
                        transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
                      }}>
                        {missionSlides.map((slide, idx) => (
                          <div key={idx} style={{width: `${100 / missionSlides.length}%`}}>
                            <img loading="lazy" src={slide.img} alt="Tình nguyện" style={{width: '100%', aspectRatio: '16/10', objectFit: 'cover'}} />
                            <div style={{marginTop: '15px'}}>
                              <h3 style={{fontSize: '1.2rem', lineHeight: 1.3, color: 'var(--color-text-heading)', margin: '0 0 10px 0'}}>{slide.title}</h3>
                              <p style={{fontSize: '0.95rem', color: '#64748b', lineHeight: 1.6, margin: 0}}>
                                {slide.desc}
                              </p>
                              {slide.quote && (
                                <div style={{ fontStyle: 'italic', background: '#f8fafc', padding: '10px', borderRadius: '4px', borderLeft: '4px solid var(--color-brand-green)', marginTop: '10px', fontSize: '0.9rem', color: '#475569' }}>
                                  {slide.quote}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                      <a href="#" style={{background: 'var(--color-brand-red)', color: 'white', padding: '8px 15px', fontSize: '0.85rem', fontWeight: 600, display: 'inline-flex', borderRadius: '4px'}}>
                        Đăng ký ngay ➔
                      </a>
                    </div>
                  </>
                ) : (
                  <div style={{padding: '40px 20px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', color: '#64748b', fontSize: '0.95rem'}}>
                    Đang cập nhật sự kiện sứ vụ...
                  </div>
                )}
              </div>
            </div>

            {/* Col 2: Kinh Thánh & Giáo Lý */}
            <div className={styles.categoryBlock}>
              <div className="section-header">
                <span style={{color: '#eab308'}}>📖</span>
                <h2 className="section-title">Kinh Thánh - Giáo Lý</h2>
              </div>
              
              {kinhThanhData.featured && (
                <div className={styles.categoryTop}>
                  <img loading="lazy" src={kinhThanhData.featured.thumbnailUrl} className={styles.categoryMainImg} alt="Kinh Thánh" />
                  <a href={`/${kinhThanhData.featured.categoryId}/${kinhThanhData.featured.id}`} style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '5px'}}>
                    {kinhThanhData.featured.title}
                  </a>
                </div>
              )}
              
              <ul className={styles.categoryTitleList}>
                {kinhThanhData.priority && (
                  <li>
                    <a href={`/${kinhThanhData.priority.categoryId}/${kinhThanhData.priority.id}`} style={{fontWeight: 'bold', color: 'var(--color-brand-cyan)'}}>
                      [Ưu Tiên] {kinhThanhData.priority.title}
                    </a>
                  </li>
                )}
                {kinhThanhData.rest.map(article => (
                  <li key={article.id}>
                    <a href={`/${article.categoryId}/${article.id}`}>
                      {article.title}
                    </a>
                  </li>
                ))}
              </ul>
              
              <div className={styles.viewMoreBox}>
                <a href="/kinh-thanh" className={styles.viewMoreBtn}>Tài liệu học hỏi ➔</a>
              </div>
            </div>

            {/* Col 3: Gương Mặt Truyền Cảm Hứng */}
            <div className={styles.categoryBlock}>
              <div className="section-header">
                <span style={{color: 'var(--color-brand-green)'}}>⭐</span>
                <h2 className="section-title">Gương Mặt Truyền Cảm Hứng</h2>
              </div>
              <div className={styles.categoryTop} style={{display: 'grid', gridTemplateColumns: '1fr', gridTemplateRows: '1fr', alignItems: 'center', margin: '20px 0'}}>
                {faceSlides.length > 0 ? faceSlides.map((face, index) => (
                  <div key={index} style={{
                    gridArea: '1 / 1 / 2 / 2',
                    opacity: currentFaceSlide === index ? 1 : 0,
                    transition: 'opacity 0.8s ease-in-out',
                    zIndex: currentFaceSlide === index ? 1 : 0,
                    pointerEvents: currentFaceSlide === index ? 'auto' : 'none',
                    textAlign: 'center'
                  }}>
                    <img loading="lazy" src={face.img} className={styles.categoryMainImg} alt={face.name} style={{aspectRatio: '1/1', borderRadius: '50%', width: '150px', margin: '0 auto 15px auto', display: 'block', objectFit: 'cover'}} />
                    <a href={`/guong-mat/${face.id}`} style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, display: 'block'}}>{face.name}</a>
                    <p style={{fontSize: '0.85rem', color: '#64748b', fontWeight: '500', marginTop: '3px'}}>📍 {face.parish}</p>
                    <p style={{fontSize: '0.9rem', color: 'var(--color-brand-cyan)', fontWeight: 'bold', marginTop: '5px'}}>{face.role}</p>
                    <p className={styles.excerpt} style={{marginTop: '10px'}}>{face.desc}</p>
                    <div style={{textAlign: 'left', marginTop: '15px', padding: '15px', backgroundColor: '#f8fafc', borderRadius: '8px', borderLeft: '3px solid var(--color-brand-green)'}}>
                      <h4 style={{fontSize: '0.95rem', color: 'var(--color-text-main)', marginBottom: '5px'}}>{face.articleTitle}</h4>
                      <p style={{fontSize: '0.85rem', color: '#64748b', fontStyle: 'italic', lineHeight: 1.5}}>&quot;{face.articleHook}&quot;</p>
                    </div>
                  </div>
                )) : (
                  <div style={{padding: '40px 20px', textAlign: 'center', color: '#64748b'}}>Đang cập nhật gương mặt...</div>
                )}
              </div>
              <div className={styles.viewMoreBox} style={{textAlign: 'center'}}>
                <a href="/ban-tin/guong-mat" className={styles.viewMoreBtn}>Đọc đầy đủ bài viết ➔</a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DẢI 1.5: GIÁO XỨ, KỸ NĂNG, CẨM NANG HÔN NHÂN */}
      <section style={{padding: '15px 0', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f8fafc'}}>
        <div className="container">
          <div className={styles.mainLayout}>
            
            {/* Col 1: Giáo Xứ & Phong Trào */}
            <div className={styles.categoryBlock} style={{backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column'}}>
              <div className="section-header" style={{borderBottom: '2px solid var(--color-brand-cyan)'}}>
                <span style={{color: 'var(--color-brand-cyan)'}}>⛪</span>
                <h2 className="section-title" style={{fontSize: '1.2rem'}}>Tin tức Giáo Xứ & Phong Trào</h2>
              </div>
              {giaoXuData.featured ? (
                <>
                  <div className={styles.categoryTop} style={{marginBottom: '15px'}}>
                    <img loading="lazy" src={giaoXuData.featured.thumbnailUrl || 'https://images.unsplash.com/photo-1437603568260-1950d3ca6eab?q=80&w=800&auto=format&fit=crop'} className={styles.categoryMainImg} alt="Giáo Xứ" style={{aspectRatio: '16/9', borderRadius: '8px'}} />
                    <a href={`/${giaoXuData.featured.categoryId}/${giaoXuData.featured.id}`} style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: 1.4, marginTop: '10px', display: 'block'}}>{giaoXuData.featured.title}</a>
                  </div>
                  <ul className={styles.categoryTitleList}>
                    {giaoXuData.priority && (
                      <li><a href={`/${giaoXuData.priority.categoryId}/${giaoXuData.priority.id}`} style={{fontWeight: 'bold', color: 'var(--color-brand-cyan)'}}>[Ưu Tiên] {giaoXuData.priority.title}</a></li>
                    )}
                    {giaoXuData.rest.map(a => (
                      <li key={a.id}><a href={`/${a.categoryId}/${a.id}`}>{a.title}</a></li>
                    ))}
                  </ul>
                </>
              ) : (
                <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>Đang cập nhật...</div>
              )}
              <div className={styles.viewMoreBox} style={{marginTop: 'auto'}}>
                <a href="/ban-tin/giao-xu" className={styles.viewMoreBtn}>Xem các bản tin khác ➔</a>
              </div>
            </div>

            {/* Col 2: Kỹ Năng & Huấn Luyện */}
            <div className={styles.categoryBlock} style={{backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column'}}>
              <div className="section-header" style={{borderBottom: '2px solid var(--color-brand-green)'}}>
                <span style={{color: 'var(--color-brand-green)'}}>⛺</span>
                <h2 className="section-title" style={{fontSize: '1.2rem'}}>Kỹ Năng & Huấn Luyện</h2>
              </div>
              {kyNangData.featured ? (
                <>
                  <div className={styles.categoryTop} style={{marginBottom: '15px'}}>
                    <img loading="lazy" src={kyNangData.featured.thumbnailUrl || 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?q=80&w=800&auto=format&fit=crop'} className={styles.categoryMainImg} alt="Kỹ Năng" style={{aspectRatio: '16/9', borderRadius: '8px'}} />
                    <a href={`/${kyNangData.featured.categoryId}/${kyNangData.featured.id}`} style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: 1.4, marginTop: '10px', display: 'block'}}>{kyNangData.featured.title}</a>
                  </div>
                  <ul className={styles.categoryTitleList}>
                    {kyNangData.priority && (
                      <li><a href={`/${kyNangData.priority.categoryId}/${kyNangData.priority.id}`} style={{fontWeight: 'bold', color: 'var(--color-brand-green)'}}>[Ưu Tiên] {kyNangData.priority.title}</a></li>
                    )}
                    {kyNangData.rest.map(a => (
                      <li key={a.id}><a href={`/${a.categoryId}/${a.id}`}>{a.title}</a></li>
                    ))}
                  </ul>
                </>
              ) : (
                <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>Đang cập nhật...</div>
              )}
              <div className={styles.viewMoreBox} style={{marginTop: 'auto'}}>
                <a href="/ky-nang" className={styles.viewMoreBtn} style={{color: 'var(--color-brand-green)'}}>Khám phá thêm ➔</a>
              </div>
            </div>

            {/* Col 3: Cẩm Nang & Hôn Nhân */}
            <div className={styles.categoryBlock} style={{backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', display: 'flex', flexDirection: 'column'}}>
              <div className="section-header" style={{borderBottom: '2px solid var(--color-brand-red)'}}>
                <span style={{color: 'var(--color-brand-red)'}}>💍</span>
                <h2 className="section-title" style={{fontSize: '1.2rem'}}>Cẩm Nang Giới Trẻ</h2>
              </div>
              {camNangData.featured ? (
                <>
                  <div className={styles.categoryTop} style={{marginBottom: '15px'}}>
                    <img loading="lazy" src={camNangData.featured.thumbnailUrl || 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=800&auto=format&fit=crop'} className={styles.categoryMainImg} alt="Cẩm Nang" style={{aspectRatio: '16/9', borderRadius: '8px'}} />
                    <a href={`/${camNangData.featured.categoryId}/${camNangData.featured.id}`} style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.05rem', lineHeight: 1.4, marginTop: '10px', display: 'block'}}>{camNangData.featured.title}</a>
                  </div>
                  <ul className={styles.categoryTitleList}>
                    {camNangData.priority && (
                      <li><a href={`/${camNangData.priority.categoryId}/${camNangData.priority.id}`} style={{fontWeight: 'bold', color: 'var(--color-brand-red)'}}>[Ưu Tiên] {camNangData.priority.title}</a></li>
                    )}
                    {camNangData.rest.map(a => (
                      <li key={a.id}><a href={`/${a.categoryId}/${a.id}`}>{a.title}</a></li>
                    ))}
                  </ul>
                </>
              ) : (
                <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>Đang cập nhật...</div>
              )}
              <div className={styles.viewMoreBox} style={{marginTop: 'auto'}}>
                <a href="/cam-nang" className={styles.viewMoreBtn} style={{color: 'var(--color-brand-red)'}}>Kho tài liệu & Biểu mẫu ➔</a>
              </div>
            </div>

            {/* Col 4: Góc Giải Đáp Tuổi Trẻ (Full Width) */}
            <div className={styles.categoryBlock} style={{gridColumn: '1 / -1', backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
              <div className="section-header" style={{borderBottom: '2px solid var(--color-brand-cyan)', marginBottom: '20px'}}>
                <span style={{color: 'var(--color-brand-cyan)'}}>💬</span>
                <h2 className="section-title" style={{fontSize: '1.2rem'}}>Góc Giải Đáp Tuổi Trẻ</h2>
              </div>
              
              <div className={styles.qnaHorizontalLayout}>
                {tamLyData.featured ? (
                  <>
                    <div className={styles.qnaMain}>
                      <img loading="lazy" src={tamLyData.featured.thumbnailUrl || 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=800&auto=format&fit=crop'} className={styles.categoryMainImg} alt="Q&A" style={{aspectRatio: '16/9', borderRadius: '8px'}} />
                      <a href={`/${tamLyData.featured.categoryId}/${tamLyData.featured.id}`} style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '15px', display: 'block'}}>{tamLyData.featured.title}</a>
                      <p className={styles.excerpt} style={{marginTop: '10px', fontSize: '0.9rem'}}>
                        {tamLyData.featured.excerpt}
                      </p>
                    </div>
                    
                    <div className={styles.qnaList}>
                      <ul className={styles.categoryTitleList}>
                        {tamLyData.priority && (
                          <li><a href={`/${tamLyData.priority.categoryId}/${tamLyData.priority.id}`} style={{fontWeight: 'bold', color: 'var(--color-brand-cyan)'}}>[Ưu Tiên] {tamLyData.priority.title}</a></li>
                        )}
                        {tamLyData.rest.map(a => (
                          <li key={a.id}><a href={`/${a.categoryId}/${a.id}`}>{a.title}</a></li>
                        ))}
                      </ul>
                      <div className={styles.viewMoreBox} style={{marginTop: 'auto', borderTop: 'none', textAlign: 'left', padding: '15px 15px 0 15px', display: 'flex', gap: '15px'}}>
                        <button onClick={() => setShowQuestionPopup(true)} className={styles.viewMoreBtn} style={{color: '#0f766e', background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                          Gửi câu hỏi ẩn danh ➔
                        </button>
                        <a href="/media/tam-ly" className={styles.viewMoreBtn} style={{color: 'var(--color-brand-cyan)'}}>
                          Xem tiếp các câu hỏi khác ➔
                        </a>
                      </div>
                    </div>
                  </>
                ) : (
                  <div style={{padding: '40px', color: '#64748b', textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                    <p style={{marginBottom: '15px'}}>Góc Tâm Lý đang cập nhật dữ liệu.</p>
                    <button onClick={() => setShowQuestionPopup(true)} className={styles.viewMoreBtn} style={{color: '#0f766e', background: '#f8fafc', padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem'}}>
                      Gửi câu hỏi ẩn danh trước ➔
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DẢI 1.8: ĐÀO TẠO & ĐĂNG KÝ */}
      <section style={{padding: '30px 0', borderBottom: '1px solid var(--border-color)', backgroundColor: '#f1f5f9'}}>
        <div className="container">
          <div className="section-header" style={{borderBottom: '2px solid #0284c7', marginBottom: '20px'}}>
            <span style={{color: '#0284c7'}}>📝</span>
            <h2 className="section-title">Góc Đào Tạo & Đăng Ký</h2>
          </div>
          
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))', gap: '30px'}}>
            
            {/* Cột 1: Lớp Giáo lý */}
            <div className={styles.categoryBlock} style={{backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
              <h3 style={{fontSize: '1.15rem', color: 'var(--color-brand-cyan)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{fontSize: '1.5rem'}}>📚</span> Khóa Học Sắp Khai Giảng
              </h3>
              
              <div style={{display: 'flex', flexDirection: 'column', gap: '15px', height: '240px', overflow: 'hidden'}}>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '15px',
                  transform: `translateY(-${currentCourseSlide * 255}px)`,
                  transition: 'transform 0.5s ease'
                }}>
                  {courseArticles.length > 0 ? courseArticles.map((course, idx) => (
                    <div key={course.id} style={{borderLeft: `4px solid ${idx % 2 === 0 ? 'var(--color-brand-green)' : 'var(--color-brand-red)'}`, background: '#f8fafc', padding: '15px 20px', borderRadius: '0 8px 8px 0', height: '120px', flexShrink: 0}}>
                      <h4 style={{margin: '0 0 5px 0', fontSize: '1.05rem', color: 'var(--color-text-heading)'}}>{course.title}</h4>
                      <p style={{margin: '0 0 10px 0', fontSize: '0.9rem', color: '#64748b'}}>📍 {course.parish} <br/> 🗓 Khai giảng: {new Date(course.date).toLocaleDateString('vi-VN')}</p>
                      <a href={`/lich-hoc/${course.id}`} style={{display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#0284c7', fontWeight: '600', padding: '6px 12px', background: '#e0f2fe', borderRadius: '6px'}}>Xem thông tin liên hệ ➔</a>
                    </div>
                  )) : (
                    <div style={{padding: '20px', color: '#64748b', textAlign: 'center'}}>Chưa có khóa học nổi bật</div>
                  )}
                </div>
              </div>
            </div>

            {/* Cột 2: Sự Kiện Tâm Điểm */}
            <div className={styles.categoryBlock} style={{backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)'}}>
              <h3 style={{fontSize: '1.15rem', color: 'var(--color-brand-cyan)', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                <span style={{fontSize: '1.5rem'}}>🔥</span> Sự Kiện Tâm Điểm
              </h3>
              
              <div style={{position: 'relative', borderRadius: '10px', overflow: 'hidden', height: '280px', display: 'flex', flexDirection: 'column'}}>
                {eventArticles.length > 0 ? (
                  <>
                    <img loading="lazy" src={eventArticles[0].thumbnailUrl} alt={eventArticles[0].title} style={{width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0}} />
                    <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.4) 60%, rgba(15, 23, 42, 0.1) 100%)', zIndex: 1}}></div>
                    
                    <div style={{position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', height: '100%', padding: '20px'}}>
                      <span style={{background: 'var(--color-brand-red)', color: '#fff', fontSize: '0.75rem', fontWeight: 'bold', padding: '5px 10px', borderRadius: '20px', alignSelf: 'flex-start', marginBottom: '12px', letterSpacing: '0.5px'}}>SẮP DIỄN RA</span>
                      <h4 style={{color: '#fff', margin: '0 0 8px 0', fontSize: '1.4rem', lineHeight: '1.3', textShadow: '0 2px 4px rgba(0,0,0,0.5)'}}>{eventArticles[0].title}</h4>
                      <p style={{color: '#cbd5e1', margin: '0 0 20px 0', fontSize: '0.95rem'}}>🗓 {new Date(eventArticles[0].date).toLocaleDateString('vi-VN')} | 📍 {eventArticles[0].parish}</p>
                      <button onClick={() => window.location.href = `/su-kien/${eventArticles[0].id}`} style={{background: '#0284c7', color: '#fff', border: 'none', padding: '12px 0', width: '100%', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.05rem', cursor: 'pointer', transition: 'background 0.3s', boxShadow: '0 4px 10px rgba(2,132,199,0.3)'}}>
                        Đăng Ký Tham Gia Ngay ➔
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{padding: '20px', textAlign: 'center', color: '#64748b'}}>Chưa có sự kiện nổi bật</div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* DẢI 2: PHÚT DỪNG LẠI & ÂM NHẠC */}
      <section style={{padding: '15px 0'}}>
        <div className="container">
          <div className={styles.mainLayout}>
            
            {/* Col 1: Hình ảnh Giới trẻ Giáo phận (2/3 chiều rộng) */}
            <div className={styles.categoryBlock} style={{gridColumn: '1 / span 2', overflow: 'hidden'}}>
              <div className="section-header">
                <span style={{color: 'var(--color-brand-cyan)'}}>📸</span>
                <h2 className="section-title">Hình ảnh Giới trẻ Giáo phận</h2>
              </div>
              
              <div style={{background: 'var(--color-bg-secondary)', padding: '20px', borderRadius: '12px', display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch'}}>
                <div className="album-ticker-track" style={{display: 'flex', gap: '20px'}}>
                  {featuredAlbums.length > 0 ? featuredAlbums.map((album) => (
                    <a href={`/hinh-anh/${album.id}`} key={album.id} style={{display: 'flex', gap: '20px', flexShrink: 0, textDecoration: 'none'}}>
                      <div style={{width: '240px', flexShrink: 0}}>
                        <img loading="lazy" src={album.thumbnailUrl} style={{width: '100%', height: '160px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}} alt={album.title} />
                        <h4 style={{marginTop: '10px', fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--color-text-main)', lineHeight: 1.3}}>{album.title}</h4>
                        <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '4px'}}>{new Date(album.date).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </a>
                  )) : (
                    <div style={{color: '#64748b'}}>Chưa có hình ảnh nổi bật</div>
                  )}
                </div>
              </div>
            </div>

            {/* Col 2: Không Gian Âm Nhạc */}
            <div className={styles.categoryBlock}>
              <div className="section-header">
                <span style={{color: 'var(--color-brand-red)'}}>🎸</span>
                <h2 className="section-title">Không Gian Thánh Ca</h2>
              </div>
              <div style={{padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
                {featuredVideo ? (
                  <div dangerouslySetInnerHTML={{ __html: featuredVideo.content }} style={{ flexGrow: 1, overflow: 'hidden' }} />
                ) : (
                  <div style={{padding: '40px 20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    Đang cập nhật video Thánh Ca...
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* FLOATING AUDIO PLAYER */}
      <RadioPlayer />
    </>
  );
}
