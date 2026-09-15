"use client";
import { useState, useEffect } from 'react';
import { getMassSchedulesFromStore, MassSchedule } from '../utils/store';

export default function MassTicker() {
  const [upcoming, setUpcoming] = useState<React.ReactNode[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Hàm cập nhật giờ lễ
    const updateMasses = async () => {
      const now = new Date();
      // Test mode: Bạn có thể đổi now.setHours(...) để test
      // now.setHours(16, 0, 0); 
      
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentHHMM = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;

      const schedules = await getMassSchedulesFromStore();
      
      let upcomingList: { name: string, times: string[] }[] = [];

      schedules.forEach(p => {
        const futureTimes = p.times.filter(t => t >= currentHHMM);
        if (futureTimes.length > 0) {
          upcomingList.push({ name: p.parishName, times: futureTimes });
        }
      });

      upcomingList.sort((a, b) => a.times[0].localeCompare(b.times[0]));

      const displayNodes = upcomingList.map(item => (
        <span key={item.name} style={{ display: 'inline-flex', alignItems: 'center' }}>
          Giáo xứ {item.name} - {item.times.join(', ')}
        </span>
      ));
      
      if (displayNodes.length === 0) {
        let tomorrowList: { name: string, times: string[] }[] = [];
        
        schedules.forEach(p => {
          const morningTimes = p.times.filter(t => t < "12:00");
          if (morningTimes.length > 0) {
            tomorrowList.push({ name: p.parishName, times: morningTimes });
          }
        });
        
        tomorrowList.sort((a, b) => a.times[0].localeCompare(b.times[0]));
        const tomorrowNodes = tomorrowList.map(item => (
          <span key={item.name} style={{ display: 'inline-flex', alignItems: 'center' }}>
            Sáng mai: Giáo xứ {item.name} - {item.times.join(', ')}
          </span>
        ));
        
        if (tomorrowNodes.length > 0) {
          setUpcoming([<span key="hetle">(Hết lễ hôm nay)</span>, ...tomorrowNodes]);
        } else {
          setUpcoming([<span key="hetle2">Hiện tại đã hết các thánh lễ. Xin hẹn quý vị vào ngày mai.</span>]);
        }
      } else {
        setUpcoming(displayNodes);
      }
    };

    updateMasses();
    // Cập nhật lại mỗi phút để giờ lễ nào qua rồi thì biến mất
    const interval = setInterval(updateMasses, 60000);
    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null; // Tránh lỗi Hydration Mismatch của Next.js

  return (
    <div className="mass-ticker-wrapper">
      {/* Cột nhãn cố định */}
      <div className="ticker-label">
        <span style={{marginRight: '8px'}}>🕒</span> GIỜ LỄ HÔM NAY
      </div>
      
      {/* Vùng nội dung chữ chạy */}
      <div className="ticker-content-container">
        <div className="ticker-track">
          {/* Lặp lại mảng 2 lần để tạo hiệu ứng chạy vô tận không bị ngắt quãng */}
          {[...upcoming, ...upcoming].map((item, index) => (
            <span key={index} className="ticker-item">
              <span style={{color: 'var(--color-brand-gold)', marginRight: '8px'}}>✦</span>
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
