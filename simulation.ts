import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const NUM_ARCHITECTS = 1000;

async function simulateArchitect(id: number) {
  try {
    // Tác vụ 1: Đăng Bài Viết (Thêm bài)
    const { data: article, error: err1 } = await supabase.from('articles').insert([{
      category_id: 'ban-tin',
      title: `Bài viết test từ Kiến trúc sư ${id}`,
      excerpt: 'Mô tả ngắn...',
      content: 'Nội dung chi tiết...',
      status: 'published'
    }]).select().single();
    if (err1) throw err1;

    // Tác vụ 2: Sửa bài, Hiển thị trang chủ, Nổi bật, Ưu tiên
    const { error: err2 } = await supabase.from('articles').update({
      is_home_featured: true,
      is_priority: true,
      is_featured: true
    }).eq('id', article.id);
    if (err2) throw err2;

    // Tác vụ 3: Mở Khóa Học (Thêm bài danh mục lich-hoc)
    const { data: course, error: err3 } = await supabase.from('articles').insert([{
      category_id: 'lich-hoc',
      title: `Khóa học test ${id}`,
      content: 'Nội dung khóa học...',
      status: 'published'
    }]).select().single();
    if (err3) throw err3;

    // Tác vụ 4: Xóa Khóa Học
    const { error: err4 } = await supabase.from('articles').delete().eq('id', course.id);
    if (err4) throw err4;

    // Tác vụ 5: Mở Sự Kiện (Thêm bài danh mục su-kien) đính kèm link
    const { data: event, error: err5 } = await supabase.from('articles').insert([{
      category_id: 'su-kien',
      title: `Sự kiện test ${id}`,
      content: 'Nội dung sự kiện có kèm link đăng ký: https://docs.google.com/forms/...',
      status: 'published'
    }]).select().single();
    if (err5) throw err5;

    // Tác vụ 6: Xóa Sự Kiện
    const { error: err6 } = await supabase.from('articles').delete().eq('id', event.id);
    if (err6) throw err6;

    // Tác vụ 7: Xóa Bài Viết (Cleanup)
    const { error: err7 } = await supabase.from('articles').delete().eq('id', article.id);
    if (err7) throw err7;

    return { id, success: true };
  } catch (err: any) {
    return { id, success: false, error: err.message };
  }
}

async function runSimulation() {
  console.log(`🚀 Bắt đầu mô phỏng ${NUM_ARCHITECTS} kiến trúc sư truy cập đồng thời...`);
  const startTime = Date.now();
  
  // Create an array of promises
  const promises = [];
  for (let i = 1; i <= NUM_ARCHITECTS; i++) {
    promises.push(simulateArchitect(i));
  }

  // Chạy song song (thực tế chia batch nhỏ để không crash node runtime hoặc bị rate limit gắt)
  // Nhưng để test sức tải, ta push một lượt hoặc chia batch. Supabase free tier có thể bị quá tải nếu 1000 cùng lúc.
  // Ta chia batch 100 req / batch
  const batchSize = 100;
  let successes = 0;
  let failures = 0;
  const errors: string[] = [];

  for (let i = 0; i < NUM_ARCHITECTS; i += batchSize) {
    const batch = promises.slice(i, i + batchSize);
    const results = await Promise.all(batch);
    
    results.forEach(res => {
      if (res.success) successes++;
      else {
        failures++;
        if (errors.length < 5) errors.push(res.error || '');
      }
    });
    console.log(`⏳ Đã hoàn thành batch ${i / batchSize + 1}/${Math.ceil(NUM_ARCHITECTS / batchSize)}`);
  }

  const duration = (Date.now() - startTime) / 1000;
  console.log(`\n✅ MÔ PHỎNG HOÀN TẤT TRONG ${duration} GIÂY!`);
  console.log(`- Tổng số thao tác CRUD: ${NUM_ARCHITECTS * 7} thao tác`);
  console.log(`- Thành công: ${successes} user`);
  console.log(`- Thất bại: ${failures} user`);
  
  if (failures > 0) {
    console.log(`- Một số lỗi tiêu biểu:`);
    errors.forEach(e => console.log(`  + ${e}`));
  }
}

runSimulation();
