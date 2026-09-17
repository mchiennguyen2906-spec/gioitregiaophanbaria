import React, { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabaseClient';
import toast from 'react-hot-toast';

export default function AdminSearch() {
  const [activeTab, setActiveTab] = useState<'LOGS' | 'SEARCH'>('LOGS');

  // Logs state
  const [logs, setLogs] = useState<any[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Search state
  const [keyword, setKeyword] = useState('');
  const [searchInTitle, setSearchInTitle] = useState(true);
  const [searchInContent, setSearchInContent] = useState(false);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [author, setAuthor] = useState('');
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    if (activeTab === 'LOGS') {
      fetchLogs();
    }
  }, [activeTab]);

  async function fetchLogs() {
    setLoadingLogs(true);
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
      
    if (data && !error) {
      setLogs(data);
    }
    setLoadingLogs(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingSearch(true);

    let query = supabase.from('articles').select('*').order('date', { ascending: false });

    if (keyword) {
      if (searchInTitle && searchInContent) {
        query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%`);
      } else if (searchInTitle) {
        query = query.ilike('title', `%${keyword}%`);
      } else if (searchInContent) {
        query = query.ilike('content', `%${keyword}%`);
      }
    }

    if (author) {
      query = query.ilike('author', `%${author}%`);
    }

    if (dateFrom) {
      query = query.gte('date', new Date(dateFrom).toISOString());
    }
    
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      query = query.lte('date', to.toISOString());
    }

    const { data, error } = await query.limit(100);
    
    if (data && !error) {
      setSearchResults(data);
      toast.success(`Tìm thấy ${data.length} kết quả`);
    } else {
      console.error(error);
      toast.error('Có lỗi xảy ra khi tìm kiếm');
    }
    setLoadingSearch(false);
  };

  const btnStyle = (active: boolean) => ({
    padding: '10px 20px',
    background: active ? 'var(--color-brand-cyan)' : '#e2e8f0',
    color: active ? 'white' : '#475569',
    border: 'none',
    fontWeight: 'bold',
    cursor: 'pointer',
    borderRadius: '8px 8px 0 0'
  });

  return (
    <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
      <h2 style={{ color: 'var(--color-brand-cyan)' }}>🔍 Lịch sử & Tìm kiếm nâng cao</h2>
      
      <div style={{ display: 'flex', gap: '5px', borderBottom: '2px solid var(--color-brand-cyan)', marginBottom: '20px' }}>
        <button style={btnStyle(activeTab === 'LOGS')} onClick={() => setActiveTab('LOGS')}>
          🕒 Lịch sử hoạt động (Logs)
        </button>
        <button style={btnStyle(activeTab === 'SEARCH')} onClick={() => setActiveTab('SEARCH')}>
          🔎 Tìm kiếm Bài viết nâng cao
        </button>
      </div>

      {activeTab === 'LOGS' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '0 8px 8px 8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
            <h3 style={{ margin: 0, color: '#334155' }}>Lịch sử 100 thao tác gần nhất</h3>
            <button onClick={fetchLogs} style={{ background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '5px 10px', borderRadius: '4px', cursor: 'pointer' }}>
              🔄 Làm mới
            </button>
          </div>
          
          {loadingLogs ? <p>Đang tải lịch sử...</p> : (
            <div style={{ overflowX: 'auto', width: '100%' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Thời gian</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Tài khoản</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Hành động</th>
                  <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center' }}>Không có lịch sử nào.</td></tr>
                ) : logs.map(log => (
                  <tr key={log.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px', color: '#64748b' }}>{new Date(log.created_at).toLocaleString('vi-VN')}</td>
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{log.user_email}</td>
                    <td style={{ padding: '10px' }}>
                      <span style={{ 
                        background: log.action.includes('Xóa') ? '#fee2e2' : log.action.includes('Đăng nhập') ? '#e0e7ff' : '#dcfce7',
                        color: log.action.includes('Xóa') ? '#991b1b' : log.action.includes('Đăng nhập') ? '#3730a3' : '#166534',
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td style={{ padding: '10px' }}>
                      <pre style={{ 
                        margin: 0, 
                        whiteSpace: 'pre-wrap', 
                        fontFamily: 'inherit',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        color: '#334155',
                        background: '#f8fafc',
                        padding: '8px',
                        borderLeft: '3px solid #cbd5e1',
                        borderRadius: '4px'
                      }}>
                        {log.details}
                      </pre>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table></div>
          )}
        </div>
      )}

      {activeTab === 'SEARCH' && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '0 8px 8px 8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
          <form onSubmit={handleSearch} style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Từ khóa:</label>
                <input 
                  type="text" 
                  value={keyword}
                  onChange={e => setKeyword(e.target.value)}
                  placeholder="Nhập từ khóa cần tìm..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>
              
              <div style={{ gridColumn: 'span 2', display: 'flex', gap: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={searchInTitle} onChange={e => setSearchInTitle(e.target.checked)} />
                  Tìm trong Tiêu đề
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={searchInContent} onChange={e => setSearchInContent(e.target.checked)} />
                  Tìm trong Nội dung
                </label>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Tên người đăng:</label>
                <input 
                  type="text" 
                  value={author}
                  onChange={e => setAuthor(e.target.value)}
                  placeholder="Ví dụ: Lm. Giuse, John Doe..."
                  style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Khoảng thời gian (Ngày/Tháng):</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input 
                    type="date" 
                    value={dateFrom}
                    onChange={e => setDateFrom(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                  <span style={{ display: 'flex', alignItems: 'center' }}>-</span>
                  <input 
                    type="date" 
                    value={dateTo}
                    onChange={e => setDateTo(e.target.value)}
                    style={{ flex: 1, padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                  />
                </div>
              </div>
            </div>

            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                type="submit" 
                disabled={loadingSearch}
                style={{ background: 'var(--color-brand-cyan)', color: 'white', border: 'none', padding: '10px 30px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {loadingSearch ? 'Đang tìm kiếm...' : '🔍 Lọc Dữ Liệu'}
              </button>
            </div>
          </form>

          {/* Search Results */}
          <h3 style={{ margin: '0 0 15px 0', color: '#334155' }}>Kết quả tìm kiếm ({searchResults.length})</h3>
          <div style={{ overflowX: 'auto', width: '100%' }}><table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#f8fafc', textAlign: 'left' }}>
                <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Ngày đăng</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Tiêu đề</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Người đăng</th>
                <th style={{ padding: '10px', borderBottom: '1px solid #e2e8f0' }}>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {searchResults.length === 0 ? (
                <tr><td colSpan={4} style={{ padding: '10px', textAlign: 'center', color: '#64748b' }}>Bấm nút Lọc Dữ Liệu để tìm kiếm.</td></tr>
              ) : searchResults.map(article => (
                <tr key={article.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>{new Date(article.date).toLocaleDateString('vi-VN')}</td>
                  <td style={{ padding: '10px', fontWeight: 'bold' }}>{article.title}</td>
                  <td style={{ padding: '10px' }}>{article.author}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{ 
                      background: article.status === 'published' ? '#dcfce7' : '#f1f5f9',
                      color: article.status === 'published' ? '#166534' : '#64748b',
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem'
                    }}>
                      {article.status === 'published' ? 'Đã xuất bản' : 'Ẩn'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
        </div>
      )}
    </div>
  );
}

