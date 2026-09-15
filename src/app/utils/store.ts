"use client";

// Định nghĩa cấu trúc Article chuẩn
export interface Article {
  id: string;
  categoryId: string; // Lấy từ categoryMap.ts
  title: string;
  excerpt?: string;
  content: string;
  author: string;
  parish?: string; // Giáo xứ
  date: string; // ISO date string
  thumbnailUrl?: string;
  audioUrl?: string; // Link file MP3
  status: 'published' | 'hidden';
  isFeatured?: boolean; // Nổi bật ở trang con
  isPriority?: boolean; // Ưu tiên ở trang con
  isHomeFeatured?: boolean; // Nổi bật ở TRANG CHỦ (tối đa 10 bài)
  isHomePriority?: boolean; // Ưu tiên ở TRANG CHỦ (tối đa 10 bài)
};

// Dữ liệu dummy mặc định nếu localStorage trống
export const defaultArticles: Article[] = [
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `default-${i}`,
    categoryId: 'giao-phan', 
    title: i === 0 ? `BÀI VIẾT QUAN TRỌNG NHẤT CỦA CHUYÊN MỤC` : `Bài viết mẫu số ${i + 1} với tiêu đề dài để test hiển thị`,
    excerpt: 'Đây là đoạn trích dẫn (sapo) cho bài viết, sẽ hiển thị ở ngoài danh sách để thu hút người đọc...',
    content: '<p>Nội dung mẫu...</p>',
    author: 'Ban TT',
    parish: 'Bà Rịa',
    thumbnailUrl: `https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=600&auto=format&fit=crop&sig=${i}`,
    date: new Date().toISOString(),
    status: 'published' as const,
    isFeatured: i === 0,
    isPriority: i === 1,
    isHomeFeatured: i < 3,
    isHomePriority: i >= 3 && i < 7
  })),
  // Kinh Thánh & Giáo Lý
  {
    id: 'kt-1', categoryId: 'phuc-am', title: 'Học hỏi Phúc âm Chúa nhật 25 thường niên Năm A - 2026', excerpt: 'Bài học rút ra từ Phúc Âm...', content: '<p>Nội dung</p>', author: 'Lm. Giuse', date: new Date().toISOString(), status: 'published', isFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'kt-2', categoryId: 'giao-ly', title: 'Giáo lý: Bí tích Thánh Thể', excerpt: 'Bí tích Thánh Thể là gì...', content: '<p>Nội dung</p>', author: 'Ban Giáo Lý', date: new Date(Date.now() - 86400000).toISOString(), status: 'published', isPriority: true
  },
  {
    id: 'kt-3', categoryId: 'phuc-am', title: 'Học hỏi Phúc âm: Chúa nhật 24 Thường niên năm A', excerpt: '...', content: '<p>Nội dung</p>', author: 'Lm. Giuse', date: new Date(Date.now() - 86400000*2).toISOString(), status: 'published'
  },
  // Lời Chúa Mỗi Ngày
  {
    id: 'lc-1', categoryId: 'loi-chua', title: 'Đức Mẹ sầu bi. Lễ nhớ. – Đứng gần thập giá.', excerpt: 'Lời Chúa hôm nay...', content: '<p>Nội dung</p>', author: 'Ban TT', date: new Date().toISOString(), status: 'published', thumbnailUrl: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?q=80&w=200&auto=format&fit=crop'
  },
  {
    id: 'lc-2', categoryId: 'loi-chua', title: 'SUY TÔN THÁNH GIÁ. Lễ kính. – Phải được giương cao.', excerpt: 'Lời Chúa hôm qua...', content: '<p>Nội dung</p>', author: 'Ban TT', date: new Date(Date.now() - 86400000).toISOString(), status: 'published'
  },
  {
    id: 'lc-3', categoryId: 'loi-chua', title: 'Chúa Nhật 24 Thường Niên Năm A.', excerpt: 'Lời Chúa tuần trước...', content: '<p>Nội dung</p>', author: 'Ban TT', date: new Date(Date.now() - 86400000 * 3).toISOString(), status: 'published'
  },
  // Thêm 2 bài Kinh Thánh Giáo Lý
  {
    id: 'kt-4', categoryId: 'giao-ly', title: 'Giáo lý Hội Thánh Công Giáo: Phần 1', excerpt: 'Tóm lược đức tin...', content: '<p>Nội dung</p>', author: 'Ban Giáo Lý', date: new Date().toISOString(), status: 'published'
  },
  {
    id: 'kt-5', categoryId: 'giao-ly', title: 'Kinh Thánh căn bản cho Giới trẻ', excerpt: 'Giới thiệu về Kinh Thánh...', content: '<p>Nội dung</p>', author: 'Lm. Giuse', date: new Date().toISOString(), status: 'published'
  },
  // Khóa học hay giảng
  {
    id: 'kh-1', categoryId: 'lich-hoc', title: 'Khóa Đào Tạo Giáo Lý Viên Cấp 1', excerpt: 'Khai giảng khóa mới dành cho các bạn trẻ...', content: '<p>Nội dung</p>', author: 'Ban Đào Tạo', date: new Date().toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'kh-2', categoryId: 'lich-hoc', title: 'Lớp Kỹ Năng Lãnh Đạo Giới Trẻ', excerpt: 'Học cách làm việc nhóm và dẫn dắt...', content: '<p>Nội dung</p>', author: 'Ban Kỹ Năng', date: new Date(Date.now() - 86400000).toISOString(), status: 'published', isHomeFeatured: true
  },
  // Sự kiện tâm điểm / Sứ vụ
  {
    id: 'sk-1', categoryId: 'su-kien', title: 'Đại Hội Giới Trẻ Giáo Phận 2026', excerpt: 'Sự kiện lớn nhất trong năm quy tụ hàng ngàn bạn trẻ...', content: '<p>Nội dung</p>', author: 'Ban Tổ Chức', date: new Date().toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'sk-2', categoryId: 'su-kien', title: 'Chiến Dịch Mùa Hè Xanh & Thiện Nguyện', excerpt: 'Cùng chung tay mang yêu thương đến vùng sâu vùng xa...', content: '<p>Nội dung</p>', author: 'Caritas', date: new Date(Date.now() - 86400000).toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=800&auto=format&fit=crop'
  },
  // Gương mặt
  {
    id: 'gm-1', categoryId: 'guong-mat', title: 'Người Trẻ Tiêu Biểu Trong Công Tác Mục Vụ', excerpt: 'Câu chuyện truyền cảm hứng về sự hy sinh...', content: '<p>Nội dung</p>', author: 'Maria Nguyễn', parish: 'Xứ Vũng Tàu', date: new Date().toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: 'gm-2', categoryId: 'guong-mat', title: 'Hành Trình Vượt Khó Của Bạn Trẻ Vùng Xa', excerpt: 'Nghị lực vươn lên trong cuộc sống và đức tin...', content: '<p>Nội dung</p>', author: 'Giuse Lê', parish: 'Xứ Xuyên Mộc', date: new Date(Date.now() - 86400000).toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=600&auto=format&fit=crop'
  },
  // Hình ảnh giới trẻ (Slider)
  {
    id: 'ha-1', categoryId: 'hinh-anh', title: 'Khoảnh Khắc Đẹp Đại Hội Giới Trẻ', excerpt: '', content: '', author: 'Ban Truyền Thông', date: new Date().toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'ha-2', categoryId: 'hinh-anh', title: 'Thánh Lễ Bổn Mạng Nhóm Giới Trẻ', excerpt: '', content: '', author: 'Ban Truyền Thông', date: new Date(Date.now() - 10000).toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1438232992991-995b7058bbb3?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'ha-3', categoryId: 'hinh-anh', title: 'Hoạt Động Dã Ngoại Mùa Hè', excerpt: '', content: '', author: 'Ban Truyền Thông', date: new Date(Date.now() - 20000).toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1533561052604-c3beb6fac0e7?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: 'ha-4', categoryId: 'hinh-anh', title: 'Giao Lưu Văn Nghệ Thánh Ca', excerpt: '', content: '', author: 'Ban Truyền Thông', date: new Date(Date.now() - 30000).toISOString(), status: 'published', isHomeFeatured: true, thumbnailUrl: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800&auto=format&fit=crop'
  }
];

