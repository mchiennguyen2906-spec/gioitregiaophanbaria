"use client";
import { useState, useEffect } from 'react';
import { getTodayMassesFromStore, TodayMass, getSettingFromStore } from '../utils/store';

export default function MassTicker() {
  const [upcoming, setUpcoming] = useState<React.ReactNode[]>([]);
  const [mounted, setMounted] = useState(false);
  const [speed, setSpeed] = useState(60); // Mặc định 60s

  useEffect(() => {
    setMounted(true);
    
    const updateMasses = async () => {
      const now = new Date();
      const currentH = now.getHours();
      const currentM = now.getMinutes();
      const currentHHMM = `${currentH.toString().padStart(2, '0')}:${currentM.toString().padStart(2, '0')}`;

      const todayStr = now.toISOString().split('T')[0];
      const masses = await getTodayMassesFromStore(todayStr);
      
      const upcomingList: { name: string, times: string[] }[] = [];

      masses.forEach(m => {
        const timesArray = m.time.split(',').map(t => t.trim());
        const futureTimes = timesArray.filter(t => t >= currentHHMM);
        
        if (futureTimes.length > 0) {
          upcomingList.push({ name: m.parish_name, times: futureTimes });
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

    const loadSpeed = async () => {
      const spd = await getSettingFromStore('mass_ticker_speed', '60');
      setSpeed(Number(spd));
    };

    updateMasses();
    loadSpeed();
    
    const interval = setInterval(updateMasses, 60000);
    window.addEventListener('storage_update', updateMasses);
    window.addEventListener('storage_update', loadSpeed);
    
    return () => { 
      clearInterval(interval); 
      window.removeEventListener('storage_update', updateMasses); 
      window.removeEventListener('storage_update', loadSpeed);
    };
  }, []);

  if (!mounted) return null;

  return (
    <div className="mass-ticker-wrapper">
      <div className="ticker-label">
        <span style={{marginRight: '8px'}}>🕒</span> GIỜ LỄ HÔM NAY
      </div>
      
      <div className="ticker-content-container">
        <div className="ticker-track" style={{ animationDuration: `${speed}s` }}>
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
