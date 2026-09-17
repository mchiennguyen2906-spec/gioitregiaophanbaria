import React, { useState, useEffect } from 'react';
import { getDonationsFromStore, deleteDonation, DonationProgram } from '../../../utils/store';
import toast from 'react-hot-toast';

interface DonationManagerProps {
  onEdit: (donation: DonationProgram) => void;
  onCreateNew: () => void;
}

export default function DonationManager({ onEdit, onCreateNew }: DonationManagerProps) {
  const [donations, setDonations] = useState<DonationProgram[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    const loadDonations = async () => {
      const data = await getDonationsFromStore();
      setDonations(data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    };
    loadDonations();
    window.addEventListener('donation_update', loadDonations);
    window.addEventListener('storage_update', loadDonations);
    return () => {
      window.removeEventListener('donation_update', loadDonations);
      window.removeEventListener('storage_update', loadDonations);
    };
  }, []);

  const requestDelete = (id: string) => {
    setDeletingId(id);
    setShowConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteDonation(deletingId);
      toast.success('Đã xóa chương trình quyên góp!');
    } catch (err: any) {
      toast.error('Lỗi khi xóa: ' + err.message);
    }
    setShowConfirmModal(false);
    setDeletingId(null);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Quản lý Chương Trình Quyên Góp</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0' }}>Tạo và quản lý các đợt quyên góp/thiện nguyện (Tối đa 5 đợt chưa hoàn thành sẽ hiển thị trên trang chủ)</p>
        </div>
        <button 
          onClick={onCreateNew}
          style={{ background: 'var(--color-brand-cyan)', color: 'white', padding: '10px 20px', borderRadius: '6px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
        >
          + Thêm Chương Trình Mới
        </button>
      </div>

      <div style={{ background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto', width: '100%' }}><table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
              <th style={{ padding: '15px', color: '#475569', fontSize: '0.9rem' }}>Tên Chương Trình</th>
              <th style={{ padding: '15px', color: '#475569', fontSize: '0.9rem' }}>Tiến độ</th>
              <th style={{ padding: '15px', color: '#475569', fontSize: '0.9rem' }}>Trạng thái</th>
              <th style={{ padding: '15px', color: '#475569', fontSize: '0.9rem', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {donations.length > 0 ? donations.map(donation => (
              <tr key={donation.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{donation.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>Tạo ngày: {new Date(donation.createdAt).toLocaleDateString('vi-VN')}</div>
                </td>
                <td style={{ padding: '15px' }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-brand-cyan)' }}>
                    {donation.raisedAmount.toLocaleString('vi-VN')} / {donation.targetAmount.toLocaleString('vi-VN')} đ
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', marginTop: '5px' }}>
                    <div style={{ 
                      height: '100%', 
                      background: donation.isCompleted ? '#22c55e' : 'var(--color-brand-red)', 
                      borderRadius: '3px', 
                      width: `${Math.min(100, (donation.raisedAmount / donation.targetAmount) * 100)}%` 
                    }}></div>
                  </div>
                </td>
                <td style={{ padding: '15px' }}>
                  <span style={{
                    padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                    background: donation.isCompleted ? '#dcfce7' : '#fee2e2',
                    color: donation.isCompleted ? '#166534' : '#991b1b'
                  }}>
                    {donation.isCompleted ? 'Đã hoàn thành' : 'Đang chạy'}
                  </span>
                </td>
                <td style={{ padding: '15px', textAlign: 'right' }}>
                  <button onClick={() => onEdit(donation)} style={{ padding: '6px 12px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '4px', cursor: 'pointer', marginRight: '8px' }}>Sửa</button>
                  <button onClick={() => requestDelete(donation.id)} style={{ padding: '6px 12px', background: '#fef2f2', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: '4px', cursor: 'pointer' }}>Xóa</button>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={4} style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>Chưa có chương trình quyên góp nào.</td>
              </tr>
            )}
          </tbody>
        </table></div>
      </div>

      {showConfirmModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div style={{ background: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#0f172a' }}>Xác nhận xóa</h3>
            <p style={{ color: '#475569', marginBottom: '25px', lineHeight: 1.5 }}>
              Bạn có chắc chắn muốn xóa vĩnh viễn chương trình quyên góp này không? Thao tác này không thể hoàn tác.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button 
                onClick={() => setShowConfirmModal(false)}
                style={{ padding: '10px 15px', border: '1px solid #cbd5e1', background: 'white', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Hủy bỏ
              </button>
              <button 
                onClick={handleConfirmDelete}
                style={{ background: '#ef4444', color: 'white', padding: '10px 15px', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                Xóa vĩnh viễn
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

