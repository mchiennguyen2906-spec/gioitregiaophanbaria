"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Đăng nhập thất bại: ' + error.message);
      setLoading(false);
    } else {
      // Đăng nhập thành công
      // Redirect to admin
      router.push('/admin');
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', 
      background: 'url("https://images.unsplash.com/photo-1543722530-d2c3201371e7?q=80&w=1200&auto=format&fit=crop") center/cover'
    }}>
      <div style={{
        background: 'white', padding: '40px', borderRadius: '12px', width: '400px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.2)', textAlign: 'center'
      }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', marginBottom: '20px', fontSize: '1.8rem', textTransform: 'uppercase' }}>
          Đăng Nhập Quản Trị
        </h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input 
            type="email" 
            placeholder="Email đăng nhập" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            required
          />
          <input 
            type="password" 
            placeholder="Mật khẩu" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' }}
            required
          />
          <button type="submit" style={{
            background: 'var(--color-brand-red)', color: 'white', padding: '12px', borderRadius: '6px',
            border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: 'pointer', marginTop: '10px'
          }}>
            {loading ? 'Đang xác thực...' : 'Đăng Nhập'}
          </button>
        </form>
        <div style={{ marginTop: '20px', fontSize: '0.85rem' }}>
          <a href="/" style={{ color: '#64748b', textDecoration: 'none' }}>&larr; Quay lại Trang chủ</a>
        </div>
      </div>
    </div>
  );
}
