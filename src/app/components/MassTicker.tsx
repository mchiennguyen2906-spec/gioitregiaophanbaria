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
      const todayStr = now.toISOString().split('T')[0];
      const masses = await getTodayMassesFromStore(todayStr);
      
      const upcomingList: { name: string, times: string[] }[] = [];

      masses.forEach(m => {
        const timesArray = m.time.split(',').map(t => t.trim());
        
        if (timesArray.length > 0 && timesArray[0] !== '') {
          upcomingList.push({ name: m.parish_name, times: timesArray });
        }
      });

      upcomingList.sort((a, b) => a.times[0].localeCompare(b.times[0]));

      const displayNodes = upcomingList.map(item => (
        <span key={item.name} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {item.name} - {item.times.join(', ')}
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
