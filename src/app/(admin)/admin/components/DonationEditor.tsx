import React, { useState, useEffect } from 'react';
import { getArticlesFromStore, addDonation, updateDonation, DonationProgram, Article } from '../../../utils/store';
import { slugMap } from '../../../utils/categoryMap';
import toast from 'react-hot-toast';

interface DonationEditorProps {
  donationToEdit?: DonationProgram | null;
  onSave: () => void;
  onCancel: () => void;
}

export default function DonationEditor({ donationToEdit, onSave, onCancel }: DonationEditorProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState<number | ''>('');
  const [raisedAmount, setRaisedAmount] = useState<number | ''>('');
  const [bankInfo, setBankInfo] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [linkedArticleId, setLinkedArticleId] = useState('');
  const [isCompleted, setIsCompleted] = useState(false);
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchArticle, setSearchArticle] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchArticles = async () => {
      const arts = await getArticlesFromStore(true);
      setArticles(arts);
    };
    fetchArticles();
    
    if (donationToEdit) {
      setName(donationToEdit.name || '');
      setDescription(donationToEdit.description || '');
      setTargetAmount(donationToEdit.targetAmount || '');
      setRaisedAmount(donationToEdit.raisedAmount || 0);
      setBankInfo(donationToEdit.bankInfo || '');
      setQrCodeUrl(donationToEdit.qrCodeUrl || '');
      setLinkedArticleId(donationToEdit.linkedArticleId || '');
      setIsCompleted(donationToEdit.isCompleted || false);
    }
  }, [donationToEdit]);

  useEffect(() => {
    if (typeof targetAmount === 'number' && typeof raisedAmount === 'number') {
      if (raisedAmount >= targetAmount && targetAmount > 0) {
        setIsCompleted(true);
      }
    }
  }, [targetAmount, raisedAmount]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    // Client-side compression
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Max 800x800
        const MAX_SIZE = 800;
        if (width > height && width > MAX_SIZE) {
          height *= MAX_SIZE / width;
          width = MAX_SIZE;
        } else if (height > MAX_SIZE) {
          width *= MAX_SIZE / height;
          height = MAX_SIZE;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            setIsUploading(false);
            return;
        }
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          if (!blob) {
            setIsUploading(false);
            return;
          }
          const formData = new FormData();
          formData.append('file', new File([blob], file.name, { type: 'image/jpeg' }));
          
          if (qrCodeUrl) formData.append('oldFileUrl', qrCodeUrl);

          try {
            const res = await fetch('/api/upload', {
              method: 'POST',
              body: formData
            });
            const result = await res.json();
            if (result.success) {
              setQrCodeUrl(result.url);
              toast.success('Đã tải ảnh QR Code lên!');
            } else {
              toast.error('Lỗi khi tải ảnh lên!');
            }
          } catch (err) {
            console.error(err);
            toast.error('Lỗi kết nối khi tải ảnh lên!');
          }
          setIsUploading(false);
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!name || !targetAmount) {
      toast.error('Vui lòng nhập Tên chương trình và Số tiền mục tiêu!');
      return;
    }

    const data = {
      name,
      description,
      targetAmount: Number(targetAmount),
      raisedAmount: Number(raisedAmount) || 0,
      bankInfo,
      qrCodeUrl,
      linkedArticleId,
      isCompleted
    };

    setIsSaving(true);
    try {
      if (donationToEdit) {
        await updateDonation(donationToEdit.id, data);
        toast.success('Đã cập nhật chương trình!');
      } else {
        await addDonation(data);
        toast.success('Đã tạo chương trình quyên góp mới!');
      }
      onSave();
    } catch (err: any) {
      toast.error('Lỗi khi lưu: ' + err.message);
    }
    setIsSaving(false);
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchArticle.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '30px', alignItems: 'start' }}>
      
      {/* CỘT TRÁI - MAIN CONTENT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ margin: 0, color: 'var(--color-brand-cyan)' }}>{donationToEdit ? 'Sửa Chương Trình Quyên Góp' : 'Tạo Chương Trình Quyên Góp'}</h2>
        </div>

        <div>
          <label style={labelStyle}>Tên chương trình quyên góp *</label>
          <input style={inputStyle} type="text" placeholder="VD: Quỹ học bổng mồ côi" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Mô tả ngắn</label>
          <textarea style={{...inputStyle, minHeight: '120px'}} placeholder="Thông tin tóm tắt về đợt quyên góp..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Số tiền mục tiêu (VNĐ) *</label>
            <input style={inputStyle} type="number" placeholder="VD: 50000000" value={targetAmount} onChange={e => setTargetAmount(Number(e.target.value) || '')} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Số tiền đã đạt được (VNĐ)</label>
            <input style={inputStyle} type="number" placeholder="VD: 15500000" value={raisedAmount} onChange={e => setRaisedAmount(Number(e.target.value) || '')} />
          </div>
        </div>

        <div>
          <label style={labelStyle}>Thông tin chuyển khoản (Bank)</label>
          <textarea style={{...inputStyle, minHeight: '100px'}} placeholder="Ngân hàng - Số tài khoản - Chủ tài khoản" value={bankInfo} onChange={e => setBankInfo(e.target.value)} />
        </div>
      </div>

      {/* CỘT PHẢI - SETTINGS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Nút hành động */}
        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Đăng Tải</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button disabled={isSaving} onClick={handleSave} style={primaryBtnStyle}>
              {isSaving ? 'Đang lưu...' : (donationToEdit ? 'Cập nhật' : 'Đăng chương trình')}
            </button>
            <button disabled={isSaving} onClick={onCancel} style={secondaryBtnStyle}>
              Hủy bỏ
            </button>
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Trạng Thái</h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-red)' }}>
            <input type="checkbox" checked={isCompleted} onChange={e => setIsCompleted(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đã Hoàn Thành (Sẽ ẩn khỏi Trang chủ)
          </label>
        </div>

        <div style={boxStyle}>
          <h3 style={boxTitleStyle}>Ảnh QR Code</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {qrCodeUrl && (
              <img loading="lazy" src={qrCodeUrl} alt="QR" style={{ width: '100%', height: 'auto', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'cover' }} />
            )}
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleImageUpload}
              style={{ fontSize: '0.9rem' }}
              disabled={isUploading}
            />
            {isUploading && <span style={{ fontSize: '0.85rem', color: '#64748b' }}>Đang tải lên...</span>}
            <input 
              style={inputStyle} 
              type="text" 
              placeholder="Hoặc dán link ảnh https://..." 
              value={qrCodeUrl} 
              onChange={e => setQrCodeUrl(e.target.value)} 
            />
          </div>
        </div>

        <div style={boxStyle}>
          <h3 style={{...boxTitleStyle, color: 'var(--color-brand-cyan)'}}>🔗 Gắn Link Bài Viết</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Khi xem chi tiết, hệ thống sẽ chuyển đến bài viết này.</p>
          <input 
            style={{...inputStyle, marginBottom: '10px'}} 
            type="text" 
            placeholder="🔍 Tìm kiếm bài viết..." 
            value={searchArticle} 
            onChange={e => setSearchArticle(e.target.value)} 
          />
          <select 
            style={inputStyle} 
            value={linkedArticleId} 
            onChange={e => setLinkedArticleId(e.target.value)}
          >
            <option value="">-- Không gắn link bài viết --</option>
            {filteredArticles.map(a => (
              <option key={a.id} value={a.id}>
                [{slugMap[a.categoryId] || a.categoryId}] {a.title}
              </option>
            ))}
          </select>
        </div>

      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outlineColor: 'var(--color-brand-cyan)' };
const boxStyle = { background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' };
const boxTitleStyle = { marginTop: 0, marginBottom: '15px', color: '#1e293b', fontSize: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' };
const primaryBtnStyle = { background: 'var(--color-brand-cyan)', color: 'white', padding: '12px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };
const secondaryBtnStyle = { background: '#f1f5f9', color: '#475569', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold', width: '100%', transition: 'background 0.2s' };

