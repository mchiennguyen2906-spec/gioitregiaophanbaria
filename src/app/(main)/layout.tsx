import type { Metadata } from "next";
import "../globals.css";
import DonateButton from "../components/DonateButton";
import MobileMenu from "../components/MobileMenu";
import MassTicker from "../components/MassTicker";
import BibleTicker from "../components/BibleTicker";
import MainFooter from "../components/MainFooter";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Giới Trẻ Giáo Phận Bà Rịa",
  description: "Trang thông tin cộng đồng Giới trẻ Giáo phận Bà Rịa - Cập nhật sự kiện, hoạt động tình nguyện, và nhịp sống trẻ.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body>
        <header>
          {/* THANH LỜI CHÚA (BIBLE TICKER) Ở ĐỈNH TRANG */}
          <BibleTicker />
          
          {/* Header Banner */}
          <div className="header-banner">
            <div className="container header-content">
              <div className="header-left" style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div className="header-logo" style={{flex: 'unset'}}>
                  <img src="/logo_gioitre_new.png" alt="Logo Giới Trẻ Bà Rịa" />
                </div>
                <div className="header-title" style={{flex: 'unset', alignItems: 'flex-start', padding: 0, textAlign: 'left'}}>
                  <div className="title-top">GIỚI TRẺ</div>
                  <div className="title-bottom">GIÁO PHẬN BÀ RỊA</div>
                </div>
              </div>
              
              {/* Right side with Image Background and Slogan */}
              <div className="header-right-bg" style={{flex: 1, position: 'relative', display: 'flex', justifyContent: 'flex-start', alignItems: 'center', marginLeft: '20px', borderRadius: '12px', overflow: 'hidden', minHeight: '130px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)'}}>
                <Image 
                  src="/chua-kito-vua.png" 
                  alt="Chúa Kitô Vua" 
                  fill
                  style={{objectFit: 'cover', objectPosition: 'center 30%', zIndex: 1, transform: 'scaleX(-1)'}} 
                  priority
                />
                
                <div className="header-slogan" style={{position: 'relative', zIndex: 3, padding: '0 30px', flex: 'unset'}}>
                  <p style={{margin: 0, paddingLeft: '15px', borderLeft: '4px solid var(--color-brand-red)', textAlign: 'left', color: '#ffffff', textShadow: '0 2px 5px rgba(0,0,0,0.5)', whiteSpace: 'nowrap'}}>
                    NƠI KẾT NỐI VÀ CHIA SẺ ĐỨC TIN<br />CỦA GIỚI TRẺ GIÁO PHẬN
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Bar - New Youth Architecture */}
          <nav className="main-nav">
            <div className="container">
              <ul className="nav-list">
                <li className="nav-item">
                  <a href="/" className="nav-link">TRANG CHỦ</a>
                </li>
                
                <li className="nav-item">
                  <a href="#" className="nav-link">BẢN TIN ▾</a>
                  <div className="dropdown-menu">
                    <a href="/ban-tin/giao-phan" className="dropdown-item">Tin tức Giới trẻ Giáo phận</a>
                    <a href="/ban-tin/giao-xu" className="dropdown-item">Tin tức Giới trẻ các Giáo xứ</a>
                    <a href="/ban-tin/phong-trao" className="dropdown-item">Sinh hoạt các Phong trào</a>
                    <a href="/ban-tin/lich-hoat-dong" className="dropdown-item">Lịch hoạt động Giáo xứ</a>
                    <a href="/ban-tin/guong-mat" className="dropdown-item">Gương mặt truyền cảm hứng</a>
                  </div>
                </li>
                <li className="nav-item">
                  <a href="#" className="nav-link">KINH THÁNH & GIÁO LÝ ▾</a>
                  <div className="dropdown-menu">
                    <a href="/kinh-thanh/phuc-am" className="dropdown-item">Học hỏi Phúc Âm</a>
                    <a href="/kinh-thanh/giao-ly" className="dropdown-item">Giáo lý Hội Thánh</a>
                    <a href="/kinh-thanh/loi-chua" className="dropdown-item">Lời Chúa Mỗi Ngày</a>
                    <a href="/kinh-thanh/suy-niem" className="dropdown-item">Suy niệm Tin mừng Chúa nhật</a>
                  </div>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link">ĐÀO TẠO & ĐĂNG KÝ ▾</a>
                  <div className="dropdown-menu">
                    <a href="/dao-tao/lich-hoc" className="dropdown-item">Lịch Khóa học</a>
                    <a href="/dao-tao/su-kien" className="dropdown-item">Lịch Sự kiện</a>
                  </div>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link">KỸ NĂNG & HUẤN LUYỆN ▾</a>
                  <div className="dropdown-menu">
                    <a href="/ky-nang/huong-dao-sinh" className="dropdown-item">Hoạt động Hướng Đạo Sinh</a>
                    <a href="/ky-nang/leu-trai" className="dropdown-item">Kỹ năng Lều trại & Nút dây</a>
                    <a href="/ky-nang/quan-tro" className="dropdown-item">Quản trò & Trò chơi Sinh hoạt</a>
                    <a href="/ky-nang/lanh-dao" className="dropdown-item">Kỹ năng Lãnh đạo & Làm việc nhóm</a>
                  </div>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link">CẨM NANG GIỚI TRẺ ▾</a>
                  <div className="dropdown-menu">
                    <a href="/cam-nang/tinh-yeu" className="dropdown-item">Kiến thức Tình yêu & Hôn nhân</a>
                    <a href="/cam-nang/bi-tich" className="dropdown-item">Hướng dẫn Lãnh nhận Bí tích</a>
                    <a href="/cam-nang/thu-tuc" className="dropdown-item">Thủ tục Hôn phối & Khác đạo</a>
                    <a href="/cam-nang/bieu-mau" className="dropdown-item">Tải biểu mẫu & Văn bản</a>
                  </div>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link" style={{color: 'var(--color-brand-red)', fontWeight: 'bold'}}>SỰ KIỆN & THIỆN NGUYỆN ▾</a>
                  <div className="dropdown-menu">
                    <a href="/su-kien/dai-hoi" className="dropdown-item">Đại hội & Hội trại Giới trẻ</a>
                    <a href="/su-kien/mua-he-xanh" className="dropdown-item">Mùa Hè Xanh & Caritas</a>
                    <a href="/su-kien/tinh-tam" className="dropdown-item">Khóa Tĩnh tâm & Sinh viên</a>
                    <a href="/su-kien/hinh-anh" className="dropdown-item">Hình ảnh Giới trẻ Giáo phận</a>
                  </div>
                </li>

                <li className="nav-item">
                  <a href="#" className="nav-link">MEDIA & TÂM LÝ ▾</a>
                  <div className="dropdown-menu">
                    <a href="/media/tam-ly" className="dropdown-item">Góc Tâm lý & Khủng hoảng</a>
                    <a href="/media/podcast" className="dropdown-item">Podcast Trò chuyện</a>
                    <a href="/media/thanh-ca" className="dropdown-item">Thánh ca Acoustic</a>
                  </div>
                </li>
                
                {/* Nút Quyên Góp Nổi bật (Đẩy sát lề phải) */}
                <li className="nav-item" style={{marginLeft: 'auto', display: 'flex', alignItems: 'center'}}>
                  <DonateButton />
                </li>
              </ul>
            </div>
          </nav>
          
          {/* MOBILE MENU (CHỈ HIỆN TRÊN ĐIỆN THOẠI) */}
          <MobileMenu />

        </header>

        {/* THANH GIỜ LỄ HÔM NAY (CHẠY NGANG TRÊN CÙNG) */}
        <MassTicker />

        <main>{children}</main>
        
        {/* FOOTER */}
        <MainFooter />
      </body>
    </html>
  );
}
