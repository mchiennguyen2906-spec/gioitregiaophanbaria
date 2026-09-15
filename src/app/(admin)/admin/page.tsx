"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../utils/supabaseClient';
import { slugMap, categoryHierarchy, categoryMap } from "../../utils/categoryMap";
import { Article } from "../../utils/store";
import ArticleManager from "./components/ArticleManager";
import ArticleEditor from "./components/ArticleEditor";
import EventEditor from "./components/EventEditor";
import CourseEditor from "./components/CourseEditor";
import AlbumEditor from "./components/AlbumEditor";
import VideoEditor from "./components/VideoEditor";
import DonationManager from "./components/DonationManager";
import DonationEditor from "./components/DonationEditor";
import GuongMatEditor from "./components/GuongMatEditor";
import QuestionManager from "./components/QuestionManager";
import WordOfGodManager from "./components/WordOfGodManager";
import MassManager from "./components/MassManager";
import RadioManager from "./components/RadioManager";
import FooterManager from "./components/FooterManager";
import UserManager from "./components/UserManager";
import BieuMauEditor from "./components/BieuMauEditor";
import AdminSearch from "./components/AdminSearch";
import { logActivity, DonationProgram } from "../../utils/store";

type MenuType = 'DASHBOARD' | 'NEW_ARTICLE' | 'NEW_EVENT' | 'NEW_COURSE' | 'NEW_ALBUM' | 'NEW_VIDEO' | 'NEW_GUONGMAT' | 'NEW_BIEUMAU' | 'MANAGE_DONATION' | 'EDIT_DONATION' | 'MANAGE_CATEGORY' | 'MANAGE_WORD' | 'MANAGE_MASS' | 'MANAGE_RADIO' | 'MANAGE_FOOTER' | 'MANAGE_QUESTIONS' | 'PREVIEW' | 'MANAGE_USERS' | 'SEARCH_LOGS';

