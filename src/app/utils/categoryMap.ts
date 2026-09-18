export const categoryMap: Record<string, string> = {
  "ban-tin": "Bản Tin",
  "kinh-thanh": "Kinh Thánh & Giáo Lý",
  "dao-tao": "Đào Tạo & Đăng Ký",
  "ky-nang": "Kỹ Năng & Huấn Luyện",
  "cam-nang": "Cẩm Nang Giới Trẻ",
  "su-kien": "Sự Kiện & Thiện Nguyện",
  "media": "Media & Tâm Lý",
};

export const slugMap: Record<string, string> = {
  "giao-phan": "Tin tức Giới trẻ Giáo phận",
  "giao-xu": "Tin tức Giới trẻ các Giáo xứ",
  "phong-trao": "Sinh hoạt các Phong trào",
  "lich-hoat-dong": "Lịch hoạt động Giáo xứ",
  "guong-mat": "Gương mặt truyền cảm hứng",
  "phuc-am": "Học hỏi Phúc Âm",
  "giao-ly": "Giáo lý Hội Thánh",
  "loi-chua": "Lời Chúa Mỗi Ngày",
  "suy-niem": "Suy niệm Tin mừng Chúa nhật",
  "lich-hoc": "Lịch học Khai giảng",
  "su-kien": "Đăng ký Khóa học - Sự kiện", 
  "huong-dao-sinh": "Hoạt động Hướng Đạo Sinh",
  "leu-trai": "Kỹ năng Lều trại & Nút dây",
  "quan-tro": "Quản trò & Trò chơi Sinh hoạt",
  "lanh-dao": "Kỹ năng Lãnh đạo & Làm việc nhóm",
  "tinh-yeu": "Kiến thức Tình yêu & Hôn nhân",
  "bi-tich": "Hướng dẫn Lãnh nhận Bí tích",
  "thu-tuc": "Thủ tục Hôn phối & Khác đạo",
  "bieu-mau": "Tải biểu mẫu & Văn bản",
  "dai-hoi": "Đại hội & Hội trại Giới trẻ",
  "mua-he-xanh": "Mùa Hè Xanh & Caritas",
  "tinh-tam": "Khóa Tĩnh tâm & Sinh viên",
  "hinh-anh": "Hình ảnh Giới trẻ Giáo phận",
  "tam-ly": "Góc Tâm lý & Khủng hoảng",
  "podcast": "Podcast Trò chuyện",
  "thanh-ca": "Thánh ca Acoustic",
  "giao-hoi-hoan-vu": "Thời sự Giáo hội Hoàn vũ",
  "giao-hoi-viet-nam": "Thời sự Giáo hội Việt Nam",
};

export const categoryHierarchy: Record<string, string[]> = {
  "ban-tin": ["giao-phan", "giao-xu", "phong-trao", "lich-hoat-dong", "guong-mat", "giao-hoi-hoan-vu", "giao-hoi-viet-nam"],
  "kinh-thanh": ["phuc-am", "giao-ly", "loi-chua", "suy-niem"],
  "dao-tao": ["lich-hoc", "su-kien"],
  "ky-nang": ["huong-dao-sinh", "leu-trai", "quan-tro", "lanh-dao"],
  "cam-nang": ["tinh-yeu", "bi-tich", "thu-tuc", "bieu-mau"],
  "su-kien": ["dai-hoi", "mua-he-xanh", "tinh-tam"],
  "media": ["hinh-anh", "tam-ly", "podcast", "thanh-ca"]
};

export function getTitle(category: string, slug?: string) {
  const catName = categoryMap[category] || category;
  if (slug) {
    const slugName = slugMap[slug] || slug;
    return `${catName} / ${slugName}`;
  }
  return catName;
}
