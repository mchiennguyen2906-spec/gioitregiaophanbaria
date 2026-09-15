const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid');

const sb = createClient(
  'https://spoqkzsrcphgzvmxwadd.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNwb3FrenNyY3BoZ3p2bXh3YWRkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4OTQ0MjkxNywiZXhwIjoyMTA1MDE4OTE3fQ.vIR-P9PJPpQ8M9cedwW06F3fccQWvRohN87h-8XfbQI',
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const defaultArticles = [
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: uuidv4(),
    category_id: 'giao-phan', 
    title: i === 0 ? `BÀI VIẾT QUAN TRỌNG NHẤT CỦA CHUYÊN MỤC` : `Bài viết mẫu số ${i + 1} với tiêu đề dài để test hiển thị`,
    excerpt: 'Đây là đoạn trích dẫn (sapo) cho bài viết, sẽ hiển thị ở ngoài danh sách để thu hút người đọc...',
    content: '<p>Nội dung mẫu...</p>',
    author: 'Ban TT',
    parish: 'Bà Rịa',
    thumbnail_url: `https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=600&auto=format&fit=crop&sig=${i}`,
    date: new Date().toISOString(),
    status: 'published',
    is_featured: i === 0,
    is_priority: i === 1,
    is_home_featured: i < 3,
    is_home_priority: i >= 3 && i < 7
  })),
  {
    id: uuidv4(), category_id: 'phuc-am', title: 'Học hỏi Phúc âm Chúa nhật 25 thường niên Năm A - 2026', excerpt: 'Bài học rút ra từ Phúc Âm...', content: '<p>Nội dung</p>', author: 'Lm. Giuse', date: new Date().toISOString(), status: 'published', is_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1542820229-081e0c12af0b?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: uuidv4(), category_id: 'giao-ly', title: 'Giáo lý: Bí tích Thánh Thể', excerpt: 'Bí tích Thánh Thể là gì...', content: '<p>Nội dung</p>', author: 'Ban Giáo Lý', date: new Date(Date.now() - 86400000).toISOString(), status: 'published', is_priority: true
  },
  {
    id: uuidv4(), category_id: 'lich-hoc', title: 'Khóa Đào Tạo Giáo Lý Viên Cấp 1', excerpt: 'Khai giảng khóa mới dành cho các bạn trẻ...', content: '<p>Nội dung</p>', author: 'Ban Đào Tạo', date: new Date().toISOString(), status: 'published', is_home_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1544928147-79a2dbc1f389?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: uuidv4(), category_id: 'su-kien', title: 'Đại Hội Giới Trẻ Giáo Phận 2026', excerpt: 'Sự kiện lớn nhất trong năm quy tụ hàng ngàn bạn trẻ...', content: '<p>Nội dung</p>', author: 'Ban Tổ Chức', date: new Date().toISOString(), status: 'published', is_home_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop'
  },
  {
    id: uuidv4(), category_id: 'guong-mat', title: 'Người Trẻ Tiêu Biểu Trong Công Tác Mục Vụ', excerpt: 'Câu chuyện truyền cảm hứng về sự hy sinh...', content: '<p>Nội dung</p>', author: 'Maria Nguyễn', parish: 'Xứ Vũng Tàu', date: new Date().toISOString(), status: 'published', is_home_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=600&auto=format&fit=crop'
  },
  {
    id: uuidv4(), category_id: 'hinh-anh', title: 'Khoảnh Khắc Đẹp Đại Hội Giới Trẻ', excerpt: '', content: '', author: 'Ban Truyền Thông', date: new Date().toISOString(), status: 'published', is_home_featured: true, thumbnail_url: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=800&auto=format&fit=crop'
  }
];

async function seed() {
  console.log('Seeding Supabase...');
  // Ensure we delete all first to avoid duplicates
  await sb.from('articles').delete().neq('title', 'placeholder');
  
  const { error } = await sb.from('articles').insert(defaultArticles);
  if (error) {
    console.error('Seed Error:', error);
  } else {
    console.log('Seed Success!');
  }
}

seed();
