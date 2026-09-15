import React, { useState, useEffect } from 'react';
import { slugMap } from '../../../utils/categoryMap';

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  allowed_categories: string[];
  created_at: string;
}

export default function UserManager() {
  const [users, setUsers] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('editor');
  const [allowedCategories, setAllowedCategories] = useState<string[]>([]);

  const categories = Object.keys(slugMap).map(key => ({
    id: key,
    name: slugMap[key]
  }));

  const specialPermissions = [
    { id: 'tuong-tac', name: '🌟 TƯƠNG TÁC & LỜI CHÚA (Lời Chúa, Hỏi đáp)' },
    { id: 'muc-vu', name: '⛪ MỤC VỤ & TRUYỀN THÔNG (Giờ Lễ, Radio, Từ thiện)' },
    { id: 'he-thong', name: '⚙️ HỆ THỐNG (Chân trang)' }
  ];

  const allPermissions = [...specialPermissions, ...categories];

  const getPermissionName = (id: string) => {
    const special = specialPermissions.find(p => p.id === id);
    if (special) return special.name;
    return slugMap[id] || id;
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      const result = await res.json();
      if (result.success) {
        setUsers(result.data);
      } else {
        alert('Lỗi lấy danh sách user: ' + result.error);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleCategory = (catId: string) => {
    if (allowedCategories.includes(catId)) {
      setAllowedCategories(allowedCategories.filter(c => c !== catId));
    } else {
      setAllowedCategories([...allowedCategories, catId]);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !role) {
      alert('Vui lòng điền đủ thông tin bắt buộc (Email, Password, Role).');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role, allowedCategories })
      });
      const result = await res.json();
      
      if (result.success) {
        alert('Tạo tài khoản thành công!');
        setShowForm(false);
        setEmail('');
        setPassword('');
        setRole('editor');
        setAllowedCategories([]);
        fetchUsers();
      } else {
        alert('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối khi tạo tài khoản');
    }
    setIsSubmitting(false);
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${userEmail}?\nHành động này không thể hoàn tác.`)) {
      try {
        const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
        const result = await res.json();
        if (result.success) {
          alert('Xóa thành công');
          fetchUsers();
        } else {
          alert('Lỗi: ' + result.error);
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Quản Lý Tài Khoản (Phân Quyền)</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          style={{
            background: showForm ? '#64748b' : 'var(--color-brand-red)', color: 'white', 
            padding: '10px 15px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}
        >
          {showForm ? 'Đóng form' : '+ Tạo tài khoản mới'}
        </button>
      </div>

      {showForm && (
        <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
          <h3 style={{ marginTop: 0, color: '#334155' }}>Tạo Tài Khoản Mới</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Mật khẩu *</label>
                <input style={inputStyle} type="text" placeholder="Nhập mật khẩu cho user..." value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
            </div>
            
            <div>
              <label style={labelStyle}>Phân quyền (Role) *</label>
              <select style={inputStyle} value={role} onChange={e => setRole(e.target.value)}>
                <option value="editor">Editor (Chỉ viết bài / Lưu nháp)</option>
                <option value="category_admin">Category Admin (Quản lý & Đăng bài theo chuyên mục)</option>
                <option value="super_admin">Super Admin (Toàn quyền hệ thống)</option>
              </select>
            </div>

            {role !== 'super_admin' && (
              <div>
                <label style={labelStyle}>Các chuyên mục được phép quản lý</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                  {allPermissions.map(cat => (
                    <label key={cat.id} style={{ 
                      display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem',
                      fontWeight: specialPermissions.find(p => p.id === cat.id) ? 'bold' : 'normal',
                      color: specialPermissions.find(p => p.id === cat.id) ? 'var(--color-brand-cyan)' : 'inherit'
                    }}>
                      <input 
                        type="checkbox" 
                        checked={allowedCategories.includes(cat.id)}
                        onChange={() => handleToggleCategory(cat.id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button type="submit" disabled={isSubmitting} style={{
              background: isSubmitting ? '#cbd5e1' : 'var(--color-brand-cyan)', color: 'white', padding: '12px',
              borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', marginTop: '10px'
            }}>
              {isSubmitting ? 'Đang tạo...' : 'Xác nhận tạo tài khoản'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Đang tải danh sách tài khoản...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Quyền hạn (Role)</th>
              <th style={thStyle}>Chuyên mục truy cập</th>
              <th style={thStyle}>Ngày tạo</th>
              <th style={thStyle}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={tdStyle}><strong>{user.email}</strong></td>
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                    background: user.role === 'super_admin' ? '#fee2e2' : user.role === 'category_admin' ? '#e0f2fe' : '#f1f5f9',
                    color: user.role === 'super_admin' ? '#991b1b' : user.role === 'category_admin' ? '#0369a1' : '#475569'
                  }}>
                    {user.role.toUpperCase()}
                  </span>
                </td>
                <td style={tdStyle}>
                  {user.role === 'super_admin' ? (
                    <span style={{ color: 'var(--color-brand-cyan)', fontWeight: 'bold' }}>Toàn quyền</span>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                      {user.allowed_categories?.map(c => (
                        <span key={c} style={{ background: '#f1f5f9', padding: '3px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {getPermissionName(c)}
                        </span>
                      ))}
                    </div>
                  )}
                </td>
                <td style={tdStyle}>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td style={tdStyle}>
                  <button 
                    onClick={() => handleDeleteUser(user.user_id, user.email)}
                    style={{ background: 'var(--color-brand-red)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Xóa
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Chưa có tài khoản nào</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' };
const thStyle = { padding: '12px 15px', textAlign: 'left' as const, color: '#334155' };
const tdStyle = { padding: '12px 15px', color: '#475569' };
