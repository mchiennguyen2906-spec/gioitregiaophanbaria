"use client";
import { useState, useEffect } from 'react';
import styles from './page.module.css';
import MassTicker from "./components/MassTicker";
import RadioPlayer from "./components/RadioPlayer";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentCharitySlide, setCurrentCharitySlide] = useState(0);

  const slides = [
    {
      img: "/hero_cathedral_1789327489297.jpg",
      title: "Thánh lễ tạ ơn mừng Kim Khánh Linh Mục của Đức Cha GB. Bùi Tuần",
      desc: "Sáng nay ngày 20/09/2026, toàn thể giáo phận hân hoan quy tụ về nhà thờ Chánh Tòa để hiệp dâng thánh lễ tạ ơn vô cùng trang trọng do chính Đức Cố Giám mục chủ tế..."
    },
    {
      img: "/hero_mass_1789327504165.jpg",
      title: "Khai mạc Thượng Hội Đồng Giám Mục Thế Giới tại Rome",
      desc: "Đức Thánh Cha Phanxicô đã chính thức khai mạc Thượng Hội Đồng với sự tham dự của các giám mục từ khắp nơi trên thế giới, nhấn mạnh tinh thần hiệp hành..."
    },
    {
      img: "/news_choir_1789327541049.jpg",
      title: "Thông báo tuyển sinh Đại Chủng Viện Thánh Quý",
      desc: "Đại Chủng Viện Thánh Quý thông báo kỳ thi tuyển sinh năm học 2026-2027 dành cho các ứng sinh linh mục đến từ các giáo phận trong khu vực ĐBSCL..."
    }
  ];

  const charitySlides = [
    {
      title: 'Chương trình "Bữa cơm nụ cười" giúp đỡ bệnh nhân nghèo',
      desc: 'Ban Caritas Giáo phận phối hợp cùng các tình nguyện viên giới trẻ hằng tuần tổ chức phát hàng ngàn suất ăn miễn phí cho các bệnh nhân có hoàn cảnh khó khăn tại các bệnh viện tuyến tỉnh.',
      quote: '"Mỗi khi các ngươi làm việc đó cho một trong những người bé mọn nhất của anh em Ta, là các ngươi đã làm cho chính Ta." (Mt 25, 40)',
      img: '/news_community_1789327516209.jpg'
    },
    {
      title: 'Quỹ Cứu Trợ Đồng Bào Vùng Bão Lụt',
      desc: 'Hỗ trợ tái thiết nhà cửa và cấp nhu yếu phẩm cho đồng bào miền núi sau cơn bão số 3. Sự sẻ chia của quý vị là nguồn động viên to lớn cho bà con vượt qua khó khăn.',
      quote: '"Ai có hai áo, thì chia cho người không có; ai có gì ăn, thì cũng làm như vậy." (Lc 3,11)',
      img: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb0?q=80&w=800&auto=format&fit=crop'
    },
    {
      title: 'Học Bổng "Chắp Cánh Ước Mơ" Sinh Viên Nghèo',
      desc: 'Chương trình trao tặng 500 suất học bổng toàn phần cho các sinh viên có hoàn cảnh đặc biệt khó khăn nhưng đạt thành tích học tập xuất sắc trong năm học 2026-2027.',
      quote: '"Người gieo trong nước mắt, sẽ gặt giữa tiếng cười." (Tv 126, 5)',
      img: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?q=80&w=800&auto=format&fit=crop'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 4000); 
    return () => clearInterval(timer);
  }, [slides.length]);

  useEffect(() => {
    const charityTimer = setInterval(() => {
      setCurrentCharitySlide((prev) => (prev + 1) % charitySlides.length);
    }, 4500); 
    return () => clearInterval(charityTimer);
  }, [charitySlides.length]);

  const prevHeroSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextHeroSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const prevCharitySlide = () => setCurrentCharitySlide((prev) => (prev - 1 + charitySlides.length) % charitySlides.length);
  const nextCharitySlide = () => setCurrentCharitySlide((prev) => (prev + 1) % charitySlides.length);

  return (
    <>
      <div className="container">
        {/* HERO SECTION - 2 Column Asymmetrical */}
        <section className={styles.heroGrid} style={{marginTop: '40px'}}>
        
          {/* Col 1: Slider Lớn (2.2fr) */}
          <div className={`${styles.heroSlider} slider-hover-container`} style={{position: 'relative', overflow: 'hidden'}}>
            <img src={slides[currentSlide].img} className={styles.sliderImg} alt="News" style={{transition: 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)'}} />
            <div className={styles.sliderText} style={{transition: 'all 0.4s ease-in-out', padding: '30px', background: 'linear-gradient(to top, rgba(15, 23, 42, 0.9), transparent)'}}>
              <h3 className="text-fluid-hero" style={{color: '#fff'}}>{slides[currentSlide].title}</h3>
              <p style={{fontSize: '1.05rem', color: '#f1f5f9', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginTop: '10px'}}>{slides[currentSlide].desc}</p>
            </div>
            
            {/* Arrows */}
            <button className="slider-arrow arrow-left" onClick={prevHeroSlide}>❮</button>
            <button className="slider-arrow arrow-right" onClick={nextHeroSlide}>❯</button>

            {/* Progress Indicators */}
            <div style={{position: 'absolute', bottom: '30px', right: '30px', display: 'flex', gap: '8px', zIndex: 10}}>
              {slides.map((_, idx) => (
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
          </div>

          {/* Col 2: Thông Báo (1fr) */}
          <div className={styles.heroNewsBox}>
            <div className="section-header" style={{borderBottom: '1px solid var(--color-brand-cyan)', padding: '0 0 10px 0', marginBottom: '20px'}}>
              <h2 className="section-title" style={{fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--color-brand-cyan)'}}>Tin Tức Đáng Chú Ý</h2>
            </div>
            <div className={styles.newsListTop}>
              {[
                "Thư Mục Vụ Mùa Chay 2026 của Đức Giám Mục Giáo phận", 
                "Quyết định thuyên chuyển các linh mục đợt 2 năm 2026", 
                "Thông báo về việc tổ chức Đại Hội Giới Trẻ Giáo tỉnh",
                "Khóa tĩnh tâm năm của linh mục đoàn giáo phận"
              ].map((title, i) => (
                <div key={i} className={styles.newsItemSmall}>
                  <div style={{width: '70px', height: '70px', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                    <span style={{color: 'var(--color-brand-red)', fontWeight: 'bold', fontSize: '1.4rem', lineHeight: 1}}>2{i}</span>
                    <span style={{fontSize: '0.7rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px'}}>Tháng 9</span>
                  </div>
                  <a href="#" className={styles.newsTitleSmall} style={{flex: 1, fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-heading)'}}>{title}</a>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {/* DẢI 1: TIN TỨC & LỜI CHÚA */}
      <section style={{padding: '30px 0'}}>
        <div className="container">
          <div className={styles.mainLayout}>
        {/* === HÀNG 1 === */}
        {/* Col 1 */}
        <div className={styles.categoryBlock}>
          <div className="section-header">
            <span style={{color: 'var(--color-brand-gold)'}}>✚</span>
            <h2 className="section-title">Tin Tức Giáo Phận</h2>
          </div>
          <div className={styles.categoryTop}>
            <img src="/news_choir_1789327541049.jpg" className={styles.categoryMainImg} alt="News" />
            <a href="#" style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '5px'}}>Lễ tạ ơn khánh thành và cung hiến nhà thờ giáo xứ Tân Lập</a>
            <p className={styles.excerpt}>Đức Giám Mục Giáo phận đã chủ sự thánh lễ tạ ơn và nghi thức cung hiến bàn thờ mới trong niềm hân hoan của hàng ngàn giáo dân...</p>
          </div>
          <ul className={styles.categoryTitleList}>
            <li><a href="#">Thường huấn linh mục đợt 2 năm 2026 tại Trung tâm Mục vụ</a></li>
            <li><a href="#">Hình ảnh Rước kiệu Đức Mẹ Tháng Mân Côi</a></li>
          </ul>
          <div className={styles.viewMoreBox}>
            <a href="/tin-giao-phan" className={styles.viewMoreBtn}>Xem tất cả ➔</a>
          </div>
        </div>

        {/* Col 2 */}
        <div className={styles.categoryBlock}>
          <div className="section-header">
            <span style={{color: 'var(--color-brand-gold)'}}>✚</span>
            <h2 className="section-title">Lời Chúa & Suy Niệm</h2>
          </div>
          <div className={styles.categoryTop}>
            <img src="/hero_cathedral_1789327489297.jpg" className={styles.categoryMainImg} alt="Bible" />
            <a href="#" style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '5px'}}>Suy niệm Phúc âm hằng ngày: Thứ Tư tuần 24 TN</a>
            <p className={styles.excerpt}>"Chúng tôi thổi sáo, sao các người không múa nhảy; chúng tôi hát bài đưa đám, sao các người không khóc than?"...</p>
          </div>
          <ul className={styles.categoryTitleList}>
            <li><a href="#" style={{color: 'var(--color-brand-cyan)', fontWeight: 600}}>Tâm linh tu đức: Lặng lẽ bên Chúa Giêsu Thánh Thể</a></li>
            <li><a href="#">Suy niệm Chúa Nhật 25 Thường Niên: Trở nên người phục vụ</a></li>
          </ul>
          <div className={styles.viewMoreBox}>
            <a href="/loi-chua" className={styles.viewMoreBtn}>Xem tất cả ➔</a>
          </div>
        </div>

        {/* Col 3 */}
        <div className={styles.categoryBlock} style={{background: 'transparent', border: 'none'}}>
          {/* Lịch Phụng Vụ */}
          <div style={{display: 'flex', flexDirection: 'column', flexGrow: 1}}>
            <div className="section-header" style={{borderBottom: '2px solid var(--color-brand-red)'}}>
              <h2 className="section-title">Lịch Phụng Vụ</h2>
            </div>
            <div style={{background: '#fff', border: '1px solid var(--border-color)', borderTop: 'none', padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
              <h4 style={{color: 'var(--color-brand-red)', margin: '0 0 15px 0', borderBottom: '2px solid #f1f5f9', paddingBottom: '5px'}}>THÁNG 9/2026</h4>
              <ul style={{listStyle: 'none', fontSize: '0.9rem', margin: 0, padding: 0}}>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>14/09:</strong> 
                   <span>Suy Tôn Thánh Giá (Lễ kính)</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>15/09:</strong> 
                   <span>Đức Mẹ Sầu Bi</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>20/09:</strong> 
                   <span>Chúa Nhật 25 TN (Áo Xanh)</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>21/09:</strong> 
                   <span>Thánh Matthêu Tông Đồ</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>23/09:</strong> 
                   <span>Thánh Piô Pietrelcina</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>27/09:</strong> 
                   <span>Thánh Vinh Sơn Phaolô</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>29/09:</strong> 
                   <span>Các Tổng Lãnh Thiên Thần</span>
                 </li>
                 <li style={{marginBottom: '10px', display: 'flex', gap: '10px'}}>
                   <strong style={{color: 'var(--color-brand-cyan)'}}>30/09:</strong> 
                   <span>Thánh Giêrônimô, Lm tsHT</span>
                 </li>
              </ul>
              
              <div style={{marginTop: 'auto', paddingTop: '20px', textAlign: 'right'}}>
                <a href="/lich-phung-vu" className={styles.viewMoreBtn}>Xem toàn bộ lịch ➔</a>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </section>

      {/* DẢI 2: GIÁO HỘI & MỤC VỤ */}
      <section style={{padding: '30px 0'}}>
        <div className="container">
          <div className={styles.mainLayout}>
        {/* === HÀNG 2 === */}
        {/* Col 1 */}
        <div className={styles.categoryBlock}>
          <div className="section-header">
            <span style={{color: 'var(--color-brand-gold)'}}>✚</span>
            <h2 className="section-title">Tin Giáo Hội Toàn Cầu</h2>
          </div>
          <div className={styles.categoryTop}>
            <img src="/news_vatican_1789327528906.jpg" className={styles.categoryMainImg} alt="Vatican" />
            <a href="#" style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '5px'}}>Đức Thánh Cha Phanxicô công bố Tông sắc Năm Thánh 2025</a>
            <p className={styles.excerpt}>Năm Thánh 2025 với chủ đề "Những người hành hương của Hy vọng" sẽ chính thức bắt đầu vào đêm Giáng Sinh...</p>
          </div>
          <ul className={styles.categoryTitleList}>
            <li><a href="#">Hội đồng Giám mục Việt Nam họp Đại hội thường niên</a></li>
            <li><a href="#">Thống kê số lượng người Công giáo thế giới mới nhất</a></li>
          </ul>
          <div className={styles.viewMoreBox}>
            <a href="/tin-giao-hoi" className={styles.viewMoreBtn}>Xem tất cả ➔</a>
          </div>
        </div>

        {/* Col 2 */}
        <div className={styles.categoryBlock}>
          <div className="section-header">
            <span style={{color: 'var(--color-brand-gold)'}}>✚</span>
            <h2 className="section-title">Mục Vụ Ban Ngành</h2>
          </div>
          <div className={styles.categoryTop}>
            <img src="/news_community_1789327516209.jpg" className={styles.categoryMainImg} alt="Giao Xu" />
            <a href="#" style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '5px'}}>Giới Trẻ & Sinh Viên: Trại hè "Vươn Lên"</a>
            <p className={styles.excerpt}>Hơn 300 bạn trẻ đã tham dự kỳ trại hè kéo dài 3 ngày 2 đêm đầy sôi động và ý nghĩa đức tin...</p>
          </div>
          <ul className={styles.categoryTitleList}>
            <li><a href="#">Caritas Bác Ái: Cứu trợ khẩn cấp đồng bào vùng bão lũ</a></li>
            <li><a href="#">Gia Đình & Hôn Nhân: Tầm quan trọng của giờ kinh tối</a></li>
          </ul>
          <div className={styles.viewMoreBox}>
            <a href="/muc-vu" className={styles.viewMoreBtn}>Xem tất cả ➔</a>
          </div>
        </div>

        {/* Col 3 */}
        <div className={styles.categoryBlock}>
          <div className="section-header">
            <span style={{color: 'var(--color-brand-gold)'}}>✚</span>
            <h2 className="section-title">Văn Kiện Giáo Hội</h2>
          </div>
          <div className={styles.categoryTop}>
            <img src="/hero_mass_1789327504165.jpg" className={styles.categoryMainImg} alt="Van Kien" />
            <a href="#" style={{fontWeight: '700', color: 'var(--color-text-main)', fontSize: '1.1rem', lineHeight: 1.4, marginTop: '5px'}}>Tuyên ngôn "Dignitas Infinita" về Phẩm giá Con người</a>
          </div>
          <ul className={styles.categoryTitleList}>
            <li><a href="#">Tông huấn Christus Vivit (Chúa Kitô Đang Sống)</a></li>
            <li><a href="#">Sắc lệnh về Hoạt động Truyền giáo (Ad Gentes)</a></li>
          </ul>
          <div className={styles.viewMoreBox}>
            <a href="/thu-vien" className={styles.viewMoreBtn}>Tải toàn bộ Văn Kiện ➔</a>
          </div>
        </div>
          </div>
        </div>
      </section>

      {/* DẢI TỪ THIỆN & BÁC ÁI (Caritas) - Bố cục đặc biệt */}
      <section className="slider-hover-container" style={{padding: '60px 0', background: '#f8fafc', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', position: 'relative', overflow: 'hidden'}}>
        <div className="container" style={{position: 'relative'}}>
          <div className="section-header" style={{borderBottom: 'none', justifyContent: 'center', marginBottom: '20px'}}>
            <span style={{color: 'var(--color-brand-red)'}}>❤️</span>
            <h2 className="section-title" style={{color: 'var(--color-brand-red)', textAlign: 'center'}}>Hoạt Động Bác Ái & Xã Hội</h2>
          </div>
          
          <div style={{width: '100%', overflow: 'hidden'}}>
            <div style={{
              display: 'flex', 
              width: `${charitySlides.length * 100}%`,
              transform: `translateX(-${currentCharitySlide * (100 / charitySlides.length)}%)`,
              transition: 'transform 0.6s cubic-bezier(0.25, 1, 0.5, 1)'
            }}>
              {charitySlides.map((slide, idx) => (
                <div key={idx} className={styles.charitySlideGrid} style={{width: `${100 / charitySlides.length}%`}}>
                  {/* Cột Ảnh */}
                  <div style={{overflow: 'hidden'}}>
                    <img src={slide.img} alt="Từ thiện" style={{width: '100%', aspectRatio: '16/10', objectFit: 'cover'}} />
                  </div>
                  
                  {/* Cột Nội dung */}
                  <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                    <h3 style={{fontSize: '1.8rem', lineHeight: 1.3, color: 'var(--color-text-heading)', margin: 0}}>{slide.title}</h3>
                    <p style={{fontSize: '1rem', color: '#64748b', lineHeight: 1.6, margin: 0}}>
                      {slide.desc}
                      <br/><br/>
                      <span style={{fontStyle: 'italic', fontWeight: 600, color: 'var(--color-text-main)'}}>{slide.quote}</span>
                    </p>
                    
                    <div style={{display: 'flex', gap: '15px', marginTop: '10px'}}>
                      <a href="#" style={{background: 'var(--color-brand-red)', color: 'white', padding: '12px 25px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--color-brand-red)', transition: 'all 0.3s'}}>
                        Tham gia tình nguyện ➔
                      </a>
                      <a href="#" style={{background: 'transparent', color: 'var(--color-text-heading)', padding: '12px 25px', fontSize: '0.9rem', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '8px', border: '1px solid var(--border-color)', transition: 'all 0.3s'}}>
                        Đóng góp quỹ Caritas
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Arrows */}
          <button className="slider-arrow arrow-left charity-arrow" style={{left: '-30px'}} onClick={prevCharitySlide}>❮</button>
          <button className="slider-arrow arrow-right charity-arrow" style={{right: '-30px'}} onClick={nextCharitySlide}>❯</button>
          
          {/* Dots */}
          <div style={{display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '30px'}}>
             {charitySlides.map((_, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setCurrentCharitySlide(idx)}
                  style={{
                    width: idx === currentCharitySlide ? '25px' : '8px', 
                    height: '8px', 
                    borderRadius: '4px',
                    background: idx === currentCharitySlide ? 'var(--color-brand-red)' : '#cbd5e1', 
                    transition: 'all 0.4s ease', 
                    cursor: 'pointer'
                  }}
                />
              ))}
          </div>

        </div>
      </section>

      {/* DẢI 3: TIỆN ÍCH & VIDEO */}
      <section style={{padding: '30px 0'}}>
        <div className="container">
          <div className={styles.mainLayout}>
        {/* === HÀNG 3 === */}
        {/* Col 1 */}
        <div className={styles.categoryBlock}>
          <div className="section-header" style={{marginBottom: 0}}>
            <span style={{color: 'var(--color-brand-red)'}}>✚</span>
            <h2 className="section-title">Cáo Phó - Cầu Nguyện</h2>
          </div>
          <div className={styles.categoryTop} style={{paddingBottom: '5px'}}>
            <a href="#" style={{fontWeight: 'bold', color: '#1e293b', fontSize: '1.05rem'}}>Cáo phó: Linh mục Giuse Trần Văn A được Chúa gọi về</a>
            <p style={{fontSize: '0.85rem', color: '#64748b'}}>Hưởng thọ 80 tuổi, 50 năm linh mục.</p>
          </div>
          <ul className={styles.categoryTitleList} style={{paddingTop: '5px'}}>
            <li><a href="#" style={{fontSize: '0.95rem'}}>Cáo phó: Nữ tu Maria Nguyễn Thị B (Dòng MTG)</a></li>
            <li><a href="#" style={{fontSize: '0.95rem'}}>Xin cầu nguyện cho linh hồn Đa-minh</a></li>
            <li><a href="#" style={{fontSize: '0.95rem'}}>Xin lễ tạ ơn mừng 50 năm hôn phối</a></li>
          </ul>
          <div className={styles.viewMoreBox}>
              <a href="/cao-pho" className={styles.viewMoreBtn} style={{color: '#333'}}>Xem tất cả ➔</a>
          </div>
        </div>

        {/* Col 2 */}
        <div className={styles.categoryBlock} style={{border: '1px solid var(--color-brand-gold)'}}>
          <div className="section-header" style={{marginBottom: 0}}>
            <span style={{color: 'var(--color-brand-gold)'}}>💡</span>
            <h2 className="section-title" style={{color: 'var(--color-brand-gold)'}}>Cẩm Nang Hướng Dẫn</h2>
          </div>
          <ul className={styles.categoryTitleList} style={{paddingTop: '15px'}}>
            <li><a href="#">[Hỏi - Đáp] Trẻ sơ sinh mấy tuổi thì được Rửa tội?</a></li>
            <li><a href="#">Thủ tục chuẩn bị học Giáo lý Hôn phối & Khác đạo</a></li>
            <li><a href="#">Hướng dẫn Tang chế và cách báo tang trong Giáo xứ</a></li>
            <li><a href="#">Quy định về việc Xức dầu Bệnh nhân</a></li>
          </ul>
          <div className={styles.viewMoreBox} style={{background: '#fffbeb', borderTopColor: '#fde68a'}}>
            <a href="/cam-nang" className={styles.viewMoreBtn} style={{color: '#d97706'}}>Xem thư viện Cẩm Nang ➔</a>
          </div>
        </div>

        {/* Col 3 */}
        <div className={styles.categoryBlock}>
          <div className="section-header" style={{marginBottom: 0}}>
            <h2 className="section-title">Video Thánh Lễ</h2>
          </div>
          <div style={{padding: '15px', flexGrow: 1, display: 'flex', flexDirection: 'column'}}>
            <div style={{width: '100%', height: '100%', minHeight: '200px', background: '#000', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '15px', borderRadius: '4px'}}>
              <span style={{fontSize: '3rem', opacity: 0.8}}>▶</span>
            </div>
            <a href="#" style={{fontSize: '1rem', fontWeight: 'bold', color: 'var(--color-brand-cyan)', textAlign: 'center', display: 'block'}}>Trực tiếp Thánh Lễ Chúa Nhật 25 Thường Niên</a>
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
