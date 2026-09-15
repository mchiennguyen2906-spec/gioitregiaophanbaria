"use client";
import React from 'react';
import { getTitle } from '../../../../utils/categoryMap';

export default function ArticleDetail({ params }: { params: any }) {
  // Xử lý params cho Next.js 15+ 
  const resolvedParams = params instanceof Promise ? React.use(params) : params;
  const category = resolvedParams?.category || '';
  const slug = resolvedParams?.slug || '';
  const articleSlug = resolvedParams?.articleSlug || '';

  const catTitleStr = getTitle(category).toUpperCase();
  const subTitleStr = getTitle(category, slug).toUpperCase().replace(`${catTitleStr} / `, '');

  // Lấy ra title giả lập từ articleSlug
  const articleTitle = articleSlug.replace(/-/g, ' ').toUpperCase();

  return (
    <div style={{ background: '#f8fafc', paddingBottom: '60px' }}>
      
      {/* Breadcrumb */}
      <div className="container" style={{ padding: '20px 15px' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem', margin: 0 }}>
          <a href="/" style={{color: '#64748b', textDecoration: 'none'}}>Trang chủ</a> 
          {' » '}
          <span style={{cursor: 'pointer'}}>{catTitleStr}</span>
          {' » '}
          <a href={`/${category}/${slug}`} style={{color: '#64748b', textDecoration: 'none'}}>{subTitleStr}</a>
        </p>
      </div>

      {/* Main Article Container - Căn giữa, giới hạn độ rộng để dễ đọc */}
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
        
        {/* Header Bài Viết */}
        <header style={{ marginBottom: '30px', borderBottom: '1px solid #eee', paddingBottom: '20px' }}>
          <h1 style={{ fontSize: '2.2rem', color: 'var(--color-text-heading)', lineHeight: 1.3, marginBottom: '15px', fontWeight: 800 }}>
            {articleTitle || 'ĐÂY LÀ TIÊU ĐỀ BÀI VIẾT CHI TIẾT MẪU'}
          </h1>
          <div style={{ display: 'flex', gap: '20px', color: '#64748b', fontSize: '0.9rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              👤 Tác giả: Ban Truyền Thông
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              📅 15/09/2026
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              👁️ 1,234 lượt xem
            </span>
          </div>
        </header>

        {/* Nội Dung Bài Viết (Body) với Float Layout */}
        <article style={{ fontSize: '1.1rem', color: '#334155', lineHeight: 1.8, textAlign: 'justify' }}>
          <p style={{ fontWeight: 'bold', marginBottom: '20px', fontSize: '1.15rem' }}>
            Đoạn sapo mở đầu: Giới trẻ giáo phận đang hân hoan chuẩn bị cho kỳ đại hội sắp tới với nhiều hoạt động vô cùng sôi nổi và ý nghĩa. Trong bài viết này, chúng ta sẽ cùng điểm qua các công tác chuẩn bị.
          </p>
          
          {/* Hình ảnh được float bên trái */}
          <div style={{ 
            float: 'left', 
            marginRight: '25px', 
            marginBottom: '15px', 
            width: '50%', 
            minWidth: '300px'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=800&auto=format&fit=crop" 
              alt="Hình ảnh bài viết" 
              style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            />
            <p style={{ textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '10px', fontStyle: 'italic' }}>
              Ảnh: Công tác chuẩn bị cho đại hội giới trẻ
            </p>
          </div>

          <p style={{ marginBottom: '20px' }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
          </p>
          
          <p style={{ marginBottom: '20px' }}>
            Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida. Duis ac tellus et risus vulputate vehicula. Donec lobortis risus a elit. Etiam tempor. Ut ullamcorper, ligula eu tempor congue, eros est euismod turpis, id tincidunt sapien risus a quam.
          </p>
          
          {/* Xóa float để ảnh hưởng không tràn xuống đoạn dưới nếu văn bản ngắn */}
          <div style={{ clear: 'both' }}></div>

          <p style={{ marginBottom: '20px' }}>
            Phasellus vulputate magna. Nullam euismod, purus a auctor ullamcorper, risus erat convallis purus, eget scelerisque arcu enim id risus. Quisque id odio. Fusce at lacus. Sed lectus. Sed in ligula. Donec eleifend, felis vel cursus pharetra, quam tellus bibendum libero, at commodo lorem augue vel libero. Aliquam lorem purus, imperdiet nec, sodales in, ultricies eget, mi. Quisque rutrum. Aenean imperdiet.
          </p>

          {/* Một hình ảnh khác float bên phải */}
          <div style={{ 
            float: 'right', 
            marginLeft: '25px', 
            marginBottom: '15px', 
            width: '45%', 
            minWidth: '250px'
          }}>
            <img 
              src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=800&auto=format&fit=crop" 
              alt="Hình ảnh phụ" 
              style={{ width: '100%', borderRadius: '8px', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}
            />
          </div>

          <p style={{ marginBottom: '20px' }}>
            Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar, hendrerit id, lorem. Maecenas nec odio et ante tincidunt tempus. Donec vitae sapien ut libero venenatis faucibus. Nullam quis ante.
          </p>
          
          <p style={{ marginBottom: '20px' }}>
            Tóm lại, đây là một trang đọc bài viết với thiết kế dàn trang chữ ôm lấy hình ảnh (float layout). Phong cách này mang lại trải nghiệm đọc rất thoải mái, giống như đang đọc một trang tạp chí báo in thực thụ.
          </p>
          
          <div style={{ clear: 'both' }}></div>
        </article>

        {/* Nút chia sẻ */}
        <div style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #eee', display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span style={{ fontWeight: 'bold', color: '#334155' }}>Chia sẻ bài viết:</span>
          <button style={{ padding: '8px 16px', background: '#1877F2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Facebook</button>
          <button style={{ padding: '8px 16px', background: '#0088cc', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Zalo</button>
          <button style={{ padding: '8px 16px', background: '#e2e8f0', color: '#334155', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>🔗 Copy Link</button>
        </div>
      </div>

      {/* Bài Viết Cùng Chuyên Mục */}
      <div className="container" style={{ marginTop: '50px' }}>
        <div className="section-header" style={{ borderBottom: '2px solid var(--border-color)', padding: '0 0 10px 0', marginBottom: '25px' }}>
          <h2 className="section-title" style={{ fontSize: '1.4rem' }}>BÀI VIẾT CÙNG CHUYÊN MỤC</h2>
        </div>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '20px'
        }}>
          {[1, 2, 3, 4].map((item) => (
            <a key={item} href={`/${category}/${slug}/bai-viet-cung-chuyen-muc-${item}`} style={{
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
                <img src={`https://images.unsplash.com/photo-${1510000000000 + item}?q=80&w=400&auto=format&fit=crop`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Thumb" />
              </div>
              <div style={{ padding: '15px' }}>
                <h3 style={{ fontSize: '1rem', color: 'var(--color-text-heading)', fontWeight: 700, marginBottom: '8px', lineHeight: 1.4 }}>
                  Tiêu đề bài viết liên quan số {item}
                </h3>
                <p style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.5, marginBottom: '10px' }}>
                  Đoạn mô tả ngắn gọn giúp thu hút người đọc click vào...
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-brand-red)', fontWeight: 'bold' }}>
                  ĐỌC TIẾP &raquo;
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>

    </div>
  );
}
