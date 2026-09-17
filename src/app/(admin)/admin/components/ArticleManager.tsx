import React, { useState, useEffect } from 'react';
import { getArticlesFromStore, toggleArticleStatus, deleteArticle, Article, getQuestionsFromStore } from "../../../utils/store";
import toast from 'react-hot-toast';
import RegistrationManager from './RegistrationManager';

export default function ArticleManager({ categoryId, categoryName, onEdit, onCreateNew, onViewQuestions }: { categoryId: string, categoryName: string, onEdit: (article: Article) => void, onCreateNew: () => void, onViewQuestions?: () => void }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const isEventOrCourse = categoryId === 'su-kien';
  const [activeTab, setActiveTab] = useState<'articles' | 'registrations'>('articles');

  useEffect(() => {
    // Load from Supabase and filter by categoryId
    const loadArticles = async () => {
      const all = await getArticlesFromStore(true);
      if (categoryId) {
        setArticles(all.filter(a => a.categoryId === categoryId));
      } else {
        setArticles(all);
      }
    };
    loadArticles();
    
    // Auto refresh on updates
    window.addEventListener('storage_update', loadArticles);
    return () => window.removeEventListener('storage_update', loadArticles);
  }, [categoryId]);

  // Reset page when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, categoryId]);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const [questionsCount, setQuestionsCount] = useState(0);

  useEffect(() => {
    const loadQuestionsCount = async () => {
      const q = await getQuestionsFromStore();
      setQuestionsCount(q.length);
    };
    loadQuestionsCount();
  }, []);

  const toggleStatus = async (article: Article) => {
    await toggleArticleStatus(article.id, article.status);
    toast.success(`Đã ${article.status === 'published' ? 'ẩn' : 'hiển thị'} bài viết!`);
    // Reload will be triggered by storage_update event inside toggleArticleStatus
  };

  const executeDelete = async () => {
    if (deleteConfirmId) {
      await deleteArticle(deleteConfirmId);
      toast.success('Đã xóa bài viết thành công!');
      setDeleteConfirmId(null);
      // Reload will be triggered by storage_update
    }
  };

  // Filter and Paginate
  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) || 
    (a.author && a.author.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );
  
  const totalPages = Math.ceil(filteredArticles.length / itemsPerPage);
  const currentArticles = filteredArticles.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Quản lý: {categoryName || 'Tất cả'}</h2>
        
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {isEventOrCourse && activeTab === 'articles' && (
            <button onClick={() => setActiveTab('registrations')} style={{
              background: '#f8fafc', color: '#1e293b', padding: '8px 15px', 
              borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
            }}>
              📋 Xem Danh sách Đăng ký
            </button>
          )}
          {isEventOrCourse && activeTab === 'registrations' && (
            <button onClick={() => setActiveTab('articles')} style={{
              background: '#f8fafc', color: '#1e293b', padding: '8px 15px', 
              borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
            }}>
              ← Quay lại Quản lý Bài viết
            </button>
          )}

          {activeTab === 'articles' && (
            <input 
              type="text" 
              placeholder="🔍 Tìm kiếm bài viết, tác giả..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', width: '250px' }}
            />
          )}

          {categoryId === 'tam-ly' && onViewQuestions && (
            <button onClick={onViewQuestions} style={{
              background: '#f8fafc', color: '#0f172a', padding: '8px 15px', 
              borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
            }}>
              📋 Câu hỏi ({questionsCount})
            </button>
          )}
          {activeTab === 'articles' && (
            <button onClick={onCreateNew} style={{
              background: 'var(--color-brand-cyan)', color: 'white', padding: '8px 15px', 
              borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold',
              boxShadow: '0 2px 4px rgba(6,182,212,0.3)'
            }}>
              + TẠO BÀI MỚI
            </button>
          )}
        </div>
      </div>

      {activeTab === 'registrations' ? (
        <RegistrationManager articles={articles} />
      ) : (
        <>
          <div style={{ overflowX: 'auto', width: '100%' }}><table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
            <th style={{ padding: '12px', width: '30%' }}>Tên Bài Viết</th>
            <th style={{ padding: '12px' }}>Người Đăng</th>
            <th style={{ padding: '12px' }}>Ngày Đăng</th>
            <th style={{ padding: '12px' }}>Đánh dấu</th>
            <th style={{ padding: '12px' }}>Trạng Thái</th>
            <th style={{ padding: '12px', textAlign: 'center' }}>Thao Tác</th>
          </tr>
        </thead>
        <tbody>
          {currentArticles.length === 0 ? (
            <tr>
              <td colSpan={6} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                {searchTerm ? 'Không tìm thấy bài viết nào phù hợp.' : 'Chưa có bài viết nào trong chuyên mục này.'}
              </td>
            </tr>
          ) : (
            currentArticles.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', cursor: 'default' }} 
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '15px 12px', fontWeight: '500', color: '#1e293b' }}>{article.title}</td>
                <td style={{ padding: '15px 12px', color: '#64748b' }}>{article.author} {article.parish ? `(${article.parish})` : ''}</td>
                <td style={{ padding: '15px 12px', color: '#64748b' }}>{new Date(article.date).toLocaleDateString('vi-VN')}</td>
                <td style={{ padding: '15px 12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {article.isFeatured && <span style={{ padding: '2px 6px', background: '#fee2e2', color: '#b91c1c', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold', width: 'max-content' }}>Nổi bật trang con</span>}
                  {article.isPriority && <span style={{ padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold', width: 'max-content' }}>Ưu tiên trang con</span>}
                  {article.isHomeFeatured && <span style={{ padding: '2px 6px', background: '#fef3c7', color: '#b45309', fontSize: '0.7rem', borderRadius: '4px', fontWeight: 'bold', width: 'max-content' }}>Hiển thị trang chủ</span>}
                  {!article.isFeatured && !article.isPriority && !article.isHomeFeatured && <span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>-</span>}
                </td>
                <td style={{ padding: '15px 12px' }}>
                  <span style={{ 
                    padding: '4px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold',
                    background: article.status === 'published' ? '#dcfce7' : '#f1f5f9',
                    color: article.status === 'published' ? '#166534' : '#64748b'
                  }}>
                    {article.status === 'published' ? 'Đang hiện' : 'Đang ẩn'}
                  </span>
                </td>
                <td style={{ padding: '15px 12px', textAlign: 'center' }}>
                  <button onClick={() => onEdit(article)} style={actionBtnStyle('#3b82f6')} title="Chỉnh sửa">✏️</button>
                  <button onClick={() => toggleStatus(article)} style={actionBtnStyle('#64748b')} title="Ẩn / Hiện">
                    {article.status === 'published' ? '👁️' : '🙈'}
                  </button>
                  <button onClick={() => setDeleteConfirmId(article.id)} style={actionBtnStyle('#ef4444')} title="Xóa">🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table></div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === 1 ? '#f1f5f9' : 'white', cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            &laquo; Trước
          </button>
          <span style={{ color: '#475569', fontWeight: 'bold' }}>Trang {currentPage} / {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            style={{ padding: '8px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', background: currentPage === totalPages ? '#f1f5f9' : 'white', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Sau &raquo;
          </button>
        </div>
      )}

      {/* Custom Delete Modal */}
      {deleteConfirmId && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '25px', borderRadius: '12px', maxWidth: '400px', width: '90%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}>
            <h3 style={{ color: '#b91c1c', marginTop: 0 }}>⚠️ Xóa bài viết?</h3>
            <p style={{ color: '#475569', marginBottom: '25px' }}>Hành động này không thể hoàn tác. Bạn có chắc chắn muốn xóa bài viết này khỏi hệ thống?</p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button onClick={() => setDeleteConfirmId(null)} style={{ padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Hủy</button>
              <button onClick={executeDelete} style={{ padding: '10px 20px', borderRadius: '6px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>Xác nhận Xóa</button>
            </div>
          </div>
        </div>
      )}
      </>
      )}
    </div>
  );
}

const actionBtnStyle = (color: string) => ({
  background: 'transparent',
  border: `1px solid ${color}`,
  color: color,
  borderRadius: '4px',
  padding: '6px',
  margin: '0 4px',
  cursor: 'pointer',
  fontSize: '1rem',
  transition: 'all 0.2s'
});