export default function AdminDashboard() {
  const [activeMenu, setActiveMenu] = useState<MenuType>('DASHBOARD');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeCategoryName, setActiveCategoryName] = useState<string>('');
  const [articleToEdit, setArticleToEdit] = useState<Article | null>(null);
  const [donationToEdit, setDonationToEdit] = useState<DonationProgram | null>(null);
  const [expandedFolder, setExpandedFolder] = useState<string | null>(null);
  
  // Auth state
  const router = useRouter();
  const [userRole, setUserRole] = useState<{ role: string, allowed_categories: string[] } | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/admin/login');
        return;
      }
      
      // Fetch user role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role, allowed_categories')
        .eq('user_id', session.user.id)
        .single();
        
      if (roleData && !roleError) {
        setUserRole(roleData as any);
      } else {
        // RLS policy có thể bị lỗi đệ quy, fallback theo email
        const email = session.user.email;
        if (email === 'admin@brvt.com') {
          setUserRole({ role: 'super_admin', allowed_categories: [] });
        } else {
          setUserRole({ role: 'editor', allowed_categories: [] });
        }
      }
      setIsLoadingAuth(false);
      
      // Chỉ log nếu session chưa được đánh dấu đã log cho email hiện tại
      const currentLoggedEmail = sessionStorage.getItem('logged_in_email');
      const userEmail = session.user.email || '';
      if (currentLoggedEmail !== userEmail) {
        logActivity('Đăng nhập', 'user', 'Người dùng truy cập vào hệ thống Admin');
        sessionStorage.setItem('logged_in_email', userEmail);
      }
    };
    checkAuth();
  }, [router]);
  
  // Lấy danh sách 26 trang con từ slugMap
  // Lấy danh sách 26 trang con từ slugMap, LỌC THEO PHÂN QUYỀN
  const categories = Object.keys(slugMap)
    .filter(key => userRole?.role === 'super_admin' || userRole?.allowed_categories?.includes(key))
    .map(key => ({
      id: key,
      name: slugMap[key]
    }));

  const renderContent = () => {
    switch (activeMenu) {
      case 'DASHBOARD':
        return (
          <div>
            <h2>Chào mừng đến với hệ thống Quản trị</h2>
            <p>Quyền hạn của bạn: <strong>{userRole?.role?.toUpperCase()}</strong></p>
          </div>
        );
      case 'NEW_ARTICLE':
        return (
          <ArticleEditor 
            articleToEdit={articleToEdit}
            defaultCategory={activeCategory}
            allowedCategories={categories}
            onSave={() => setActiveMenu('PREVIEW')} 
            onPublish={() => {
              setArticleToEdit(null);
            }} 
          />
        );
      case 'NEW_EVENT':
        return (
          <EventEditor 
            onSave={() => alert('Sẽ hiển thị UI Form Preview')}
            onPublish={() => alert('Đã tạo Form Đăng ký thành công!')}
          />
        );
      case 'NEW_COURSE':
        return (
          <CourseEditor 
            onSave={() => alert('Đã lưu nháp khóa học!')}
            onPublish={() => alert('Đã đăng khóa học thành công!')}
          />
        );
      case 'NEW_ALBUM':
        return (
          <AlbumEditor 
            onSave={() => alert('Đã lưu nháp album!')}
            onPublish={() => alert('Đã đăng album thành công!')}
          />
        );
      case 'NEW_VIDEO':
        return (
          <VideoEditor 
            onSave={() => alert('Đã lưu nháp video!')}
            onPublish={() => alert('Đã đăng video thành công!')}
          />
        );
      case 'NEW_GUONGMAT':
        return (
          <GuongMatEditor 
            articleToEdit={articleToEdit}
            onSave={() => setActiveMenu('MANAGE_CATEGORY')} 
            onPublish={() => setActiveMenu('MANAGE_CATEGORY')} 
          />
        );

      case 'MANAGE_CATEGORY':
        return <ArticleManager 
                 categoryId={activeCategory!} 
                 categoryName={activeCategoryName} 
                 onEdit={(article) => {
                   setArticleToEdit(article);
                   if (article.categoryId === 'guong-mat') {
                     setActiveMenu('NEW_GUONGMAT');
                   } else if (article.categoryId === 'bieu-mau') {
                     setActiveMenu('NEW_BIEUMAU');
                   } else {
                     setActiveMenu('NEW_ARTICLE');
                   }
                 }}
                 onCreateNew={() => {
                   setArticleToEdit(null);
                   if (activeCategory === 'guong-mat') {
                     setActiveMenu('NEW_GUONGMAT');
                   } else if (activeCategory === 'bieu-mau') {
                     setActiveMenu('NEW_BIEUMAU');
                   } else {
                     setActiveMenu('NEW_ARTICLE');
                   }
                 }}
                 onViewQuestions={() => setActiveMenu('MANAGE_QUESTIONS')}
               />;
      case 'NEW_BIEUMAU':
        return <BieuMauEditor
                  articleToEdit={articleToEdit}
                  onSave={() => {
                    setArticleToEdit(null);
                    setActiveMenu('MANAGE_CATEGORY');
                  }}
                  onCancel={() => {
                    setArticleToEdit(null);
                    setActiveMenu('MANAGE_CATEGORY');
                  }}
                />;
      case 'MANAGE_QUESTIONS':
        return <QuestionManager />;
      case 'MANAGE_WORD':
        return <WordOfGodManager />;
      case 'MANAGE_MASS':
        return <MassManager />;
      case 'MANAGE_RADIO':
        return <RadioManager />;
      case 'MANAGE_FOOTER':
        return <FooterManager />;
      case 'MANAGE_USERS':
        return <UserManager />;
      case 'SEARCH_LOGS':
        return <AdminSearch />;
      case 'MANAGE_DONATION':
        return <DonationManager 
                 onEdit={(donation) => {
                   setDonationToEdit(donation);
                   setActiveMenu('EDIT_DONATION');
                 }}
                 onCreateNew={() => {
                   setDonationToEdit(null);
                   setActiveMenu('EDIT_DONATION');
                 }}
               />;
      case 'EDIT_DONATION':
        return <DonationEditor
                 donationToEdit={donationToEdit}
                 onSave={() => setActiveMenu('MANAGE_DONATION')}
                 onCancel={() => setActiveMenu('MANAGE_DONATION')}
               />;
      default:
        return <h2>Đang phát triển...</h2>;
    }
  };

  if (isLoadingAuth) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', justifyContent: 'center', alignItems: 'center', background: '#f8fafc' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)' }}>Đang xác thực...</h2>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#f8fafc' }}>
      
      {/* CỘT TRÁI - SIDEBAR */}
      <div style={{ 
        width: '280px', background: '#1e293b', color: 'white', 
        display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto'
      }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #334155', textAlign: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--color-brand-cyan)', fontSize: '1.2rem' }}>ADMIN BRVT</h2>
          <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>Quản trị hệ thống</p>
        </div>

        <div style={{ padding: '15px 0', display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <div style={{ padding: '10px 20px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>SOẠN THẢO</div>
          
          <button onClick={() => { setArticleToEdit(null); setActiveCategory(null); setActiveMenu('NEW_ARTICLE'); }} style={menuBtnStyle(activeMenu === 'NEW_ARTICLE')}>
            📝 Bài viết mới
          </button>
          <button onClick={() => setActiveMenu('NEW_EVENT')} style={menuBtnStyle(activeMenu === 'NEW_EVENT')}>
            📅 Sự kiện mới
          </button>
          <button onClick={() => setActiveMenu('NEW_COURSE')} style={menuBtnStyle(activeMenu === 'NEW_COURSE')}>
            🎓 Khóa học mới
          </button>
          <button onClick={() => setActiveMenu('NEW_ALBUM')} style={menuBtnStyle(activeMenu === 'NEW_ALBUM')}>
            🖼️ Album mới
          </button>
          <button onClick={() => setActiveMenu('NEW_VIDEO')} style={menuBtnStyle(activeMenu === 'NEW_VIDEO')}>
            ▶️ Video mới
          </button>

          <div style={{ padding: '15px 20px 10px 20px', fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold', marginTop: '10px' }}>
            QUẢN LÝ CÁC HẠNG MỤC
          </div>
          
          <div style={{ maxHeight: '400px', overflowY: 'auto', background: '#0f172a' }}>
            {Object.entries(categoryHierarchy || {}).map(([parentKey, childrenKeys]) => {
              const allowedChildren = childrenKeys.filter(childKey => categories.some(c => c.id === childKey));
              if (allowedChildren.length === 0) return null;
              
              const isExpanded = expandedFolder === parentKey;
              return (
                <div key={parentKey}>
                  <button
                    onClick={() => setExpandedFolder(isExpanded ? null : parentKey)}
                    style={{
                      ...menuBtnStyle(false),
                      fontSize: '0.9rem', paddingLeft: '20px', background: isExpanded ? '#1e293b' : 'transparent',
                      justifyContent: 'space-between', display: 'flex'
                    }}
                  >
                    <span>📁 {categoryMap[parentKey]}</span>
                    <span>{isExpanded ? '▾' : '▸'}</span>
                  </button>
                  {isExpanded && (
                    <div style={{ background: '#0f172a', paddingBottom: '10px' }}>
                      {allowedChildren.map(childKey => {
                        const childName = slugMap[childKey] || childKey;
                        return (
                          <button 
                            key={childKey} 
                            onClick={() => { 
                              setActiveMenu('MANAGE_CATEGORY'); 
                              setActiveCategory(childKey);
                              setActiveCategoryName(childName);
                            }}
                            style={{
                              ...menuBtnStyle(activeMenu === 'MANAGE_CATEGORY' && activeCategory === childKey),
                              fontSize: '0.85rem', paddingLeft: '45px', background: 'transparent'
                            }}
                          >
                            • {childName}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Menu Admin (Super Admin hoặc người có quyền Hệ Thống) */}
          {(userRole?.role === 'super_admin' || userRole?.allowed_categories?.includes('he-thong')) && (
            <div style={menuSectionStyle}>
              <div style={menuSectionTitleStyle}>HỆ THỐNG</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {userRole?.role === 'super_admin' && (
                  <>
                    <li 
                      onClick={() => setActiveMenu('MANAGE_USERS')}
                      style={menuItemStyle(activeMenu === 'MANAGE_USERS')}
                    >
                      👥 Quản lý Tài khoản (RBAC)
                    </li>
                    <li 
                      onClick={() => setActiveMenu('SEARCH_LOGS')}
                      style={menuItemStyle(activeMenu === 'SEARCH_LOGS')}
                    >
                      🔍 Lịch sử & Tìm kiếm nâng cao
                    </li>
                  </>
                )}
                <li 
                  onClick={() => setActiveMenu('MANAGE_FOOTER')}
                  style={menuItemStyle(activeMenu === 'MANAGE_FOOTER')}
                >
                  ⚙️ Cấu hình Chân trang
                </li>
              </ul>
            </div>
          )}

          {/* Menu Tương Tác & Lời Chúa (Super Admin hoặc người được cấp quyền) */}
          {(userRole?.role === 'super_admin' || userRole?.allowed_categories?.includes('tuong-tac')) && (
            <div style={menuSectionStyle}>
              <div style={menuSectionTitleStyle}>TƯƠNG TÁC & LỜI CHÚA</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li 
                  onClick={() => setActiveMenu('MANAGE_WORD')}
                  style={menuItemStyle(activeMenu === 'MANAGE_WORD')}
                >
                  📖 Lời Chúa & Châm ngôn
                </li>
                <li 
                  onClick={() => setActiveMenu('MANAGE_QUESTIONS')}
                  style={menuItemStyle(activeMenu === 'MANAGE_QUESTIONS')}
                >
                  ❓ Hỏi đáp tâm lý
                </li>
              </ul>
            </div>
          )}

          {/* Mục Vụ & Truyền Thông */}
          {(userRole?.role === 'super_admin' || userRole?.allowed_categories?.includes('muc-vu')) && (
            <div style={menuSectionStyle}>
              <div style={menuSectionTitleStyle}>MỤC VỤ & TRUYỀN THÔNG</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                <li 
                  onClick={() => setActiveMenu('MANAGE_MASS')}
                  style={menuItemStyle(activeMenu === 'MANAGE_MASS')}
                >
                  ⛪ Lịch Giờ Lễ
                </li>
                <li 
                  onClick={() => setActiveMenu('MANAGE_RADIO')}
                  style={menuItemStyle(activeMenu === 'MANAGE_RADIO')}
                >
                  📻 Radio & Podcast
                </li>
                <li 
                  onClick={() => setActiveMenu('MANAGE_DONATION')}
                  style={menuItemStyle(activeMenu === 'MANAGE_DONATION' || activeMenu === 'EDIT_DONATION')}
                >
                  💖 Từ Thiện & Quyên Góp
                </li>
              </ul>
            </div>
          )}
          
          <a href="/" style={{
             padding: '12px 20px', marginTop: '30px', background: 'var(--color-brand-red)', color: 'white', 
             border: 'none', textAlign: 'left', textDecoration: 'none', fontWeight: 'bold', display: 'block'
          }}>
            &larr; VỀ TRANG CHỦ
          </a>
        </div>
      </div>

      {/* CỘT PHẢI - MAIN CONTENT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* TOPBAR */}
        <div style={{ 
          background: 'white', padding: '15px 30px', borderBottom: '1px solid #e2e8f0', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' 
        }}>
          <div style={{ color: '#64748b', fontSize: '0.95rem' }}>
            <span style={{ fontWeight: 'bold', color: '#334155' }}>Admin Workspace</span> / {activeCategoryName || activeMenu}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', padding: '6px 12px', borderRadius: '20px' }}>
              <div style={{ width: '24px', height: '24px', background: 'var(--color-brand-cyan)', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                👤
              </div>
              <span style={{ fontSize: '0.85rem', color: '#334155', fontWeight: 'bold' }}>{userRole?.role.toUpperCase()}</span>
            </div>
            <button 
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/admin/login');
              }}
              style={{ background: 'transparent', border: '1px solid #cbd5e1', padding: '6px 12px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', color: '#475569', transition: 'all 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <div style={{ flex: 1, padding: '30px', overflowY: 'auto' }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', minHeight: '100%', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

const menuBtnStyle = (isActive: boolean): React.CSSProperties => ({
  background: isActive ? 'linear-gradient(90deg, rgba(6,182,212,0.15) 0%, transparent 100%)' : 'transparent',
  color: isActive ? 'var(--color-brand-cyan)' : '#cbd5e1',
  border: 'none',
  borderLeft: isActive ? '4px solid var(--color-brand-cyan)' : '4px solid transparent',
  padding: '12px 20px 12px 16px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '0.95rem',
  transition: 'all 0.2s ease',
  display: 'block',
  width: '100%',
  fontWeight: isActive ? 'bold' : 'normal',
});

const menuSectionStyle: React.CSSProperties = {
  marginBottom: '15px'
};

const menuSectionTitleStyle: React.CSSProperties = {
  padding: '10px 20px', 
  fontSize: '0.8rem', 
  color: '#94a3b8', 
  fontWeight: 'bold', 
  marginTop: '10px'
};

const menuItemStyle = (isActive: boolean): React.CSSProperties => ({
  background: isActive ? 'linear-gradient(90deg, rgba(6,182,212,0.15) 0%, transparent 100%)' : 'transparent',
  color: isActive ? 'var(--color-brand-cyan)' : '#cbd5e1',
  border: 'none',
  borderLeft: isActive ? '4px solid var(--color-brand-cyan)' : '4px solid transparent',
  padding: '10px 20px 10px 26px',
  textAlign: 'left',
  cursor: 'pointer',
  fontSize: '0.9rem',
  transition: 'all 0.2s',
  display: 'block',
  width: '100%',
  fontWeight: isActive ? 'bold' : 'normal',
});