// Seeder logic to inject dummy data once
if (typeof window !== 'undefined') {
  if (!localStorage.getItem('brvt_seeded_v1')) {
    const existing = localStorage.getItem('brvt_articles');
    let parsed: Article[] = [];
    if (existing) {
      try { parsed = JSON.parse(existing); } catch (e) {}
    }
    const existingIds = new Set(parsed.map(a => a.id));
    const missingDefaults = defaultArticles.filter(a => !existingIds.has(a.id));
    if (missingDefaults.length > 0) {
      localStorage.setItem('brvt_articles', JSON.stringify([...parsed, ...missingDefaults]));
    }
    localStorage.setItem('brvt_seeded_v1', 'true');
  }
}

// Khởi tạo và đọc dữ liệu từ LocalStorage
export const getArticlesFromStore = (): Article[] => {
  if (typeof window === 'undefined') return []; // SSR an toàn
  const data = localStorage.getItem('brvt_articles');
  if (data) {
    try {
      return JSON.parse(data);
    } catch(e) {
      return defaultArticles;
    }
  }
  return defaultArticles;
};

// Lưu dữ liệu vào LocalStorage
export const saveArticlesToStore = (articles: Article[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_articles', JSON.stringify(articles));
    // Trigger custom event để báo cho các component khác (trang chủ) re-render nếu cần
    window.dispatchEvent(new Event('storage_update'));
  }
};

