"use client";
import React, { useState, useEffect } from 'react';
import { 
  getParishesFromStore, saveParishToStore, updateParishInStore, deleteParishFromStore, Parish,
  getTodayMassesFromStore, saveTodayMassToStore, updateTodayMassInStore, deleteTodayMassFromStore, syncTodayMasses, TodayMass,
  getSettingFromStore, saveSettingToStore
} from "../../../utils/store";
import toast from 'react-hot-toast';

export default function MassManager() {
  const [activeTab, setActiveTab] = useState<'TODAY' | 'MASTER'>('TODAY');
  
  // -- State for Master (Parishes) --
  const [parishes, setParishes] = useState<Parish[]>([]);
  const [loadingParishes, setLoadingParishes] = useState(false);
  const [editingParishId, setEditingParishId] = useState<string | null>(null);
  
  // -- State for Today Masses --
  const [todayMasses, setTodayMasses] = useState<TodayMass[]>([]);
  const [loadingToday, setLoadingToday] = useState(false);
  const [targetDate, setTargetDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [tickerSpeed, setTickerSpeed] = useState<number>(60);

  useEffect(() => {
    if (activeTab === 'MASTER') loadParishes();
    if (activeTab === 'TODAY') {
      loadTodayMasses();
      loadTickerSpeed();
    }
  }, [activeTab, targetDate]);

  async function loadTickerSpeed() {
    const spd = await getSettingFromStore('mass_ticker_speed', '60');
    setTickerSpeed(Number(spd));
  };

  const handleSpeedChange = async (newSpeed: number) => {
    setTickerSpeed(newSpeed);
    try {
      await saveSettingToStore('mass_ticker_speed', newSpeed.toString(), 'Tốc độ Giờ Lễ');
    } catch (e: any) {
      toast.error('Lỗi lưu tốc độ: ' + e.message);
    }
  };

  async function loadParishes() {
    setLoadingParishes(true);
    setParishes(await getParishesFromStore());
    setLoadingParishes(false);
  };

  async function loadTodayMasses() {
    setLoadingToday(true);
    setTodayMasses(await getTodayMassesFromStore(targetDate));
    setLoadingToday(false);
  };

  const handleSyncToday = async () => {
    if (!confirm(`Bạn có chắc muốn ĐỒNG BỘ GIỜ LỄ ngày (${targetDate}) từ Dữ liệu gốc không? Các giờ lễ tự động hiện tại sẽ bị xóa và tạo lại.`)) return;
    try {
      toast.loading('Đang đồng bộ...', { id: 'sync' });
      await syncTodayMasses(targetDate);
      await loadTodayMasses();
      toast.success('Đồng bộ thành công!', { id: 'sync' });
    } catch (err: any) {
      toast.error('Lỗi đồng bộ: ' + err.message, { id: 'sync' });
    }
  };

  const handleAddParish = async () => {
    try {
      await saveParishToStore({ name: 'Giáo xứ Mới', address: '', map_url: '', schedules: {} });
      toast.success('Đã thêm giáo xứ mới');
      loadParishes();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateParishLocal = (id: string, field: keyof Parish, value: any) => {
    setParishes(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const handleSaveParish = async (p: Parish) => {
    try {
      await updateParishInStore(p.id, { name: p.name, address: p.address, map_url: p.map_url, schedules: p.schedules });
      toast.success('Đã lưu thông tin Giáo xứ');
      // Không gọi loadParishes để tránh mất focus
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateParishScheduleLocal = (id: string, dayName: string, timesStr: string) => {
    const times = timesStr.split(',').map(t => t.trim()).filter(t => t);
    setParishes(prev => prev.map(p => {
      if (p.id !== id) return p;
      return { ...p, schedules: { ...p.schedules, [dayName]: times } };
    }));
  };

  const handleDeleteParish = async (id: string) => {
    if (!confirm('Xóa giáo xứ này?')) return;
    try {
      await deleteParishFromStore(id);
      loadParishes();
    } catch (e: any) { toast.error(e.message); }
  };

  // --- Today Masses Actions ---
  const handleAddTodayMass = async () => {
    try {
      await saveTodayMassToStore({ 
        parish_name: '', address: '', map_url: '', mass_date: targetDate, time: '' 
      });
      toast.success('Đã thêm giờ lễ tay');
      loadTodayMasses();
    } catch (e: any) { toast.error(e.message); }
  };

  const handleUpdateTodayMassLocal = (id: string, field: keyof TodayMass, value: any) => {
    setTodayMasses(prev => prev.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const handleSaveTodayMass = async (m: TodayMass) => {
    try {
      await updateTodayMassInStore(m.id, { parish_name: m.parish_name, time: m.time });
      toast.success('Đã lưu Giờ lễ');
    } catch (e: any) { toast.error(e.message); }
  };

  const handleDeleteTodayMass = async (id: string) => {
    if (!confirm('Xóa giờ lễ này?')) return;
    try {
      await deleteTodayMassFromStore(id);
      loadTodayMasses();
    } catch (e: any) { toast.error(e.message); }
  };

  const btnStyle = (active: boolean) => ({
    padding: '10px 20px', background: active ? 'var(--color-brand-cyan)' : '#e2e8f0', color: active ? 'white' : '#475569',
    border: 'none', fontWeight: 'bold', cursor: 'pointer', borderRadius: '8px 8px 0 0'
  });

  const dayNames = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chúa Nhật"];

  return (
    <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
      <h2 style={{ color: 'var(--color-brand-cyan)', margin: '0 0 20px 0' }}>⛪ Quản lý Giờ Lễ</h2>
      
      <div style={{ display: 'flex', gap: '5px', borderBottom: '2px solid var(--color-brand-cyan)', marginBottom: '20px' }}>
        <button style={btnStyle(activeTab === 'TODAY')} onClick={() => setActiveTab('TODAY')}>
          📅 Giờ Lễ Hôm Nay
        </button>
        <button style={btnStyle(activeTab === 'MASTER')} onClick={() => setActiveTab('MASTER')}>
          ⚙️ Dữ Liệu Gốc (Danh sách Giáo xứ)
        </button>
      </div>

      {activeTab === 'TODAY' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#f8fafc', padding: '15px', borderRadius: '8px', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <label style={{ fontWeight: 'bold' }}>Chọn Ngày:</label>
              <input type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
              <button onClick={handleSyncToday} style={{ background: '#0284c7', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                🔄 ĐỒNG BỘ TỪ DỮ LIỆU GỐC
              </button>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: '#fff', padding: '10px 15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <label style={{ fontWeight: 'bold', fontSize: '0.9rem' }}>⏱ Tốc độ chữ chạy (s):</label>
              <input 
                type="range" 
                min="10" max="300" step="5"
                value={tickerSpeed} 
                onChange={e => handleSpeedChange(Number(e.target.value))} 
                style={{ width: '150px' }}
              />
              <span style={{ fontWeight: 'bold', color: 'var(--color-brand-cyan)' }}>{tickerSpeed}s</span>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>(Càng nhỏ càng nhanh)</span>
            </div>

            <button onClick={handleAddTodayMass} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Thêm lễ linh động
            </button>
          </div>

          <div style={{ overflowX: 'auto', width: '100%' }}><table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#e2e8f0', textAlign: 'left' }}>
                <th style={{ padding: '10px' }}>Giờ</th>
                <th style={{ padding: '10px' }}>Tên Giáo Xứ</th>
                <th style={{ padding: '10px' }}>Loại</th>
                <th style={{ padding: '10px' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loadingToday ? <tr><td colSpan={5} style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</td></tr> : 
               todayMasses.map(mass => (
                <tr key={mass.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '10px' }}>
                    <input type="text" value={mass.time} placeholder="VD: 04:00, 17:00" onChange={e => handleUpdateTodayMassLocal(mass.id, 'time', e.target.value)} style={{ padding: '5px', width: '100px' }} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    <input type="text" value={mass.parish_name} onChange={e => handleUpdateTodayMassLocal(mass.id, 'parish_name', e.target.value)} style={{ padding: '5px', width: '100%' }} />
                  </td>
                  <td style={{ padding: '10px' }}>
                    {mass.is_custom ? <span style={{ color: '#d97706', fontWeight: 'bold', fontSize: '0.8rem' }}>Thêm tay</span> : <span style={{ color: '#16a34a', fontSize: '0.8rem' }}>Tự động</span>}
                  </td>
                  <td style={{ padding: '10px' }}>
                    <button onClick={() => handleSaveTodayMass(mass)} style={{ color: 'white', background: '#3b82f6', cursor: 'pointer', border: 'none', padding: '5px 10px', borderRadius: '4px', marginRight: '10px' }}>💾 Lưu</button>
                    <button onClick={() => handleDeleteTodayMass(mass.id)} style={{ color: 'red', cursor: 'pointer', border: 'none', background: 'none' }}>🗑 Xóa</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table></div>
          {todayMasses.length === 0 && !loadingToday && <p style={{ textAlign: 'center', color: '#64748b', marginTop: '20px' }}>Chưa có giờ lễ nào. Hãy bấm ĐỒNG BỘ.</p>}
        </div>
      )}

      {activeTab === 'MASTER' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
            <p style={{ margin: 0, color: '#64748b' }}>Nhập lịch cố định cho các giáo xứ. Dữ liệu này sẽ dùng để tự động bốc ra cho "Giờ Lễ Hôm Nay".</p>
            <button onClick={handleAddParish} style={{ background: '#10b981', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
              + Thêm Giáo Xứ Mới
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {loadingParishes ? <p>Đang tải...</p> : parishes.map(p => (
              <div key={p.id} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: '#f8fafc', padding: '15px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <input type="text" value={p.name} onChange={e => handleUpdateParishLocal(p.id, 'name', e.target.value)} style={{ fontSize: '1.1rem', fontWeight: 'bold', padding: '5px', border: '1px solid transparent', background: 'transparent', width: '100%' }} />
                    <input type="text" value={p.address} onChange={e => handleUpdateParishLocal(p.id, 'address', e.target.value)} placeholder="Địa chỉ..." style={{ fontSize: '0.9rem', padding: '5px', width: '100%', marginTop: '5px' }} />
                    <input type="text" value={p.map_url} onChange={e => handleUpdateParishLocal(p.id, 'map_url', e.target.value)} placeholder="Link Google Map..." style={{ fontSize: '0.9rem', padding: '5px', width: '100%', marginTop: '5px' }} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px', marginLeft: '20px', alignItems: 'center' }}>
                    <button onClick={() => handleSaveParish(p)} style={{ padding: '8px 12px', cursor: 'pointer', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px' }}>💾 Lưu</button>
                    <button onClick={() => setEditingParishId(editingParishId === p.id ? null : p.id)} style={{ padding: '8px 12px', cursor: 'pointer' }}>
                      {editingParishId === p.id ? 'Đóng Lịch' : 'Sửa Lịch Tuần'}
                    </button>
                    <button onClick={() => handleDeleteParish(p.id)} style={{ color: 'red', cursor: 'pointer', padding: '8px 12px', background: 'none', border: 'none' }}>Xóa</button>
                  </div>
                </div>

                {editingParishId === p.id && (
                  <div style={{ padding: '15px', borderTop: '1px solid #cbd5e1', background: '#fff' }}>
                    <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#64748b' }}>Nhập giờ theo định dạng 24h, cách nhau bằng dấu phẩy. VD: 05:00, 17:30</p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {dayNames.map(day => (
                        <div key={day} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <label style={{ width: '80px', fontWeight: 'bold', fontSize: '0.9rem' }}>{day}:</label>
                          <input 
                            type="text" 
                            value={(p.schedules[day] || []).join(', ')}
                            onChange={e => handleUpdateParishScheduleLocal(p.id, day, e.target.value)}
                            placeholder="VD: 05:00, 17:30"
                            style={{ flex: 1, padding: '8px', border: '1px solid #cbd5e1', borderRadius: '4px' }} 
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

