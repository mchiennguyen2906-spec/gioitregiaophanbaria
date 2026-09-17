"use client";
import { useState } from 'react';
import DonateButton from './DonateButton';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const toggleMenu = () => setIsOpen(!isOpen);

  const toggleSub = (e: React.MouseEvent, menuName: string) => {
    e.preventDefault(); // Ngăn chuyển trang khi bấm vào thư mục cha
    if (openSubmenu === menuName) {
      setOpenSubmenu(null);
    } else {
      setOpenSubmenu(menuName);
    }
  };

  return (
    <div className="mobile-menu-wrapper">
      <div className="mobile-menu-header">
        <button onClick={toggleMenu} className="hamburger-btn">
          {isOpen ? '✖' : '☰'} MENU
        </button>
        <div style={{ marginLeft: 'auto' }}>
          <DonateButton />
        </div>
      </div>

      {isOpen && (
        <div className="mobile-menu-overlay">
          <ul className="mobile-nav-list">
            <li><a href="/">TRANG CHỦ</a></li>
            
            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'ban-tin')}>BẢN TIN <span className="caret">{openSubmenu === 'ban-tin' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'ban-tin' && (
                <ul className="mobile-sub-list">
                  <li><a href="/ban-tin/giao-phan">Tin tức Giới trẻ Giáo phận</a></li>
                  <li><a href="/ban-tin/giao-xu">Tin tức Giới trẻ các Giáo xứ</a></li>
                  <li><a href="/ban-tin/phong-trao">Sinh hoạt các Phong trào</a></li>
                  <li><a href="/ban-tin/lich-hoat-dong">Lịch hoạt động Giáo xứ</a></li>
                  <li><a href="/ban-tin/guong-mat">Gương mặt truyền cảm hứng</a></li>
                </ul>
              )}
            </li>
            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'kinh-thanh')}>KINH THÁNH & GIÁO LÝ <span className="caret">{openSubmenu === 'kinh-thanh' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'kinh-thanh' && (
                <ul className="mobile-sub-list">
                  <li><a href="/kinh-thanh/phuc-am">Học hỏi Phúc Âm</a></li>
                  <li><a href="/kinh-thanh/giao-ly">Giáo lý Hội Thánh</a></li>
                  <li><a href="/kinh-thanh/loi-chua">Lời Chúa Mỗi Ngày</a></li>
                  <li><a href="/kinh-thanh/suy-niem">Suy niệm Tin mừng Chúa nhật</a></li>
                </ul>
              )}
            </li>

            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'dao-tao')}>ĐÀO TẠO & ĐĂNG KÝ <span className="caret">{openSubmenu === 'dao-tao' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'dao-tao' && (
                <ul className="mobile-sub-list">
                  <li><a href="/dao-tao/lich-hoc">Lịch Khóa học</a></li>
                  <li><a href="/dao-tao/su-kien">Lịch Sự kiện</a></li>
                </ul>
              )}
            </li>

            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'ky-nang')}>KỸ NĂNG & HUẤN LUYỆN <span className="caret">{openSubmenu === 'ky-nang' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'ky-nang' && (
                <ul className="mobile-sub-list">
                  <li><a href="/ky-nang/huong-dao-sinh">Hoạt động Hướng Đạo Sinh</a></li>
                  <li><a href="/ky-nang/leu-trai">Kỹ năng Lều trại & Nút dây</a></li>
                  <li><a href="/ky-nang/quan-tro">Quản trò & Trò chơi Sinh hoạt</a></li>
                  <li><a href="/ky-nang/lanh-dao">Kỹ năng Lãnh đạo & Làm việc nhóm</a></li>
                </ul>
              )}
            </li>

            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'cam-nang')}>CẨM NANG GIỚI TRẺ <span className="caret">{openSubmenu === 'cam-nang' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'cam-nang' && (
                <ul className="mobile-sub-list">
                  <li><a href="/cam-nang/tinh-yeu">Kiến thức Tình yêu & Hôn nhân</a></li>
                  <li><a href="/cam-nang/bi-tich">Hướng dẫn Lãnh nhận Bí tích</a></li>
                  <li><a href="/cam-nang/thu-tuc">Thủ tục Hôn phối & Khác đạo</a></li>
                  <li><a href="/cam-nang/bieu-mau">Tải biểu mẫu & Văn bản</a></li>
                </ul>
              )}
            </li>

            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'su-kien')} style={{color: 'var(--color-brand-red)', fontWeight: 'bold'}}>SỰ KIỆN & THIỆN NGUYỆN <span className="caret">{openSubmenu === 'su-kien' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'su-kien' && (
                <ul className="mobile-sub-list">
                  <li><a href="/su-kien/dai-hoi">Đại hội & Hội trại Giới trẻ</a></li>
                  <li><a href="/su-kien/mua-he-xanh">Mùa Hè Xanh & Caritas</a></li>
                  <li><a href="/su-kien/tinh-tam">Khóa Tĩnh tâm & Sinh viên</a></li>
                  <li><a href="/su-kien/hinh-anh">Hình ảnh Giới trẻ Giáo phận</a></li>
                </ul>
              )}
            </li>

            <li>
              <a href="#" onClick={(e) => toggleSub(e, 'media')}>MEDIA & TÂM LÝ <span className="caret">{openSubmenu === 'media' ? '▴' : '▾'}</span></a>
              {openSubmenu === 'media' && (
                <ul className="mobile-sub-list">
                  <li><a href="/media/tam-ly">Góc Tâm lý & Khủng hoảng</a></li>
                  <li><a href="/media/podcast">Podcast Trò chuyện</a></li>
                  <li><a href="/media/thanh-ca">Thánh ca Acoustic</a></li>
                </ul>
              )}
            </li>
            
          </ul>
        </div>
      )}
    </div>
  );
}
