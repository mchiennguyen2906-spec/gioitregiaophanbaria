"use client";
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../../utils/supabaseClient';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg('Đăng nhập thất bại: ' + error.message);
        return;
      }

      // Check user role status
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('status')
        .eq('user_id', data.user.id)
        .single();
      
      if (roleData && roleData.status === 'locked') {
        await supabase.auth.signOut();
        setErrorMsg('Tài khoản của bạn đã bị khóa. Vui lòng liên hệ Admin.');
        return;
      }

      // Đăng nhập thành công
      router.push('/admin');
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg('Có lỗi xảy ra khi đăng nhập. Vui lòng thử lại.');
    } finally {
      setLoading(false);
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
        {errorMsg && (
          <div style={{ 
            background: '#fee2e2', color: '#dc2626', padding: '10px 15px', 
            borderRadius: '6px', marginBottom: '15px', fontSize: '0.9rem',
            border: '1px solid #fca5a5'
          }}>
            {errorMsg}
          </div>
        )}
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
          <button type="submit" disabled={loading} style={{
            background: loading ? '#94a3b8' : 'var(--color-brand-red)', color: 'white', padding: '12px', borderRadius: '6px',
            border: 'none', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '10px'
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
