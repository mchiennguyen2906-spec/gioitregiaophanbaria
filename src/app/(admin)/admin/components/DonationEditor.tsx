import React, { useState, useEffect } from 'react';
import { getArticlesFromStore, addDonation, updateDonation, DonationProgram, Article } from '../../../utils/store';
import { slugMap } from '../../../utils/categoryMap';

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

  useEffect(() => {
    setArticles(getArticlesFromStore());
    
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
        if (!ctx) return;
        
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(async (blob) => {
          if (!blob) return;
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
            } else {
              alert('Lỗi khi tải ảnh lên!');
            }
          } catch (err) {
            console.error(err);
            alert('Lỗi kết nối khi tải ảnh lên!');
          }
        }, 'image/jpeg', 0.8);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (!name || !targetAmount) {
      alert('Vui lòng nhập Tên chương trình và Số tiền mục tiêu!');
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

    if (donationToEdit) {
      updateDonation(donationToEdit.id, data);
      alert('Đã cập nhật chương trình!');
    } else {
      addDonation(data);
      alert('Đã tạo chương trình quyên góp mới!');
    }
    onSave();
  };

  const filteredArticles = articles.filter(a => 
    a.title.toLowerCase().includes(searchArticle.toLowerCase())
  ).slice(0, 50);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', background: '#fff', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>{donationToEdit ? 'Sửa Chương Trình Quyên Góp' : 'Tạo Chương Trình Quyên Góp'}</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={onCancel} style={{
            background: '#f1f5f9', color: '#334155', padding: '10px 15px', 
            borderRadius: '6px', border: '1px solid #cbd5e1', cursor: 'pointer', fontWeight: 'bold'
          }}>Hủy</button>
          
          <button onClick={handleSave} style={{
            background: 'var(--color-brand-red)', color: 'white', padding: '10px 15px', 
            borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold'
          }}>Lưu Chương Trình</button>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={labelStyle}>Tên chương trình quyên góp *</label>
          <input style={inputStyle} type="text" placeholder="VD: Quỹ học bổng mồ côi" value={name} onChange={e => setName(e.target.value)} />
        </div>

        <div>
          <label style={labelStyle}>Mô tả ngắn</label>
          <textarea style={{...inputStyle, minHeight: '80px'}} placeholder="Thông tin tóm tắt về đợt quyên góp..." value={description} onChange={e => setDescription(e.target.value)} />
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

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Thông tin chuyển khoản (Bank)</label>
            <textarea style={{...inputStyle, minHeight: '80px'}} placeholder="Vietcombank - 123456789 - Ban Caritas" value={bankInfo} onChange={e => setBankInfo(e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Ảnh QR Code (Upload file hoặc dán Link)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload}
                style={{ fontSize: '0.9rem' }}
              />
              <div style={{ fontSize: '0.8rem', color: '#64748b', fontStyle: 'italic' }}>
                Ảnh tải lên sẽ được tự động nén nhỏ gọn.
              </div>
              <input 
                style={inputStyle} 
                type="text" 
                placeholder="Hoặc dán link ảnh https://..." 
                value={qrCodeUrl} 
                onChange={e => setQrCodeUrl(e.target.value)} 
              />
            </div>
            {qrCodeUrl && <img src={qrCodeUrl} alt="QR Code" style={{ width: '80px', height: '80px', marginTop: '10px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ccc' }} />}
          </div>
        </div>

        <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <label style={{...labelStyle, color: 'var(--color-brand-cyan)'}}>🔗 Gắn Link Bài Viết Thiện Nguyện (Tùy chọn)</label>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px' }}>Tìm kiếm và chọn bài viết liên quan. Khi bấm "Xem chi tiết", hệ thống sẽ chuyển đến bài viết này. Khi quyên góp hoàn thành, bài viết này cũng sẽ được gắn nhãn "Đã hoàn thành".</p>
          <input 
            style={{...inputStyle, marginBottom: '10px'}} 
            type="text" 
            placeholder="🔍 Nhập tên bài viết để tìm..." 
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

        <div style={{ marginTop: '10px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 600, color: 'var(--color-brand-red)' }}>
            <input type="checkbox" checked={isCompleted} onChange={e => setIsCompleted(e.target.checked)} style={{ width: '18px', height: '18px' }} />
            Đánh dấu Đã Hoàn Thành (Sẽ ẩn khỏi Trang chủ, chuyển vào lịch sử)
          </label>
        </div>

      </div>
    </div>
  );
}

const labelStyle = { display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#334155', fontSize: '0.9rem' };
const inputStyle = { width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '1rem', outlineColor: 'var(--color-brand-cyan)' };