// Thêm bài viết mới
export const addArticle = (article: Omit<Article, 'id' | 'date'>) => {
  const newArticle: Article = {
    ...article,
    id: `article-${Date.now()}`,
    date: new Date().toISOString()
  };
  const current = getArticlesFromStore();
  saveArticlesToStore([newArticle, ...current]);
};

// Cập nhật bài viết đã có
export const updateArticle = (id: string, updatedFields: Partial<Article>) => {
  const current = getArticlesFromStore();
  const updated = current.map(a => a.id === id ? { ...a, ...updatedFields } : a);
  saveArticlesToStore(updated);
};

// Xóa bài viết
export const deleteArticle = (id: string) => {
  const current = getArticlesFromStore();
  saveArticlesToStore(current.filter(a => a.id !== id));
};

// Đổi trạng thái Ẩn/Hiện
export const toggleArticleStatus = (id: string) => {
  const current = getArticlesFromStore();
  saveArticlesToStore(current.map(a => 
    a.id === id ? { ...a, status: a.status === 'published' ? 'hidden' : 'published' } : a
  ));
};

// ================= DONATION PROGRAMS =================

export interface DonationProgram {
  id: string;
  name: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  bankInfo: string;
  qrCodeUrl: string;
  linkedArticleId: string;
  createdAt: string; // ISO date
  isCompleted: boolean;
}

export const defaultDonations: DonationProgram[] = [
  {
    id: 'donation-1',
    name: 'Quỹ học bổng mồ côi',
    description: 'Hỗ trợ 50 em nhỏ mồ côi có hoàn cảnh khó khăn được đến trường.',
    targetAmount: 50000000,
    raisedAmount: 15500000,
    bankInfo: 'Vietcombank - 123456789 - Ban Caritas BRVT',
    qrCodeUrl: 'https://images.unsplash.com/photo-1597589827317-4c6d6e0a90bd?q=80&w=200&auto=format&fit=crop',
    linkedArticleId: '', // To be linked manually
    createdAt: new Date().toISOString(),
    isCompleted: false,
  }
];

export const getDonationsFromStore = (): DonationProgram[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('brvt_donations');
  if (data) {
    try {
      return JSON.parse(data);
    } catch(e) {
      return defaultDonations;
    }
  }
  return defaultDonations;
};

export const saveDonationsToStore = (donations: DonationProgram[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_donations', JSON.stringify(donations));
    window.dispatchEvent(new Event('donation_update'));
  }
};

