'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
      minHeight: '80vh', textAlign: 'center', padding: '20px'
    }}>
      <h1 style={{ fontSize: '2.5rem', color: 'var(--color-brand-red)', marginBottom: '15px' }}>Đã có lỗi xảy ra!</h1>
      <p style={{ fontSize: '1.1rem', color: '#475569', marginBottom: '30px', maxWidth: '500px' }}>
        Xin lỗi, đã có sự cố ngoài ý muốn xảy ra trong quá trình tải trang. Vui lòng thử lại sau.
      </p>
      <div style={{ display: 'flex', gap: '15px' }}>
        <button
          onClick={() => reset()}
          style={{
            background: 'var(--color-brand-cyan)', color: 'white', padding: '12px 25px', 
            borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer'
          }}
        >
          Thử Lại ↻
        </button>
        <a href="/" style={{
          background: '#e2e8f0', color: '#334155', padding: '12px 25px', 
          borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', fontSize: '1.1rem', display: 'inline-block'
        }}>
          Về Trang Chủ ➔
        </a>
      </div>
    </div>
  );
}
