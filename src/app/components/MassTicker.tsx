"use client";
import { useState, useEffect } from 'react';
import { getTodayMassesFromStore, TodayMass } from '../utils/store';

export default function MassTicker() {
  const [upcoming, setUpcoming] = useState<React.ReactNode[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const updateMasses = async () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentHHMM = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;

      const todayStr = now.toISOString().split('T')[0];
      const masses = await getTodayMassesFromStore(todayStr);
      
      // Nhóm lại theo tên giáo xứ
      const grouped: Record<string, string[]> = {};
      masses.forEach(m => {
        if (!grouped[m.parish_name]) grouped[m.parish_name] = [];
        grouped[m.parish_name].push(m.time);
      });

      let upcomingList: { name: string, times: string[] }[] = [];

      Object.keys(grouped).forEach(name => {
        const futureTimes = grouped[name].filter(t => t >= currentHHMM);
        if (futureTimes.length > 0) {
          upcomingList.push({ name, times: futureTimes });
        }
      });

      upcomingList.sort((a, b) => a.times[0].localeCompare(b.times[0]));

      const displayNodes = upcomingList.map(item => (
        <span key={item.name} style={{ display: 'inline-flex', alignItems: 'center' }}>
          Giáo xứ {item.name} - {item.times.join(', ')}
        </span>
      ));
      
      if (displayNodes.length === 0) {
        setUpcoming([<span key="hetle2">Hiện tại đã hết các thánh lễ trong ngày hôm nay.</span>]);
      } else {
        setUpcoming(displayNodes);
      }
    };

    updateMasses();
    const interval = setInterval(updateMasses, 60000);
    window.addEventListener('storage_update', updateMasses);
    return () => { clearInterval(interval); window.removeEventListener('storage_update', updateMasses); };
  }, []);

  if (!mounted) return null;

  return (
    <div className="mass-ticker-wrapper">
      <div className="ticker-label">
        <span style={{marginRight: '8px'}}>🕒</span> GIỜ LỄ HÔM NAY
      </div>
      
      <div className="ticker-content-container">
        <div className="ticker-track">
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
