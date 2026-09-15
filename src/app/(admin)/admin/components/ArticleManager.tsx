import React, { useState, useEffect } from 'react';
import { getArticlesFromStore, toggleArticleStatus, deleteArticle, Article, getQuestionsFromStore } from "../../../utils/store";

export default function ArticleManager({ categoryId, categoryName, onEdit, onCreateNew, onViewQuestions }: { categoryId: string, categoryName: string, onEdit: (article: Article) => void, onCreateNew: () => void, onViewQuestions?: () => void }) {
  const [articles, setArticles] = useState<Article[]>([]);

  useEffect(() => {
    // Load from Supabase and filter by categoryId
    const loadArticles = async () => {
      const all = await getArticlesFromStore();
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
    // Reload will be triggered by storage_update event inside toggleArticleStatus
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa bài viết này vĩnh viễn?')) {
      await deleteArticle(id);
      // Reload will be triggered by storage_update
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Quản lý: {categoryName || 'Tất cả'}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {categoryId === 'tam-ly' && onViewQuestions && (
            <button onClick={onViewQuestions} style={{
              background: '#f8fafc', color: '#0f172a', padding: '8px 15px', 
              borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
            }}>
              📋 Tổng hợp câu hỏi ({questionsCount})
            </button>
          )}
          <button onClick={onCreateNew} style={{
            background: 'var(--color-brand-red)', color: 'white', padding: '8px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>
            + TẠO BÀI MỚI
          </button>
        </div>
      </div>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
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
          {articles.length === 0 ? (
            <tr>
              <td colSpan={5} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Chưa có bài viết nào trong chuyên mục này.
              </td>
            </tr>
          ) : (
            articles.map(article => (
              <tr key={article.id} style={{ borderBottom: '1px solid #e2e8f0', transition: 'background 0.2s', cursor: 'default' }}>
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
                  <button onClick={() => handleDelete(article.id)} style={actionBtnStyle('#ef4444')} title="Xóa">🗑️</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
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
