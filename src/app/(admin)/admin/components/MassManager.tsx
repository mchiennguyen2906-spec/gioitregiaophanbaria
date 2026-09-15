import React, { useState, useEffect } from 'react';
import { getMassSchedulesFromStore, saveMassSchedulesToStore, MassSchedule } from "../../../utils/store";

export default function MassManager() {
  const [schedules, setSchedules] = useState<MassSchedule[]>([]);

  useEffect(() => {
    setSchedules(getMassSchedulesFromStore());
  }, []);

  const handleAdd = () => {
    setSchedules([...schedules, { id: Date.now().toString(), parishName: '', times: ['05:00'] }]);
  };

  const handleUpdate = (id: string, field: keyof MassSchedule, value: string) => {
    setSchedules(schedules.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleUpdateTimes = (id: string, timesStr: string) => {
    const times = timesStr.split(',').map(t => t.trim()).filter(t => t);
    setSchedules(schedules.map(s => s.id === id ? { ...s, times } : s));
  };

  const handleDelete = (id: string) => {
    setSchedules(schedules.filter(s => s.id !== id));
  };

  const handleSave = () => {
    // Validate
    if (schedules.some(s => !s.parishName || s.times.length === 0)) {
      alert('Vui lòng điền đầy đủ Tên Giáo xứ và Giờ lễ cho tất cả các dòng!');
      return;
    }
    saveMassSchedulesToStore(schedules);
    alert('Đã cập nhật Giờ Lễ!');
  };

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '2px solid var(--border-color)', paddingBottom: '10px' }}>
        <h2 style={{ color: 'var(--color-brand-cyan)', margin: 0 }}>Quản lý Giờ Lễ</h2>
        <button onClick={handleAdd} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          + Thêm Giáo xứ
        </button>
      </div>

      <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '20px' }}>
        Nhập danh sách các Nhà thờ / Giáo xứ và giờ lễ. Các giờ lễ nhập cách nhau bằng dấu phẩy (VD: 05:00, 17:30). Dữ liệu này sẽ chạy tự động trên thanh Ticker ở trang chủ mỗi ngày.
      </p>

      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #cbd5e1', textAlign: 'left' }}>
            <th style={{ padding: '12px', width: '40%' }}>Nhà thờ / Giáo xứ *</th>
            <th style={{ padding: '12px', width: '45%' }}>Các Giờ Lễ * (cách nhau dấu phẩy)</th>
            <th style={{ padding: '12px', width: '15%', textAlign: 'center' }}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => (
            <tr key={schedule.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '10px' }}>
                <input 
                  type="text" 
                  value={schedule.parishName} 
                  onChange={e => handleUpdate(schedule.id, 'parishName', e.target.value)}
                  placeholder="VD: Nhà thờ Chính Tòa"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </td>
              <td style={{ padding: '10px' }}>
                <input 
                  type="text" 
                  value={schedule.times.join(', ')} 
                  onChange={e => handleUpdateTimes(schedule.id, e.target.value)}
                  placeholder="05:00, 17:30"
                  style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                />
              </td>
              <td style={{ padding: '10px', textAlign: 'center' }}>
                <button onClick={() => handleDelete(schedule.id)} style={{ background: '#fef2f2', color: '#ef4444', border: '1px solid #f87171', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Xóa
                </button>
              </td>
            </tr>
          ))}
          {schedules.length === 0 && (
            <tr>
              <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: '#64748b' }}>Chưa có dữ liệu. Hãy thêm mới.</td>
            </tr>
          )}
        </tbody>
      </table>

      <button 
        onClick={handleSave}
        style={{ background: 'var(--color-brand-red)', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1.05rem' }}
      >
        Lưu Tất Cả Giờ Lễ
      </button>
    </div>
  );
}
