import React, { useState, useEffect } from 'react';
import { slugMap } from '../../../utils/categoryMap';
import toast from 'react-hot-toast';

interface UserRole {
  id: string;
  user_id: string;
  email: string;
  role: string;
  allowed_categories: string[];
  status?: string;
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
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<{id: string, email: string} | null>(null);
  
  // Edit states
  const [editUserId, setEditUserId] = useState<string | null>(null);

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
        toast.error('Lỗi lấy danh sách user: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi tải danh sách user');
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
    if (!editUserId && (!email || !password || !role)) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc (Email, Password, Role).');
      return;
    }
    if (editUserId && !role) {
      toast.error('Vui lòng chọn Role.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const url = '/api/admin/users';
      const method = editUserId ? 'PUT' : 'POST';
      const bodyPayload: any = editUserId 
        ? { id: editUserId, role, allowedCategories }
        : { email, password, role, allowedCategories };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload)
      });
      const result = await res.json();
      
      if (result.success) {
        toast.success(editUserId ? 'Cập nhật tài khoản thành công!' : 'Tạo tài khoản thành công!');
        setShowForm(false);
        setEditUserId(null);
        setEmail('');
        setPassword('');
        setRole('editor');
        setAllowedCategories([]);
        fetchUsers();
      } else {
        toast.error('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi lưu tài khoản');
    }
    setIsSubmitting(false);
  };

  const handleEditClick = (user: UserRole) => {
    setEditUserId(user.user_id);
    setEmail(user.email);
    setPassword(''); // Don't prefill password
    setRole(user.role);
    setAllowedCategories(user.allowed_categories || []);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleStatus = async (user: UserRole) => {
    const newStatus = user.status === 'locked' ? 'active' : 'locked';
    if (!window.confirm(`Bạn có chắc muốn ${newStatus === 'locked' ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.email}?`)) return;

    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.user_id, status: newStatus })
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${newStatus === 'locked' ? 'Khóa' : 'Mở khóa'} tài khoản thành công!`);
        fetchUsers();
      } else {
        toast.error('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi cập nhật trạng thái');
    }
  };

  const executeDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      const res = await fetch(`/api/admin/users?id=${deleteConfirmUser.id}`, { method: 'DELETE' });
      const result = await res.json();
      if (result.success) {
        toast.success('Xóa tài khoản thành công');
        setDeleteConfirmUser(null);
        fetchUsers();
      } else {
        toast.error('Lỗi: ' + result.error);
      }
    } catch (err) {
      console.error(err);
      toast.error('Lỗi kết nối khi xóa tài khoản');
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Quản Lý Tài Khoản (Phân Quyền)</h2>
        <button 
          onClick={() => {
            setShowForm(!showForm);
            if (!showForm) {
              setEditUserId(null);
              setEmail('');
              setPassword('');
              setRole('editor');
              setAllowedCategories([]);
            }
          }}
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
          <h3 style={{ marginTop: 0, color: '#334155' }}>{editUserId ? 'Sửa Tài Khoản' : 'Tạo Tài Khoản Mới'}</h3>
          <form onSubmit={handleCreateUser} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            <div style={{ display: 'flex', gap: '15px' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Email *</label>
                <input style={inputStyle} type="email" value={email} onChange={e => setEmail(e.target.value)} disabled={!!editUserId} required={!editUserId} />
              </div>
              {!editUserId && (
                <div style={{ flex: 1 }}>
                  <label style={labelStyle}>Mật khẩu *</label>
                  <input style={inputStyle} type="text" placeholder="Nhập mật khẩu cho user..." value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
              )}
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
              {isSubmitting ? 'Đang lưu...' : (editUserId ? 'Lưu thay đổi' : 'Xác nhận tạo tài khoản')}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Đang tải danh sách tài khoản...</p>
      ) : (
        <div style={{ overflowX: 'auto', width: '100%' }}><table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', borderBottom: '2px solid #cbd5e1' }}>
              <th style={thStyle}>Email</th>
              <th style={thStyle}>Quyền hạn (Role)</th>
              <th style={thStyle}>Chuyên mục truy cập</th>
              <th style={thStyle}>Trạng thái</th>
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
                <td style={tdStyle}>
                  <span style={{ 
                    padding: '4px 8px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold',
                    background: user.status === 'locked' ? '#fee2e2' : '#dcfce7',
                    color: user.status === 'locked' ? '#991b1b' : '#166534'
                  }}>
                    {user.status === 'locked' ? 'KHÓA' : 'HOẠT ĐỘNG'}
                  </span>
                </td>
                <td style={tdStyle}>{new Date(user.created_at).toLocaleDateString('vi-VN')}</td>
                <td style={tdStyle}>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button 
                      onClick={() => handleEditClick(user)}
                      style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Sửa
                    </button>
                    <button 
                      onClick={() => handleToggleStatus(user)}
                      style={{ background: user.status === 'locked' ? '#22c55e' : '#f59e0b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      {user.status === 'locked' ? 'Mở Khóa' : 'Khóa'}
                    </button>
                    <button 
                      onClick={() => setDeleteConfirmUser({id: user.user_id, email: user.email})}
                      style={{ background: 'var(--color-brand-red)', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Xóa
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Chưa có tài khoản nào</td></tr>
            )}
          </tbody>
        </table></div>
      )}

      {/* Custom Delete Modal */}
      {deleteConfirmUser && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Xóa tài khoản?</h3>
            <p style={{ color: '#475569', marginBottom: '10px' }}>Bạn có chắc chắn muốn xóa tài khoản <strong>{deleteConfirmUser.email}</strong>?</p>
            <p style={{ color: '#ef4444', marginBottom: '25px', fontSize: '0.9rem' }}>Hành động này không thể hoàn tác.</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmUser(null)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
              <button onClick={executeDeleteUser} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Xác nhận Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem' };
const thStyle = { padding: '12px 15px', textAlign: 'left' as const, color: '#334155' };
const tdStyle = { padding: '12px 15px', color: '#475569' };