export const addDonation = (donation: Omit<DonationProgram, 'id' | 'createdAt'>) => {
  const newDonation: DonationProgram = {
    ...donation,
    id: `donation-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };
  const current = getDonationsFromStore();
  saveDonationsToStore([newDonation, ...current]);
};

export const updateDonation = (id: string, updatedFields: Partial<DonationProgram>) => {
  const current = getDonationsFromStore();
  const updated = current.map(d => d.id === id ? { ...d, ...updatedFields } : d);
  saveDonationsToStore(updated);
};

export const deleteDonation = (id: string) => {
  const current = getDonationsFromStore();
  saveDonationsToStore(current.filter(d => d.id !== id));
};

// ================= Q&A PROGRAMS =================
export interface Question {
  id: string;
  senderName: string;
  senderContact?: string;
  questionText: string;
  recipient: string; // Tên Cha hoặc Giáo xứ
  createdAt: string;
  status: 'new' | 'answered';
}

export const getQuestionsFromStore = (): Question[] => {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem('brvt_questions');
  return data ? JSON.parse(data) : [];
};

export const saveQuestionsToStore = (questions: Question[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_questions', JSON.stringify(questions));
  }
};

export const addQuestion = (question: Omit<Question, 'id' | 'createdAt' | 'status'>) => {
  const newQuestion: Question = {
    ...question,
    id: `q-${Date.now()}`,
    createdAt: new Date().toISOString(),
    status: 'new'
  };
  const current = getQuestionsFromStore();
  saveQuestionsToStore([newQuestion, ...current]);
};

export const deleteQuestion = (id: string) => {
  const current = getQuestionsFromStore();
  saveQuestionsToStore(current.filter(q => q.id !== id));
};

export const markQuestionAnswered = (id: string) => {
  const current = getQuestionsFromStore();
  saveQuestionsToStore(current.map(q => q.id === id ? { ...q, status: 'answered' } : q));
};

// ================= LỜI CHÚA (WORD OF GOD) =================
export interface WordOfGod {
  dayOfWeek: number; // 1 (Mon) - 7 (Sun)
  quote: string;
  source: string;
}

const defaultWordOfGods: WordOfGod[] = [
  { dayOfWeek: 1, quote: "Thầy là đường, là sự thật và là sự sống.", source: "Ga 14, 6" },
  { dayOfWeek: 2, quote: "Ai yêu mến Thầy, thì sẽ giữ lời Thầy.", source: "Ga 14, 23" },
  { dayOfWeek: 3, quote: "Phúc thay ai xót thương người, vì họ sẽ được Thiên Chúa xót thương.", source: "Mt 5, 7" },
  { dayOfWeek: 4, quote: "Thầy để lại bình an cho anh em, Thầy ban cho anh em bình an của Thầy.", source: "Ga 14, 27" },
  { dayOfWeek: 5, quote: "Xin ý Cha thể hiện dưới đất cũng như trên trời.", source: "Mt 6, 10" },
  { dayOfWeek: 6, quote: "Hãy ký thác đường đời cho Chúa, tin tưởng vào Người, Người sẽ ra tay.", source: "Tv 37, 5" },
  { dayOfWeek: 7, quote: "Ai muốn theo Thầy, phải từ bỏ chính mình, vác thập giá mình mà theo.", source: "Mt 16, 24" }
];

export const getWordOfGodsFromStore = (): WordOfGod[] => {
  if (typeof window === 'undefined') return defaultWordOfGods;
  const data = localStorage.getItem('brvt_wordofgods');
  return data ? JSON.parse(data) : defaultWordOfGods;
};

export const saveWordOfGodsToStore = (words: WordOfGod[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_wordofgods', JSON.stringify(words));
  }
};

// ================= MASS SCHEDULE (GIỜ LỄ) =================
export interface MassSchedule {
  id: string;
  parishName: string;
  times: string[];
}

const defaultMassSchedules: MassSchedule[] = [
  { id: 'm-1', parishName: 'Nhà thờ Chánh Toà', times: ['05:00', '17:30', '19:00'] },
  { id: 'm-2', parishName: 'Giáo xứ Long Hương', times: ['04:30', '17:30'] },
  { id: 'm-3', parishName: 'Giáo xứ Vũng Tàu', times: ['05:00', '18:00'] },
  { id: 'm-4', parishName: 'Giáo xứ Hòa Bình', times: ['04:45', '17:45'] }
];

export const getMassSchedulesFromStore = (): MassSchedule[] => {
  if (typeof window === 'undefined') return defaultMassSchedules;
  const data = localStorage.getItem('brvt_mass_schedules');
  return data ? JSON.parse(data) : defaultMassSchedules;
};

export const saveMassSchedulesToStore = (schedules: MassSchedule[]) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_mass_schedules', JSON.stringify(schedules));
  }
};

// ================= RADIO LỜI CHÚA =================
export const getRadioLinkFromStore = (): string => {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('brvt_radio_link') || '';
};

export const saveRadioLinkToStore = (link: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_radio_link', link);
    window.dispatchEvent(new Event('storage_update'));
  }
};

// ================= FOOTER CONFIG =================
export interface QuickLink {
  title: string;
  url: string;
}

export interface FooterConfig {
  facebookLink: string;
  tiktokLink: string;
  instagramLink: string;
  aboutText: string;
  address: string;
  hotline: string;
  email: string;
  onlineSupport: string;
  quickLinks: QuickLink[];
  newsletterText: string;
}

const defaultFooterConfig: FooterConfig = {
  facebookLink: '#',
  tiktokLink: '#',
  instagramLink: '#',
  aboutText: 'Ngôi nhà chung kết nối các bạn thanh niên Công giáo toàn giáo phận. Nơi chia sẻ nhiệt huyết, nuôi dưỡng đức tin và dấn thân vì cộng đồng.',
  address: 'Văn phòng Giới Trẻ Giáo Phận, Tổ 3, Ấp Phước Bình, Xã Long Hải, TP.HCM',
  hotline: '0911.775.454',
  email: 'gioitregiaophanbaria@gmail.com',
  onlineSupport: '24/7',
  quickLinks: [
    { title: 'Lịch sự kiện sắp tới', url: '/su-kien' },
    { title: 'Đăng ký tình nguyện', url: '/tinh-nguyen' },
    { title: 'Góc tâm lý - Hỏi đáp', url: '/tam-ly' },
    { title: 'Nghe Podcast mới nhất', url: '/media' }
  ],
  newsletterText: 'Đăng ký email để không bỏ lỡ hội trại hay khóa tĩnh tâm nào.'
};

export const getFooterConfigFromStore = (): FooterConfig => {
  if (typeof window === 'undefined') return defaultFooterConfig;
  const data = localStorage.getItem('brvt_footer_config');
  return data ? JSON.parse(data) : defaultFooterConfig;
};

export const saveFooterConfigToStore = (config: FooterConfig) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('brvt_footer_config', JSON.stringify(config));
    window.dispatchEvent(new Event('storage_update'));
  }
};

