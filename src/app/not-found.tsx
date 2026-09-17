import Link from 'next/link';
import React from 'react';

export default function NotFound() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '80vh', textAlign: 'center', padding: '20px'
    }}>
      <h1 style={{ fontSize: '6rem', color: 'var(--color-brand-red)', margin: 0 }}>404</h1>
      <h2 style={{ fontSize: '2rem', color: '#334155', marginBottom: '20px' }}>Không tìm thấy trang</h2>
      <p style={{ fontSize: '1.1rem', color: '#64748b', marginBottom: '30px', maxWidth: '500px' }}>
        Xin lỗi, trang bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc tạm thời không thể truy cập.
      </p>
      <Link href="/" style={{
        background: 'var(--color-brand-cyan)', color: 'white', padding: '12px 25px', 
        borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem'
      }}>
        Về Trang Chủ ➔
      </Link>
    </div>
  );
}
